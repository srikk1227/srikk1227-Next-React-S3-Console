// Safe localStorage utilities for browser and server environments
export const safeLocalStorage = {
  getItem: (key, defaultValue = null) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get item from localStorage (${key}):`, error);
      return defaultValue;
    }
  },
  
  setItem: (key, value) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set item in localStorage (${key}):`, error);
      return false;
    }
  },
  
  removeItem: (key) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item from localStorage (${key}):`, error);
      return false;
    }
  }
}; 