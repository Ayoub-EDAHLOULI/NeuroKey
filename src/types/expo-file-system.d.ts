declare module "expo-file-system" {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
  export const bundleDirectory: string | null;

  export interface FileInfo {
    exists: boolean;
    uri: string;
    size?: number;
    isDirectory?: boolean;
    modificationTime?: number;
    md5?: string;
  }

  export function getInfoAsync(
    fileUri: string,
    options?: { md5?: boolean; size?: boolean },
  ): Promise<FileInfo>;

  export function readAsStringAsync(
    fileUri: string,
    options?: { encoding?: string; position?: number; length?: number },
  ): Promise<string>;

  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options?: { encoding?: string },
  ): Promise<void>;

  export function deleteAsync(
    fileUri: string,
    options?: { idempotent?: boolean },
  ): Promise<void>;

  export function moveAsync(options: {
    from: string;
    to: string;
  }): Promise<void>;

  export function copyAsync(options: {
    from: string;
    to: string;
  }): Promise<void>;

  export function makeDirectoryAsync(
    fileUri: string,
    options?: { intermediates?: boolean },
  ): Promise<void>;

  export function readDirectoryAsync(fileUri: string): Promise<string[]>;
}
