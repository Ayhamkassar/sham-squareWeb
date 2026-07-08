import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const memoryStorage = new Map<string, string>();

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try { return localStorage.getItem(key); } catch { return memoryStorage.get(key) ?? null; }
    }
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch { return memoryStorage.get(key) ?? null; }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try { localStorage.setItem(key, value); return; } catch { memoryStorage.set(key, value); return; }
    }
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch { memoryStorage.set(key, value); }
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try { localStorage.removeItem(key); return; } catch { memoryStorage.delete(key); return; }
    }
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch { memoryStorage.delete(key); }
  },
};
