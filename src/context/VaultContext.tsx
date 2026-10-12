import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { decrypt, encrypt, isEncryptedPayload } from "../core/security/vaultCrypto";

export type VaultItemType = "password" | "card" | "note";

export interface VaultItem {
  id: string;
  type: VaultItemType;
  name: string;
  email?: string;
  password?: string;
  url?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
  cardType?: "visa" | "mastercard" | "amex";
  notes?: string;
  icon?: string;
  color?: string;
  created_at: number;
  updated_at: number;
  isDeleted?: boolean;
}

interface VaultContextType {
  items: VaultItem[];
  isLoading: boolean;
  addVaultItem: (
    item: Omit<VaultItem, "id" | "created_at" | "updated_at">,
  ) => void;
  deleteVaultItem: (id: string) => void;
  updateVaultItem: (id: string, updates: Partial<VaultItem>) => void;
  setItems: (items: VaultItem[]) => Promise<void>;
  /** Decrypts the stored vault with the master key. Returns false if it can't be read. */
  unlock: (key: string) => Promise<boolean>;
  /** Clears the key and decrypted items from memory. */
  lock: () => void;
  isUnlocked: boolean;
  /** Master key of the unlocked vault (memory only), e.g. to enable biometrics. */
  getVaultKey: () => string | null;
}

const VaultContext = createContext<VaultContextType>({} as VaultContextType);
const STORAGE_KEY = "@neurokey_vault_v2";

const persistEncrypted = (data: VaultItem[], key: string | null) => {
  if (!key) throw new Error("Vault is locked");
  return AsyncStorage.setItem(STORAGE_KEY, encrypt(JSON.stringify(data), key));
};

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  // The master key only ever lives in memory while the vault is unlocked
  const keyRef = useRef<string | null>(null);

  const unlock = useCallback(async (key: string) => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let data: VaultItem[] = [];

      if (stored && isEncryptedPayload(stored)) {
        const json = decrypt(stored, key);
        if (json === null) return false; // wrong key or tampered data
        data = JSON.parse(json);
      } else if (stored) {
        // v1 vaults were saved as plain JSON: encrypt them now
        data = JSON.parse(stored);
      }

      keyRef.current = key;
      setItems(data);
      setIsUnlocked(true);
      if (stored && !isEncryptedPayload(stored)) await persistEncrypted(data, key);
      return true;
    } catch (e) {
      console.error("Failed to unlock vault", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const lock = useCallback(() => {
    keyRef.current = null;
    setItems([]);
    setIsUnlocked(false);
  }, []);

  const getVaultKey = useCallback(() => keyRef.current, []);

  const saveVault = async (newData: VaultItem[]) => {
    setItems(newData);
    await persistEncrypted(newData, keyRef.current);
  };

  const addVaultItem = (
    newItem: Omit<VaultItem, "id" | "created_at" | "updated_at">,
  ) => {
    const now = Date.now();
    const entry = {
      id: uuidv4(),
      created_at: now,
      updated_at: now,
      ...newItem,
    };
    saveVault([entry as VaultItem, ...items]);
  };

  const deleteVaultItem = (id: string) => {
    // Instead of filtering it out, we turn it into a Tombstone!
    saveVault(
      items.map((i) =>
        i.id === id ? { ...i, isDeleted: true, updated_at: Date.now() } : i,
      ),
    );
  };

  const updateVaultItem = (id: string, updates: Partial<VaultItem>) => {
    // Inject the new updated_at timestamp on every edit
    saveVault(
      items.map((i) =>
        i.id === id ? { ...i, ...updates, updated_at: Date.now() } : i,
      ),
    );
  };

  return (
    <VaultContext.Provider
      value={{
        items,
        isLoading,
        addVaultItem,
        deleteVaultItem,
        updateVaultItem,
        setItems: saveVault,
        unlock,
        lock,
        isUnlocked,
        getVaultKey,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);
