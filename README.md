# NeuroKey 🧠🔐

**NeuroKey** is a next-generation, AI-enhanced password manager built with **React Native** and **Zero-Knowledge Architecture**.

Unlike traditional managers, NeuroKey uses on-device AI to assist users with memory and security hygiene without ever sending sensitive data to the cloud.

## 🚀 Key Features

* **Zero-Knowledge Security:** Client-side AES-256-GCM encryption. The master password never leaves the device.
* **AI-Powered Memory Hints:** Uses local NLP to generate personalized cognitive hints for passwords instead of revealing them.
* **Smart Breach Detection:** On-device ML analysis to detect weak or common password patterns.
* **BYOS (Bring Your Own Storage):** Syncs encrypted vaults via the user's personal Google Drive (No proprietary cloud servers).

## 🛠 Tech Stack

* **Mobile:** React Native (Expo)
* **Core Logic:** JavaScript / C# (Planned Desktop)
* **State Management:** Redux Toolkit
* **Encryption:** Argon2 (KDF) & AES-GCM
* **AI Engine:** TensorFlow Lite / ONNX Runtime (Mobile)

## 📦 Installation

1.  Clone the repo:
    ```bash
    git clone [https://github.com/yourusername/neurokey.git](https://github.com/yourusername/neurokey.git)
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run on device:
    ```bash
    npx expo start
    ```

## 🛡 Security Architecture

* **Master Key:** Derived using Argon2id with a unique salt per user.
* **Vault Data:** Encrypted with AES-256-GCM.
* **Storage:** Local SecureStore (iOS/Android) & Encrypted JSON sync.

---
*Built with ❤️ by [Your Name] for the AI Master's Portfolio.*
