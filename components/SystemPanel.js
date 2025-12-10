// components/SystemPanel.js
"use client";

import { usePersistentState } from "../lib/usePersistentState";

const DAY_KEYS = [
  "today_focus_by_day",
  "today_obligations_by_day",
  "creative_sessions_by_day",
  "money_ledger_by_day",
  "health_energy_by_day",
];

const SINGLE_KEYS = ["money_snapshot", "scratchpad"];

export default function SystemPanel() {
  const [focusByDay] = usePersistentState("today_focus_by_day", {});
  const [obligationsByDay] = usePersistentState(
    "today_obligations_by_day",
    {}
  );
  const [sessionsByDay] = usePersistentState("creative_sessions_by_day", {});
  const [ledgerByDay] = usePersistentState("money_ledger_by_day", {});
  const [healthByDay] = usePersistentState("health_energy_by_day", {});
  const [snapshot] = usePersistentState("money_snapshot", {
    cashOnHand: "",
    checking: "",
    savings: "",
    notes: "",
  });
  const [scratchpad] = usePersistentState("scratchpad", "");

  const dayCounts = {
    focus: Object.keys(focusByDay || {}).length,
    obligations: Object.keys(obligationsByDay || {}).length,
    sessions: Object.keys(sessionsByDay || {}).length,
    ledger: Object.keys(ledgerByDay || {}).length,
    health: Object.keys(healthByDay || {}).length,
  };

  const handleResetAll = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm(
      "This will clear all local Troupe OS data on this device (focus, obligations, sessions, money, health, scratchpad). This cannot be undone. Continue?"
    );
    if (!confirmed) return;

    try {
      for (const key of DAY_KEYS.concat(SINGLE_KEYS)) {
        window.localStorage.removeItem(key);
      }
      window.location.reload();
    } catch (err) {
      console.error("Failed to reset local data", err);
    }
  };

  return (
    <div className="px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
            System
          </p>
          <h2 className="text-lg sm:text-xl">Diagnostics &amp; Data</h2>
        </div>
        <p className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          Local Storage Status
        </p>
      </div>

      <p className="text-sm opacity-80 mb-4 max-w-2xl">
        Overview of what this browser is currently storing for Troupe OS. All
        data lives only on this device until a backend is connected.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="border border-white/30 px-3 py-3 text-sm">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
            Days Tracked · Focus
          </p>
          <p className="text-lg">{dayCounts.focus}</p>
        </div>
        <div className="border border-white/30 px-3 py-3 text-sm">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
            Days Tracked · Obligations
          </p>
          <p className="text-lg">{dayCounts.obligations}</p>
        </div>
        <div className="border border-white/30 px-3 py-3 text-sm">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
            Days Tracked · Sessions
          </p>
          <p className="text-lg">{dayCounts.sessions}</p>
        </div>
        <div className="border border-white/30 px-3 py-3 text-sm">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
            Days Tracked · Ledger
          </p>
          <p className="text-lg">{dayCounts.ledger}</p>
        </div>
        <div className="border border-white/30 px-3 py-3 text-sm">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
            Days Tracked · Health
          </p>
          <p className="text-lg">{dayCounts.health}</p>
        </div>
        <div className="border border-white/30 px-3 py-3 text-sm">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
            Scratchpad Length
          </p>
          <p className="text-lg">
            {typeof scratchpad === "string" ? scratchpad.length : 0} chars
          </p>
        </div>
      </div>

      <details className="mb-4">
        <summary className="text-[11px] tracking-[0.18em] uppercase opacity-70 cursor-pointer">
          View Raw Snapshot (Money &amp; Scratchpad)
        </summary>
        <div className="mt-2 text-xs bg-black/60 border border-white/20 px-3 py-2 overflow-x-auto whitespace-pre-wrap">
          <p className="opacity-70 mb-1">money_snapshot</p>
          <pre className="mb-2">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
          <p className="opacity-70 mb-1">scratchpad (truncated)</p>
          <pre>
            {typeof scratchpad === "string"
              ? scratchpad.slice(0, 400)
              : ""}
            {typeof scratchpad === "string" &&
            scratchpad.length > 400
              ? "…"
              : ""}
          </pre>
        </div>
      </details>

      <button
        type="button"
        onClick={handleResetAll}
        className="px-4 py-2 text-[11px] border border-red-400 tracking-[0.18em] uppercase text-red-200"
      >
        Reset All Local Data
      </button>
      <p className="mt-2 text-[11px] opacity-60 max-w-xl">
        This affects only this browser and device. Use carefully once you are
        sure you no longer need the stored history.
      </p>
    </div>
  );
}
