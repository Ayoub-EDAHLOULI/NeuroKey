import * as Crypto from "expo-crypto";

export const checkPasswordLeak = async (password: string): Promise<number> => {
  try {
    // 1. Hash the password using SHA-1
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      password,
    );

    // 2. Prepare k-Anonymity (Split hash)
    // The API expects the hash in Uppercase
    const hash = digest.toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // 3. Query the API with ONLY the first 5 chars
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
    );
    if (!response.ok) return 0;

    const data = await response.text();

    // 4. Check results locally
    // The API returns lines like: SUFFIX:COUNT
    const lines = data.split("\n");
    const match = lines.find((line) => line.startsWith(suffix));

    if (match) {
      // Return the number of times it was leaked
      const count = match.split(":")[1];
      return parseInt(count, 10);
    }

    return 0; // Safe!
  } catch (error) {
    console.error("Breach check failed:", error);
    return 0; // Fail safe
  }
};
