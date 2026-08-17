import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValueFn) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn(`Unable to load saved value for "${key}".`, error);
    }

    return initialValueFn();
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
