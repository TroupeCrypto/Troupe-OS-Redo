"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "troupe_os_health_energy_v1";

function loadInitialState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to persist Health & Energy state", err);
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyActivity(extra = {}) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    date: todayStr(),
    label: "",
    type: "walk", // walk | lift | cardio | stretch | other
    durationMinutes: "",
    intensity: "medium", // low | medium | high
    energyAfter: "",
    notes: "",
    pinned: false,
    createdAt: now,
    updatedAt: now,
    ...extra,
  };
}

function createEmptyHabit(extra = {}) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    label: "",
    category: "health", // health | work | creative | sleep | other
    targetPerDay: 1,
    unit: "x",
    todayCount: 0,
    autoReset: true,
    pinned: false,
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...extra,
  };
}

function createEmptySymptom(extra = {}) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    date: todayStr(),
    label: "",
    location: "",
    severity: 0, // 0-10
    notes: "",
    resolved: false,
    pinned: false,
    createdAt: now,
    updatedAt: now,
    ...extra,
  };
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function HealthHeader({ date, energyScore, painScore }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          Health &amp; Energy
        </p>
        <h2 className="text-sm font-semibold">Body Console · {date}</h2>
      </div>
      <div className="text-right text-[10px] opacity-80">
        <p>Energy: {energyScore || "-"} / 10</p>
        <p>Pain: {painScore || "-"} / 10</p>
      </div>
    </header>
  );
}

