import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory fallback if native storage bridge fails
const memoryStore = new Map();

const storage = {
  getItem: async (key) => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null && val !== undefined) return val;
      return memoryStore.get(key) || null;
    } catch (err) {
      return memoryStore.get(key) || null;
    }
  },

  setItem: async (key, value) => {
    try {
      memoryStore.set(key, value);
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      memoryStore.set(key, value);
    }
  },

  removeItem: async (key) => {
    try {
      memoryStore.delete(key);
      await AsyncStorage.removeItem(key);
    } catch (err) {
      memoryStore.delete(key);
    }
  },

  clear: async () => {
    try {
      memoryStore.clear();
      await AsyncStorage.clear();
    } catch (err) {
      memoryStore.clear();
    }
  }
};

export default storage;
