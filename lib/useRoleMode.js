// lib/useRoleMode.js
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "troupe_os_role_mode_v1";

// These must stay in sync with AuthGatePanel DEFAULT_PROFILES and UI
export const ROLE_MODES = ["FOUNDER", "CREATIVE", "FINANCE", "HEALTH", "PUBLIC"];

function normalizeMode(value) {
  if (!value || typeof value !== "string") return "FOUNDER";
  const upper = value.toUpperCase().trim();
  if (ROLE_MODES.includes(upper)) return upper;
  return "FOUNDER";
}

export function useRoleMode() {
  const [mode, setMode] = useState("FOUNDER");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw);
      const storedMode =
        typeof parsed === "string" ? parsed : parsed?.mode || "FOUNDER";
      const normalized = normalizeMode(storedMode);
      setMode(normalized);
    } catch (err) {
      console.error("Failed to load role mode", err);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist mode whenever it changes after hydration
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode })
      );
    } catch (err) {
      console.error("Failed to persist role mode", err);
    }
  }, [mode, hydrated]);

  const setModeSafe = (nextMode) => {
    const normalized = normalizeMode(nextMode);
    setMode(normalized);
  };

  return {
    mode,
    setMode: setModeSafe,
    hydrated,
  };
}
