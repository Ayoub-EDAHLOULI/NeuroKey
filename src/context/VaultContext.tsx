import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

// 1. Define what a Password Item looks like
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

// 2. Define the actions we can perform
interface VaultContextType {
  passwords: PasswordItem[];
  isAuthenticated: boolean;
  unlockVault: (key: string) => void; // We will use this later for encryption
  addPassword: (item: Omit<PasswordItem, "id" | "created_at">) => void;
  deletePassword: (id: string) => void;
}

// 3. Create the Context
const VaultContext = createContext<VaultContextType>({} as VaultContextType);

// 4. The Provider Component
export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterKey, setMasterKey] = useState<string | null>(null);

  // SIMULATE: Unlock the vault (We will connect real decryption later)
  const unlockVault = (key: string) => {
    setMasterKey(key);
    setIsAuthenticated(true);
    // TODO: Load encrypted file from disk here
  };

  // ACTION: Add Password
  const addPassword = (newItem: Omit<PasswordItem, "id" | "created_at">) => {
    const entry: PasswordItem = {
      id: uuidv4(),
      created_at: Date.now(),
      ...newItem,
    };
    // Add to top of list
    setPasswords((prev) => [entry, ...prev]);
    // TODO: Save updated list to disk here
  };

  // ACTION: Delete Password
  const deletePassword = (id: string) => {
    setPasswords((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <VaultContext.Provider
      value={{
        passwords,
        isAuthenticated,
        unlockVault,
        addPassword,
        deletePassword,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

// 5. A simple Hook to use this data in any screen
export const useVault = () => useContext(VaultContext);
