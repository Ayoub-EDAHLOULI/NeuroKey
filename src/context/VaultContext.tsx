import AsyncStorage from "@react-native-async-storage/async-storage"; // 👈 The key to stability
import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export interface PasswordItem {
  id: string;
  serviceName: string;
  email: string;
  password: string;
  url?: string;
  notes?: string;
  icon?: string;
  color?: string;
  created_at: number;
}

interface VaultContextType {
  passwords: PasswordItem[];
  isLoading: boolean; // 👈 New: Helps us know when data is ready
  isAuthenticated: boolean;
  unlockVault: (key: string) => void;
  addPassword: (item: Omit<PasswordItem, "id" | "created_at">) => void;
  deletePassword: (id: string) => void;
  updatePassword: (id: string, updates: Partial<PasswordItem>) => void;
}

const VaultContext = createContext<VaultContextType>({} as VaultContextType);

const STORAGE_KEY = "@neurokey_vault_v1";

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 1. LOAD DATA ON STARTUP
  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          const loadedData = JSON.parse(jsonValue);
          setPasswords(loadedData);
          console.log("✅ Vault loaded:", loadedData.length, "items");
        } else {
          console.log("ℹ️ Starting fresh vault (no data found)");
        }
      } catch (e) {
        console.error("❌ Failed to load vault:", e);
      } finally {
        setIsLoading(false); // Stop loading whether it worked or failed
      }
    };
    loadData();
  }, []);

  // 2. HELPER TO SAVE DATA
  const saveVault = async (newData: PasswordItem[]) => {
    try {
      setPasswords(newData); // Update UI immediately (Optimistic UI)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData)); // Save to Disk
      console.log("💾 Saved to disk.");
    } catch (e) {
      console.error("❌ Failed to save vault:", e);
    }
  };

  const unlockVault = (key: string) => {
    setIsAuthenticated(true);
  };

  // CRUD OPERATIONS
  const addPassword = (newItem: Omit<PasswordItem, "id" | "created_at">) => {
    const entry = { id: uuidv4(), created_at: Date.now(), ...newItem };
    saveVault([entry, ...passwords]);
  };

  const deletePassword = (id: string) => {
    saveVault(passwords.filter((item) => item.id !== id));
  };

  const updatePassword = (id: string, updates: Partial<PasswordItem>) => {
    saveVault(
      passwords.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    );
  };

  return (
    <VaultContext.Provider
      value={{
        passwords,
        isLoading,
        isAuthenticated,
        unlockVault,
        addPassword,
        deletePassword,
        updatePassword,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);
