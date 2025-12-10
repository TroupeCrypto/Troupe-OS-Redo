// components/HealthEnergyPanel.js
"use client";

import { useDailyPersistentState } from "../lib/useDailyPersistentState";
import { useMemo } from "react";

const ENERGY_SCALE = [1, 2, 3, 4, 5];

export default function HealthEnergyPanel() {
  const [state, setState, isHydrated, todayKey] =
    useDailyPersistentState("health_energy", {
      sleepHours: "",
      energy: 3,
      mood: "",
      movementMinutes: "",
      notes: "",
    });

  const safeState = useMemo(
    () => ({
      sleepHours: state?.sleepHours ?? "",
      energy:
        typeof state?.energy === "number" && ENERGY_SCALE.includes(state.energy)
          ? state.energy
          : 3,
      mood: state?.mood ?? "",
      movementMinutes: state?.movementMinutes ?? "",
      notes: state?.notes ?? "",
    }),
    [state]
  );

  const updateField = (field) => (e) => {
    const value = e.target.value;
    setState((current) => ({
      ...(current || {}),
      [field]: value,
    }));
  };

  const setEnergy = (value) => {
    setState((current) => ({
      ...(current || {}),
      energy: value,
    }));
  };

  if (!isHydrated) {
    return (
      <section className="px-4 py-3 sm:px-6 sm:py-4 border-t border-white/40">
        <p className="text-sm opacity-70">Loading health snapshot…</p>
      </section>
    );
  }

  return (
    <section className="px-4 py-3 sm:px-6 sm:py-4 border-t border-white/40">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xs tracking-[0.25em] uppercase">
          Daily Check-In
        </h2>
        <span className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          {todayKey}
        </span>
      </div>

      <p className="text-sm opacity-80 mb-3 max-w-2xl">
        Quick snapshot of sleep, energy, movement, and mood for{" "}
        <span className="opacity-100">{todayKey}</span>. Stored locally on
        this device.
      </p>

      {/* Sleep + Movement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
            Sleep (hours)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={safeState.sleepHours}
            onChange={updateField("sleepHours")}
            placeholder="6.5"
            className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
            Movement (minutes)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={safeState.movementMinutes}
            onChange={updateField("movementMinutes")}
            placeholder="30"
            className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
          />
        </div>
      </div>

      {/* Energy Scale */}
      <div className="mb-3">
        <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
          Energy (1–5)
        </label>
        <div className="flex items-center gap-2">
          {ENERGY_SCALE.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setEnergy(level)}
              className={
                "h-7 w-7 text-xs flex items-center justify-center border " +
                (safeState.energy === level
                  ? "border-white/90 bg-white text-black"
                  : "border-white/40 text-white/80")
              }
            >
              {level}
            </button>
          ))}
          <span className="text-[11px] opacity-60">
            1 = empty · 5 = fully charged
          </span>
        </div>
      </div>

      {/* Mood */}
      <div className="mb-3">
        <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
          Mood (one phrase)
        </label>
        <input
          type="text"
          value={safeState.mood}
          onChange={updateField("mood")}
          placeholder="Calm, wired, scattered, focused…"
          className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
          Notes
        </label>
        <textarea
          value={safeState.notes}
          onChange={updateField("notes")}
          placeholder="Anything that might explain today’s energy: meals, stress, wins, crashes…"
          className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[80px]"
        />
      </div>
    </section>
  );
}
