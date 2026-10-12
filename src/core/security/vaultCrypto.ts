import "react-native-get-random-values"; // MUST stay first: provides crypto.getRandomValues
import CryptoJS from "crypto-js";

/**
 * NeuroKey vault crypto (format "nk2").
 *
 * - Key derivation: PBKDF2-HMAC-SHA256 → 256-bit master key (iterations stored per vault).
 * - Sub-keys: encKey = HMAC-SHA256(master, "neurokey-enc"), macKey = HMAC-SHA256(master, "neurokey-mac").
 * - Encryption: AES-256-CBC with a random 128-bit IV, then HMAC-SHA256 over
 *   "nk2.<iv>.<ciphertext>" (encrypt-then-MAC). Any tampering makes decryption fail.
 * - Output: "nk2.<iv b64>.<ciphertext b64>.<tag b64>"
 *
 * The exact same format is implemented in neurokey-desktop/src/core/vaultCrypto.ts
 * so that sync payloads can be exchanged between the two apps.
 */

export const VAULT_FORMAT = "nk2";
export const KDF_ALGORITHM = "pbkdf2-sha256";

// Pure-JS PBKDF2 is slow on Hermes; 100k keeps a password unlock to a few seconds.
// Stored per vault, so it can be raised later (e.g. with a native KDF) without breaking vaults.
export const MOBILE_KDF_ITERATIONS = 100_000;

const VERIFIER_PLAINTEXT = "NEUROKEY_VAULT_V2";

export interface KdfParams {
  alg: typeof KDF_ALGORITHM;
  iterations: number;
}

// --- Encoding helpers -------------------------------------------------------

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** Cryptographically secure random bytes as a hex string. */
export const randomHex = (byteLength: number): string => {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
};

/**
 * Uniform random integer in [0, max) from the OS CSPRNG.
 * Rejection sampling avoids the modulo bias of `value % max`.
 */
export const secureRandomInt = (max: number): number => {
  if (!Number.isInteger(max) || max <= 0 || max > 2 ** 32) {
    throw new RangeError("max must be an integer in (0, 2^32]");
  }
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
};

/** Length-independent string comparison (avoids leaking where tags differ). */
const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

const expandKey = (masterKeyHex: string) => {
  const master = CryptoJS.enc.Hex.parse(masterKeyHex);
  return {
    enc: CryptoJS.HmacSHA256("neurokey-enc", master),
    mac: CryptoJS.HmacSHA256("neurokey-mac", master),
  };
};

// --- Key derivation ---------------------------------------------------------

export const generateSalt = (): string => randomHex(16);

/** Derives the 256-bit vault master key (hex) from the master password. */
export const deriveVaultKey = async (
  password: string,
  saltHex: string,
  params: KdfParams,
): Promise<string> => {
  if (params.alg !== KDF_ALGORITHM) {
    throw new Error(`Unsupported KDF: ${params.alg}`);
  }
  return CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(saltHex), {
    keySize: 256 / 32,
    iterations: params.iterations,
    hasher: CryptoJS.algo.SHA256,
  }).toString(CryptoJS.enc.Hex);
};

// --- Authenticated encryption -----------------------------------------------

export const encrypt = (plaintext: string, keyHex: string): string => {
  const { enc, mac } = expandKey(keyHex);
  const iv = CryptoJS.enc.Hex.parse(randomHex(16));
  const ciphertext = CryptoJS.AES.encrypt(plaintext, enc, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).ciphertext;

  const body = `${VAULT_FORMAT}.${iv.toString(CryptoJS.enc.Base64)}.${ciphertext.toString(CryptoJS.enc.Base64)}`;
  const tag = CryptoJS.HmacSHA256(body, mac).toString(CryptoJS.enc.Base64);
  return `${body}.${tag}`;
};

/** Returns null if the key is wrong or the data was modified. */
export const decrypt = (payload: string, keyHex: string): string | null => {
  try {
    const parts = payload.split(".");
    if (parts.length !== 4 || parts[0] !== VAULT_FORMAT) return null;
    const [, ivB64, ctB64, tagB64] = parts;

    const { enc, mac } = expandKey(keyHex);
    const expectedTag = CryptoJS.HmacSHA256(
      `${VAULT_FORMAT}.${ivB64}.${ctB64}`,
      mac,
    ).toString(CryptoJS.enc.Base64);
    if (!timingSafeEqual(expectedTag, tagB64)) return null;

    const decrypted = CryptoJS.AES.decrypt(
      CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(ctB64),
      }),
      enc,
      {
        iv: CryptoJS.enc.Base64.parse(ivB64),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export const isEncryptedPayload = (value: string) =>
  value.startsWith(`${VAULT_FORMAT}.`);

// --- Master password verifier -----------------------------------------------

export const createVerifier = (keyHex: string) =>
  encrypt(VERIFIER_PLAINTEXT, keyHex);

export const checkVerifier = (verifier: string, keyHex: string) =>
  decrypt(verifier, keyHex) === VERIFIER_PLAINTEXT;

// --- Legacy (v1) support: only used to migrate existing vaults --------------

/** @deprecated v1 derivation (PBKDF2-SHA256, 5,000 iterations). Migration only. */
export const legacyDeriveKey = (password: string, salt: string): string =>
  CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 5000 }).toString();

/** @deprecated v1 verifier check. Migration only. */
export const legacyCheckVerifier = (token: string, legacyKey: string) => {
  try {
    return (
      CryptoJS.AES.decrypt(token, legacyKey).toString(CryptoJS.enc.Utf8) ===
      "VALID_TOKEN"
    );
  } catch {
    return false;
  }
};