function DailyVitals({ vitals, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...vitals,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <section className="mb-3 border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <p className="text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
        Daily Vitals
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Sleep (hrs)
          </label>
          <input
            type="number"
            value={vitals.sleepHours}
            onChange={(e) => handleChange("sleepHours", e.target.value)}
            className="w-full bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Energy (0–10)
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={vitals.energyScore}
            onChange={(e) => handleChange("energyScore", e.target.value)}
            className="w-full bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Pain (0–10)
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={vitals.painScore}
            onChange={(e) => handleChange("painScore", e.target.value)}
            className="w-full bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Stress (0–10)
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={vitals.stressScore}
            onChange={(e) => handleChange("stressScore", e.target.value)}
            className="w-full bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Water (oz)
          </label>
          <input
            type="number"
            value={vitals.waterOz}
            onChange={(e) => handleChange("waterOz", e.target.value)}
            className="w-full bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Caffeine (mg est.)
          </label>
          <input
            type="number"
            value={vitals.caffeineMg}
            onChange={(e) => handleChange("caffeineMg", e.target.value)}
            className="w-full bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Meals
          </label>
          <input
            type="number"
            value={vitals.mealsCount}
            onChange={(e) => handleChange("mealsCount", e.target.value)}
            className="w-full bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Notes tag
          </label>
          <input
            type="text"
            value={vitals.tag}
            onChange={(e) => handleChange("tag", e.target.value)}
            className="w-full bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
      </div>
      <textarea
        value={vitals.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        className="w-full bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80 text-[10px] min-h-[40px] resize-vertical"
        placeholder=""
      />
    </section>
  );
}

function ActivityRow({ activity, onChange, onTogglePinned, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...activity,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const duration = toNumber(activity.durationMinutes);

  return (
    <div className="border border-white/20 bg-black/40 rounded-sm px-2 py-2 mb-1 text-[11px]">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            activity.pinned
              ? "border-emerald-300 text-emerald-300"
              : "border-white/25 text-white/40 hover:border-emerald-300 hover:text-emerald-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <input
              type="text"
              value={activity.label}
              onChange={(e) => handleFieldChange("label", e.target.value)}
              className="flex-1 bg-transparent border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder=""
            />
            <select
              value={activity.type}
              onChange={(e) => handleFieldChange("type", e.target.value)}
              className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
            >
              <option value="walk">Walk</option>
              <option value="lift">Lift</option>
              <option value="cardio">Cardio</option>
              <option value="stretch">Stretch</option>
              <option value="other">Other</option>
            </select>
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">Min</span>
              <input
                type="number"
                value={activity.durationMinutes}
                onChange={(e) =>
                  handleFieldChange("durationMinutes", e.target.value)
                }
                className="w-16 bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
              />
            </div>
            <select
              value={activity.intensity}
              onChange={(e) => handleFieldChange("intensity", e.target.value)}
              className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
            >
              <option value="low">Low</option>
              <option value="medium">Med</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">Date</span>
              <input
                type="date"
                value={activity.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                className="bg-black/60 border border-white/25 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">
                Energy after
              </span>
              <input
                type="number"
                min={0}
                max={10}
                value={activity.energyAfter}
                onChange={(e) =>
                  handleFieldChange("energyAfter", e.target.value)
                }
                className="w-16 bg-black/60 border border-white/25 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
              />
            </div>
            <span className="ml-auto text-[10px] opacity-65">
              {duration ? `${duration} min` : ""}
            </span>
          </div>
          <textarea
            value={activity.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80 text-[10px] min-h-[32px] resize-vertical"
            placeholder=""
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[9px] opacity-60 hover:opacity-100 mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function MovementSection({ activities, onChangeActivities }) {
  const handleAdd = () => {
    onChangeActivities([createEmptyActivity(), ...activities]);
  };

  const handleChange = (id, next) => {
    const nextList = activities.map((a) => (a.id === id ? next : a));
    onChangeActivities(nextList);
  };

  const handleTogglePinned = (id) => {
    const nextList = activities.map((a) =>
      a.id === id
        ? { ...a, pinned: !a.pinned, updatedAt: new Date().toISOString() }
        : a
    );
    onChangeActivities(nextList);
  };

  const handleRemove = (id) => {
    const nextList = activities.filter((a) => a.id !== id);
    onChangeActivities(nextList);
  };

  const sorted = useMemo(
    () =>
      activities
        .slice()
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          if (a.date === b.date) {
            return (b.updatedAt || "").localeCompare(a.updatedAt || "");
          }
          return a.date < b.date ? 1 : -1;
        }),
    [activities]
  );

  const today = todayStr();
  const todayMinutes = sorted
    .filter((a) => a.date === today)
    .reduce((sum, a) => sum + toNumber(a.durationMinutes), 0);

  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            Movement Log
          </p>
          <p className="text-[10px] opacity-55">
            Total today: {todayMinutes} min
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] border border-white/70 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
        >
          + Activity
        </button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-[11px] opacity-40">
          No movement logged yet. Even 5–10 minute walks count.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {sorted.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              onChange={(next) => handleChange(activity.id, next)}
              onTogglePinned={() => handleTogglePinned(activity.id)}
              onRemove={() => handleRemove(activity.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HabitRow({ habit, onChange, onTogglePinned, onIncrement, onReset }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...habit,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const progress = habit.targetPerDay
    ? Math.min(1, toNumber(habit.todayCount) / toNumber(habit.targetPerDay))
    : 0;

  const percent = Math.round(progress * 100);

  return (
    <div className="border border-white/20 bg-black/40 rounded-sm px-2 py-2 mb-1 text-[11px]">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            habit.pinned
              ? "border-sky-300 text-sky-300"
              : "border-white/25 text-white/40 hover:border-sky-300 hover:text-sky-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <input
              type="text"
              value={habit.label}
              onChange={(e) => handleFieldChange("label", e.target.value)}
              className="flex-1 bg-transparent border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder=""
            />
            <select
              value={habit.category}
              onChange={(e) => handleFieldChange("category", e.target.value)}
              className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
            >
              <option value="health">Health</option>
              <option value="work">Work</option>
              <option value="creative">Creative</option>
              <option value="sleep">Sleep</option>
              <option value="other">Other</option>
            </select>
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">Target</span>
              <input
                type="number"
                value={habit.targetPerDay}
                onChange={(e) =>
                  handleFieldChange("targetPerDay", e.target.value)
                }
                className="w-16 bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
              />
              <input
                type="text"
                value={habit.unit}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                className="w-12 bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">Today</span>
              <input
                type="number"
                value={habit.todayCount}
                onChange={(e) =>
                  handleFieldChange("todayCount", e.target.value)
                }
                className="w-16 bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
              />
              <button
                type="button"
                onClick={onIncrement}
                className="text-[10px] border border-white/60 px-2 py-0.5 rounded-sm"
              >
                +1
              </button>
              <button
                type="button"
                onClick={onReset}
                className="text-[10px] border border-white/30 px-2 py-0.5 rounded-sm"
              >
                Reset
              </button>
            </div>
            <label className="flex items-center gap-1 text-[10px] opacity-75">
              <input
                type="checkbox"
                checked={habit.autoReset}
                onChange={(e) =>
                  handleFieldChange("autoReset", e.target.checked)
                }
                className="w-3 h-3"
              />
              Auto reset daily
            </label>
            <span className="ml-auto text-[10px] opacity-70">
              {percent}% · {habit.todayCount}/{habit.targetPerDay} {habit.unit}
            </span>
          </div>
          <textarea
            value={habit.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80 text-[10px] min-h-[32px] resize-vertical"
            placeholder=""
          />
        </div>
      </div>
    </div>
  );
}

function HabitsSection({ habits, onChangeHabits }) {
  const handleAdd = () => {
    onChangeHabits([createEmptyHabit(), ...habits]);
  };

  const handleChange = (id, next) => {
    const nextList = habits.map((h) => (h.id === id ? next : h));
    onChangeHabits(nextList);
  };

  const handleTogglePinned = (id) => {
    const nextList = habits.map((h) =>
      h.id === id
        ? { ...h, pinned: !h.pinned, updatedAt: new Date().toISOString() }
        : h
    );
    onChangeHabits(nextList);
  };

  const handleIncrement = (id) => {
    const nextList = habits.map((h) =>
      h.id === id
        ? {
            ...h,
            todayCount: toNumber(h.todayCount) + 1,
            updatedAt: new Date().toISOString(),
          }
        : h
    );
    onChangeHabits(nextList);
  };

  const handleReset = (id) => {
    const nextList = habits.map((h) =>
      h.id === id
        ? { ...h, todayCount: 0, updatedAt: new Date().toISOString() }
        : h
    );
    onChangeHabits(nextList);
  };

  const sorted = useMemo(
    () =>
      habits
        .slice()
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }),
    [habits]
  );

  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
          Habits · Today
        </p>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] border border-white/70 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
        >
          + Habit
        </button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-[11px] opacity-40">
          Define 3–5 anchor habits (water, walk, stretch, etc.).
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {sorted.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onChange={(next) => handleChange(habit.id, next)}
              onTogglePinned={() => handleTogglePinned(habit.id)}
              onIncrement={() => handleIncrement(habit.id)}
              onReset={() => handleReset(habit.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SymptomRow({ symptom, onChange, onTogglePinned, onToggleResolved, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...symptom,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      className={`border rounded-sm px-2 py-2 mb-1 text-[11px] ${
        symptom.resolved
          ? "border-emerald-400/70 bg-emerald-400/5 opacity-80"
          : "border-red-400/70 bg-red-400/5"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            symptom.pinned
              ? "border-red-300 text-red-300"
              : "border-white/25 text-white/40 hover:border-red-300 hover:text-red-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <input
              type="text"
              value={symptom.label}
              onChange={(e) => handleFieldChange("label", e.target.value)}
              className="flex-1 bg-transparent border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder=""
            />
            <input
              type="text"
              value={symptom.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              className="w-28 bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder=""
            />
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">Severity</span>
              <input
                type="number"
                min={0}
                max={10}
                value={symptom.severity}
                onChange={(e) =>
                  handleFieldChange("severity", e.target.value)
                }
                className="w-16 bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">Date</span>
              <input
                type="date"
                value={symptom.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
              />
            </div>
          </div>
          <textarea
            value={symptom.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80 text-[10px] min-h-[32px] resize-vertical"
            placeholder=""
          />
          <div className="mt-1 flex items-center justify-between text-[10px] opacity-75">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={symptom.resolved}
                onChange={onToggleResolved}
                className="w-3 h-3"
              />
              Resolved
            </label>
            <span>
              {symptom.date} · last update{" "}
              {symptom.updatedAt
                ? symptom.updatedAt.slice(0, 16).replace("T", " ")
                : ""}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[9px] opacity-60 hover:opacity-100 mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function SymptomsSection({ symptoms, onChangeSymptoms }) {
  const handleAdd = () => {
    onChangeSymptoms([createEmptySymptom(), ...symptoms]);
  };

  const handleChange = (id, next) => {
    const nextList = symptoms.map((s) => (s.id === id ? next : s));
    onChangeSymptoms(nextList);
  };

  const handleTogglePinned = (id) => {
    const nextList = symptoms.map((s) =>
      s.id === id
        ? { ...s, pinned: !s.pinned, updatedAt: new Date().toISOString() }
        : s
    );
    onChangeSymptoms(nextList);
  };

  const handleToggleResolved = (id) => {
    const nextList = symptoms.map((s) =>
      s.id === id
        ? { ...s, resolved: !s.resolved, updatedAt: new Date().toISOString() }
        : s
    );
    onChangeSymptoms(nextList);
  };

  const handleRemove = (id) => {
    const nextList = symptoms.filter((s) => s.id !== id);
    onChangeSymptoms(nextList);
  };

  const sorted = useMemo(
    () =>
      symptoms
        .slice()
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          if (a.date === b.date) {
            return (b.updatedAt || "").localeCompare(a.updatedAt || "");
          }
          return a.date < b.date ? 1 : -1;
        }),
    [symptoms]
  );

  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
          Symptoms / Pain
        </p>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] border border-white/70 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
        >
          + Symptom
        </button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-[11px] opacity-40">
          Track anything that might matter later (pain, reactions, etc.).
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {sorted.map((symptom) => (
            <SymptomRow
              key={symptom.id}
              symptom={symptom}
              onChange={(next) => handleChange(symptom.id, next)}
              onTogglePinned={() => handleTogglePinned(symptom.id)}
              onToggleResolved={() => handleToggleResolved(symptom.id)}
              onRemove={() => handleRemove(symptom.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryStrip({ vitals, activities, habits }) {
  const today = todayStr();

  const todayActivities = activities.filter((a) => a.date === today);
  const totalMinutes = todayActivities.reduce(
    (sum, a) => sum + toNumber(a.durationMinutes),
    0
  );

  const completedHabits = habits.filter((h) =>
    toNumber(h.todayCount) >= toNumber(h.targetPerDay || 0)
  ).length;

  return (
    <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Core</p>
        <p className="mt-1 opacity-80">
          Energy: {vitals.energyScore || "-"} / 10 · Sleep:{" "}
          {vitals.sleepHours || "-"} hrs
        </p>
        <p className="opacity-70">
          Pain: {vitals.painScore || "-"} / 10 · Stress:{" "}
          {vitals.stressScore || "-"} / 10
        </p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Inputs</p>
        <p className="mt-1 opacity-80">
          Water: {vitals.waterOz || "-"} oz · Caffeine:{" "}
          {vitals.caffeineMg || "-"} mg
        </p>
        <p className="opacity-70">Meals: {vitals.mealsCount || "-"}</p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Today</p>
        <p className="mt-1 opacity-80">Movement: {totalMinutes} min</p>
        <p className="opacity-70">
          Habits hit: {completedHabits}/{habits.length || 0}
        </p>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function HealthEnergyPanel() {
  const [state, setState] = useState(() => ({
    date: todayStr(),
    vitals: {
      sleepHours: "",
      energyScore: "",
      painScore: "",
      stressScore: "",
      waterOz: "",
      caffeineMg: "",
      mealsCount: "",
      tag: "",
      notes: "",
      updatedAt: null,
    },
    activities: [],
    habits: [],
    symptoms: [],
  }));

  // hydrate
  useEffect(() => {
    const initial = loadInitialState();
    if (initial) {
      setState((prev) => ({
        ...prev,
        ...initial,
        vitals: {
          ...prev.vitals,
          ...(initial.vitals || {}),
        },
        activities: Array.isArray(initial.activities) ? initial.activities : [],
        habits: Array.isArray(initial.habits) ? initial.habits : [],
        symptoms: Array.isArray(initial.symptoms) ? initial.symptoms : [],
      }));
    }
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleChangeVitals = (vitals) => {
    setState((s) => ({ ...s, vitals }));
  };

  const handleChangeActivities = (activities) => {
    setState((s) => ({ ...s, activities }));
  };

  const handleChangeHabits = (habits) => {
    setState((s) => ({ ...s, habits }));
  };

  const handleChangeSymptoms = (symptoms) => {
    setState((s) => ({ ...s, symptoms }));
  };

  return (
    <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
      <HealthHeader
        date={state.date}
        energyScore={state.vitals.energyScore}
        painScore={state.vitals.painScore}
      />

      <DailyVitals vitals={state.vitals} onChange={handleChangeVitals} />

      <SummaryStrip
        vitals={state.vitals}
        activities={state.activities}
        habits={state.habits}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <MovementSection
          activities={state.activities}
          onChangeActivities={handleChangeActivities}
        />
        <div className="flex flex-col gap-3">
          <HabitsSection habits={state.habits} onChangeHabits={handleChangeHabits} />
          <SymptomsSection
            symptoms={state.symptoms}
            onChangeSymptoms={handleChangeSymptoms}
          />
        </div>
      </div>
    </section>
  );
}
