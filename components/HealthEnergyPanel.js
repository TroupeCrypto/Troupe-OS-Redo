// components/HealthEnergyPanel.js
"use client";

import { useDailyPersistentState } from "../lib/useDailyPersistentState";
import { useMemo, useState } from "react";

const ENERGY_SCALE = [1, 2, 3, 4, 5];
const TABS = ["Nutrition", "Hydration", "Exercise", "Sleep", "Mood"];

export default function HealthEnergyPanel() {
  const [state, setState, isHydrated, todayKey] =
    useDailyPersistentState("health_energy", {
      caloriesIn: "",
      caloriesOut: "",
      hydrationOz: "",
      steps: "",
      workouts: "",
      sleepHours: "",
      recovery: "",
      energy: 3,
      mood: "",
      productivity: "",
      notes: "",
    });
  const [tab, setTab] = useState("Nutrition");

  const safeState = useMemo(
    () => ({
      caloriesIn: state?.caloriesIn ?? "",
      caloriesOut: state?.caloriesOut ?? "",
      hydrationOz: state?.hydrationOz ?? "",
      steps: state?.steps ?? "",
      workouts: state?.workouts ?? "",
      sleepHours: state?.sleepHours ?? "",
      recovery: state?.recovery ?? "",
      energy:
        typeof state?.energy === "number" && ENERGY_SCALE.includes(state.energy)
          ? state.energy
          : 3,
      mood: state?.mood ?? "",
      productivity: state?.productivity ?? "",
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

  const surplus =
    Number(safeState.caloriesIn) - Number(safeState.caloriesOut || 0);
  const strain =
    Number(safeState.workouts || 0) > 60 && Number(safeState.sleepHours || 0) < 7;
  const recoveryIndex = Math.min(
    100,
    Math.max(
      0,
      Number(safeState.sleepHours || 0) * 10 +
        Number(safeState.recovery || 0) * 5
    )
  );
  const moodProductivity =
    safeState.mood && safeState.productivity
      ? `${safeState.mood} → ${safeState.productivity}`
      : "Track mood/productivity to correlate.";

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
        Manual inputs with wearable-ready fields. Calculates strain, recovery,
        and mood-to-output alignment.
      </p>

      <div className="flex flex-wrap gap-2 mb-3 text-[11px] uppercase tracking-[0.18em]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-3 py-1 border " +
              (tab === t ? "border-white/90" : "border-white/40 opacity-70")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Nutrition" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
              Calories In
            </label>
            <input
              type="number"
              value={safeState.caloriesIn}
              onChange={updateField("caloriesIn")}
              className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
              Calories Out (wearable ready)
            </label>
            <input
              type="number"
              value={safeState.caloriesOut}
              onChange={updateField("caloriesOut")}
              className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
          </div>
          <div className="col-span-2 text-sm">
            Calorie {surplus >= 0 ? "surplus" : "deficit"}:{" "}
            {Number.isFinite(surplus) ? surplus : "—"}
          </div>
        </div>
      )}

      {tab === "Hydration" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
              Hydration (oz)
            </label>
            <input
              type="number"
              value={safeState.hydrationOz}
              onChange={updateField("hydrationOz")}
              className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
              Steps (wearable ready)
            </label>
            <input
              type="number"
              value={safeState.steps}
              onChange={updateField("steps")}
              className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
          </div>
        </div>
      )}

      {tab === "Exercise" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
              Workouts (minutes)
            </label>
            <input
              type="number"
              value={safeState.workouts}
              onChange={updateField("workouts")}
              className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
              Movement Energy (1–5)
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
            </div>
          </div>
          {strain ? (
            <p className="text-sm text-amber-200 col-span-2">
              Strain detected: long workouts with limited sleep.
            </p>
          ) : null}
        </div>
      )}

      {tab === "Sleep" && (
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
              Recovery Score (0-10)
            </label>
            <input
              type="number"
              value={safeState.recovery}
              onChange={updateField("recovery")}
              className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
          </div>
          <div className="col-span-2 text-sm">
            Sleep Recovery Index: {recoveryIndex}/100
          </div>
        </div>
      )}

      {tab === "Mood" && (
        <div className="mb-3 space-y-2">
          <div>
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
          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
              Productivity (self-rated)
            </label>
            <input
              type="text"
              value={safeState.productivity}
              onChange={updateField("productivity")}
              placeholder="high, medium, low"
              className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
          </div>
          <p className="text-sm opacity-80">Mood → Output: {moodProductivity}</p>
        </div>
      )}

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
