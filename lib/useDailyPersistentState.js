// lib/useDailyPersistentState.js

import { usePersistentState } from "./usePersistentState";

function getTodayKey() {
  // YYYY-MM-DD
  return new Date().toISOString().slice(0, 10);
}

/**
 * Daily-scoped wrapper over usePersistentState.
 * Stores values in an object keyed by date: { "YYYY-MM-DD": value }.
 */
export function useDailyPersistentState(baseKey, defaultValue) {
  const todayKey = getTodayKey();
  const storageKey = baseKey + "_by_day";

  const [allValues, setAllValues, isHydrated] = usePersistentState(
    storageKey,
    {}
  );

  const value =
    isHydrated &&
    allValues &&
    Object.prototype.hasOwnProperty.call(allValues, todayKey)
      ? allValues[todayKey]
      : defaultValue;

  const setValue = (next) => {
    const current = value;
    const resolved =
      typeof next === "function" ? next(current) : next;

    setAllValues({
      ...(allValues || {}),
      [todayKey]: resolved,
    });
  };

  return [value, setValue, isHydrated, todayKey];
}
