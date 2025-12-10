// lib/usePersistentState.js
import { useState, useEffect } from "react";

export function usePersistentState(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage on client
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined"
        ? window.localStorage.getItem(key)
        : null;

      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch (err) {
      console.error(`Failed to read ${key} from localStorage`, err);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  // Write to localStorage whenever value changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err) {
      console.error(`Failed to write ${key} to localStorage`, err);
    }
  }, [key, value, isHydrated]);

  return [value, setValue, isHydrated];
}
