// lib/useEventLog.js
"use client";

import { useCallback, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";

const STORAGE_KEY = "troupe_event_log_v1";

const makeId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`);

/**
 * Lightweight event log shared across panels.
 * Events are persisted locally and ready for future DB sync.
 */
export function useEventLog() {
  const [events, setEvents, isHydrated] = usePersistentState(
    STORAGE_KEY,
    []
  );

  const appendEvent = useCallback(
    (event) => {
      const payload = {
        id: makeId(),
        ts: new Date().toISOString(),
        panel: event.panel,
        category: event.category,
        action: event.action,
        outcome: event.outcome || null,
        tags: Array.isArray(event.tags) ? event.tags : [],
        data: event.data || {},
      };

      setEvents((current) => {
        const list = Array.isArray(current) ? current : [];
        return [...list, payload].slice(-800); // keep log bounded
      });
    },
    [setEvents]
  );

  const groupedByDay = useMemo(() => {
    const map = {};
    (Array.isArray(events) ? events : []).forEach((evt) => {
      const day = evt.ts?.slice(0, 10) || "unknown";
      if (!map[day]) map[day] = [];
      map[day].push(evt);
    });
    return map;
  }, [events]);

  return {
    events: Array.isArray(events) ? events : [],
    appendEvent,
    groupedByDay,
    isHydrated,
  };
}
