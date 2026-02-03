import CryptoJS from "crypto-js";
import * as SecureStore from "expo-secure-store";
import "react-native-get-random-values"; // MUST be the first import to polyfill crypto
import { v4 as uuidv4 } from "uuid";

// CONFIGURATION
// In a real app, 10000+ iterations is safer, but slower on JS.
// We start with 5000 for smooth testing on Expo Go.
const ITERATIONS = 5000;
const KEY_SIZE = 256 / 32; // 256-bit key

/**
 * 1. GENERATE ENCRYPTION KEY (PBKDF2)
 * Turns the user's master password (e.g., "P@ssw0rd123") into a cryptographic key.
 */
export const deriveKey = (password: string, salt: string): string => {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });
  return key.toString(); // Returns the Hex string of the key
};

/**
 * 2. ENCRYPT DATA (AES-256)
 */
export const encryptData = (text: string, secretKey: string): string | null => {
  try {
    const ciphertext = CryptoJS.AES.encrypt(text, secretKey).toString();
    return ciphertext;
  } catch (error) {
    console.error("Encryption Failed:", error);
    return null;
  }
};

/**
 * 3. DECRYPT DATA (AES-256)
 */
export const decryptData = (
  ciphertext: string,
  secretKey: string,
): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption fails (wrong key), originalText will be empty
    return originalText || null;
  } catch (error) {
    console.error("Decryption Failed (Wrong Password?):", error);
    return null;
  }
};

/**
 * 4. SECURE STORAGE WRAPPERS
 * Helper to save/load sensitive items like the User ID or Salt safely on the device.
 */
export const saveSecureItem = async (
  key: string,
  value: string,
): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

export const generateSalt = (): string => {
  return uuidv4(); // Simple unique salt
};
