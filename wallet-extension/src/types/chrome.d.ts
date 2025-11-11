// Type definitions for Chrome Extension API
declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: object, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
    }

    interface StorageChange {
      newValue?: any;
      oldValue?: any;
    }

    interface LocalStorageArea extends StorageArea {
      // Additional methods specific to local storage if needed
    }

    const local: LocalStorageArea;
  }
}

declare const chrome: typeof globalThis.chrome;
