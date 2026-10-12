import * as SecureStore from "expo-secure-store";
import {
  checkVerifier,
  createVerifier,
  deriveVaultKey,
  generateSalt,
  KDF_ALGORITHM,
  KdfParams,
  legacyCheckVerifier,
  legacyDeriveKey,
  MOBILE_KDF_ITERATIONS,
} from "./vaultCrypto";

// SecureStore keys (Android Keystore / iOS Keychain backed)
const K = {
  email: "user_email",
  salt: "vault_salt",
  kdf: "vault_kdf",
  verifier: "vault_validation",
  biometricKey: "vault_key_biometric",
  legacyPassword: "auth_password", // v1 stored the master password itself — removed on migration
} as const;

const currentKdf = (): KdfParams => ({
  alg: KDF_ALGORITHM,
  iterations: MOBILE_KDF_ITERATIONS,
});

const writeKeyMaterial = async (password: string) => {
  const salt = generateSalt();
  const kdf = currentKdf();
  const key = await deriveVaultKey(password, salt, kdf);
  await SecureStore.setItemAsync(K.salt, salt);
  await SecureStore.setItemAsync(K.verifier, createVerifier(key));
  await SecureStore.setItemAsync(K.kdf, JSON.stringify(kdf));
  return key;
};

export const getSavedEmail = () => SecureStore.getItemAsync(K.email);

/** Creates a new vault and returns its master key. */
export const createVault = async (email: string, password: string) => {
  await SecureStore.setItemAsync(K.email, email);
  return writeKeyMaterial(password);
};

/**
 * Verifies the master password and returns the vault key, or null if wrong.
 * v1 vaults (5,000 iterations, no KDF params) are upgraded transparently.
 */
export const unlockWithPassword = async (
  password: string,
): Promise<string | null> => {
  const [salt, verifier, kdfJson] = await Promise.all([
    SecureStore.getItemAsync(K.salt),
    SecureStore.getItemAsync(K.verifier),
    SecureStore.getItemAsync(K.kdf),
  ]);
  if (!salt || !verifier) return null;

  if (kdfJson) {
    const key = await deriveVaultKey(password, salt, JSON.parse(kdfJson));
    return checkVerifier(verifier, key) ? key : null;
  }

  // --- v1 migration ---
  if (!legacyCheckVerifier(verifier, legacyDeriveKey(password, salt))) {
    return null;
  }
  const key = await writeKeyMaterial(password);
  await SecureStore.deleteItemAsync(K.legacyPassword);
  return key;
};

// --- Biometric unlock -------------------------------------------------------
// The vault key (never the password) is stored in an item that the OS only
// releases after a successful biometric check.

export const saveBiometricKey = (key: string) =>
  SecureStore.setItemAsync(K.biometricKey, key, {
    requireAuthentication: true,
    authenticationPrompt: "Enable biometric unlock",
  });

/** Prompts for biometrics. Returns null if cancelled, missing or invalidated. */
export const getBiometricKey = async (): Promise<string | null> => {
  try {
    const key = await SecureStore.getItemAsync(K.biometricKey, {
      requireAuthentication: true,
      authenticationPrompt: "Unlock NeuroKey",
    });
    if (!key) return null;

    const [verifier, kdfJson] = await Promise.all([
      SecureStore.getItemAsync(K.verifier),
      SecureStore.getItemAsync(K.kdf),
    ]);
    // Stale key (e.g. vault was recreated): discard it
    if (!verifier || !kdfJson || !checkVerifier(verifier, key)) {
      await clearBiometricKey();
      return null;
    }
    return key;
  } catch {
    // Cancelled, or biometrics changed since enrollment (key invalidated by the OS)
    return null;
  }
};

export const clearBiometricKey = () =>
  SecureStore.deleteItemAsync(K.biometricKey);

/** Removes every secret stored for the vault on this device. */
export const wipeVaultSecrets = async () => {
  await Promise.all(Object.values(K).map((k) => SecureStore.deleteItemAsync(k)));
};
