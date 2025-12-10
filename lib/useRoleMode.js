// lib/useRoleMode.js

import { usePersistentState } from "./usePersistentState";

export const ROLE_MODES = ["FOUNDER", "CREATIVE", "FINANCE", "HEALTH", "PUBLIC"];

export function useRoleMode() {
  const [mode, setMode, isHydrated] = usePersistentState(
    "troupe_os_role_mode",
    "FOUNDER"
  );

  return {
    mode: isHydrated ? mode : "FOUNDER",
    setMode,
    isHydrated,
    roles: ROLE_MODES,
  };
}
