const mem = new Map<string, string>();

interface MMKVInstance {
  set(key: string, value: string): void;
  getString(key: string): string | undefined;
  delete(key: string): void;
  clearAll(): void;
  contains(key: string): boolean;
}

function makeInstance(): MMKVInstance {
  return {
    set: (key, value) => {
      mem.set(key, value);
    },
    getString: (key) => mem.get(key),
    delete: (key) => {
      mem.delete(key);
    },
    clearAll: () => {
      mem.clear();
    },
    contains: (key) => mem.has(key),
  };
}

export type MMKV = MMKVInstance;

export function createMMKV(_config?: { id?: string; path?: string; encryptionKey?: string }): MMKV {
  return makeInstance();
}

export const __resetMockStorage = (): void => {
  mem.clear();
};
