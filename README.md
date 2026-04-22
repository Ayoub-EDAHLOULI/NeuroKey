# 🧠 NeuroKey - Biometric Password Manager

**NeuroKey** is a secure, offline-first password manager built with **React Native** and **Expo**. It features military-grade encryption, biometric authentication, and AI-powered breach detection to keep digital identities safe.

[Insert Screenshot of your App Here]

## 🚀 Key Features

### 🔒 Security First
- **Zero-Knowledge Architecture:** Data is encrypted locally. We cannot see your passwords.
- **AES-256 Encryption:** All vault data is encrypted using the Advanced Encryption Standard before being stored.
- **Biometric Lock:** Supports FaceID, TouchID, and Android Biometrics via `expo-local-authentication`.

### 🛡️ Breach Radar (AI Feature)
- **k-Anonymity Checks:** Checks passwords against a database of 800M+ leaked credentials *without* ever sending the password to the internet.
- **Real-Time Analysis:** Instantly warns users if a password is compromised.

### 🎨 Intelligent UX
- **Smart Favicons:** Automatically fetches high-res brand logos for stored websites.
- **Strength Meter:** Real-time visual feedback on password complexity.
- **Dark Mode:** Fully adaptive UI for light and dark environments.

## 🛠️ Tech Stack

- **Framework:** React Native (Expo SDK 52)
- **Language:** TypeScript
- **State Management:** React Context API
- **Storage:** `expo-secure-store` (for Keys) & `AsyncStorage` (for Encrypted Blob)
- **Cryptography:** `expo-crypto` (SHA-1, Random UUIDs)
- **Navigation:** `expo-router` (File-based routing)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Ayoub-EDAHLOULI/neurokey.git](https://github.com/Ayoub-EDAHLOULI/neurokey.git)
   cd neurokey
---
*Built with ❤️ by AYOUB EDAHLOULI*
