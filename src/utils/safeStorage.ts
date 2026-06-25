// Safe storage wrapper that falls back to in-memory store if localStorage is blocked by sandbox policies or security settings
const memoryStore: Record<string, string> = {};

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      console.warn(`Storage read access denied for key "${key}", using fallback in-memory store.`, e);
      return memoryStore[key] !== undefined ? memoryStore[key] : null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStore[key] = value;
      }
    } catch (e) {
      console.warn(`Storage write access denied for key "${key}", using fallback in-memory store.`, e);
      memoryStore[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        delete memoryStore[key];
      }
    } catch (e) {
      console.warn(`Storage remove access denied for key "${key}", using fallback in-memory store.`, e);
      delete memoryStore[key];
    }
  },
  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      } else {
        for (const k in memoryStore) {
          delete memoryStore[k];
        }
      }
    } catch (e) {
      console.warn("Storage clear access denied, using fallback in-memory store.", e);
      for (const k in memoryStore) {
        delete memoryStore[k];
      }
    }
  }
};
