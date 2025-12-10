"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "troupe_os_analytics_panel_v1";

// External panel storage keys (read-only)
const LEDGER_KEY = "troupe_os_daily_money_ledger_v1";
const CREATIVE_KEY = "troupe_os_creative_sessions_v1";
const HEALTH_KEY = "troupe_os_health_energy_v1";

function safeLoad(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
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
    console.error("Failed to persist AnalyticsPanel state", err);
  }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const n =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function diffDays(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function PanelHeader({ dateRange, onDateRangeChange }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          Analytics
        </p>
        <h2 className="text-sm font-semibold">Troupe OS Signals</h2>
        <p className="text-[10px] opacity-70">
          Simple trends from money, creative, and health panels on this device.
        </p>
      </div>
      <div className="text-right text-[10px] opacity-80">
        <p className="mb-1">
          Window:{" "}
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="bg-black/60 border border-white/40 px-2 py-1 rounded-sm outline-none focus:border-white/90"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </p>
        <p className="opacity-65 text-[9px]">
          Analytics are local-only. Clearing local storage will reset history.
        </p>
      </div>
    </header>
  );
}

function NumberTile({ label, value, sub, highlight }) {
  return (
    <div
      className={`border rounded-sm px-2 py-1 ${
        highlight
          ? "border-emerald-300/80 bg-emerald-400/10"
          : "border-white/22 bg-black/40"
      }`}
    >
      <p className="uppercase tracking-[0.18em] text-[9px] opacity-60">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold">
        {typeof value === "number"
          ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
          : value}
      </p>
      {sub && (
        <p className="text-[10px] opacity-70 mt-0.5 whitespace-pre-line">
          {sub}
        </p>
      )}
    </div>
  );
}

function MoneySection({ metrics }) {
  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
          Money · Flow
        </p>
        <p className="text-[10px] opacity-60">
          Days with entries: {metrics.daysWithActivity} / {metrics.windowDays}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <NumberTile
          label="Net change"
          value={metrics.net}
          sub="Income − expenses in window"
          highlight={metrics.net >= 0 && metrics.daysWithActivity > 0}
        />
        <NumberTile
          label="Total spent"
          value={metrics.spent}
          sub={`Avg/day: ${metrics.avgSpentPerActiveDay.toLocaleString(
            undefined,
            { maximumFractionDigits: 0 }
          )}`}
        />
        <NumberTile
          label="Total income"
          value={metrics.income}
          sub={`Avg/day: ${metrics.avgIncomePerActiveDay.toLocaleString(
            undefined,
            { maximumFractionDigits: 0 }
          )}`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
        <div className="border border-white/18 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Category share (expenses)
          </p>
          {metrics.categoryBreakdown.length === 0 ? (
            <p className="opacity-45 text-[11px]">
              No expenses found in this window.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {metrics.categoryBreakdown.map((c) => (
                <li key={c.category} className="flex justify-between">
                  <span className="opacity-80">{c.category}</span>
                  <span className="opacity-75">
                    {c.spent.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    · {c.share.toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border border-white/18 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Activity pattern
          </p>
          <p className="opacity-75 mb-0.5">
            Quiet days: {metrics.quietDays} · Active days:{" "}
            {metrics.daysWithActivity}
          </p>
          <p className="opacity-70">
            This is purely descriptive. Use it to see if money decisions cluster
            around certain days or if spending drifts upward.
          </p>
        </div>
      </div>
    </section>
  );
}

function CreativeSection({ metrics }) {
  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
          Creative · Output
        </p>
        <p className="text-[10px] opacity-60">
          Days with sessions: {metrics.daysWithSessions} / {metrics.windowDays}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <NumberTile
          label="Total minutes"
          value={metrics.totalMinutes}
          sub={`Avg active day: ${metrics.avgMinutesPerActiveDay.toLocaleString(
            undefined,
            { maximumFractionDigits: 0 }
          )} min`}
          highlight={metrics.totalMinutes > 0}
        />
        <NumberTile
          label="Sessions logged"
          value={metrics.totalSessions}
          sub={`Avg/day: ${metrics.avgSessionsPerDay.toLocaleString(
            undefined,
            { maximumFractionDigits: 1 }
          )}`}
        />
        <NumberTile
          label="Streak (approx.)"
          value={metrics.streakDays || "-"}
          sub={
            metrics.streakDays
              ? "Consecutive days with any session"
              : "No streak data yet"
          }
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
        <div className="border border-white/18 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            By discipline
          </p>
          {metrics.byType.length === 0 ? (
            <p className="opacity-45 text-[11px]">
              No sessions found in this window.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {metrics.byType.map((t) => (
                <li key={t.type} className="flex justify-between">
                  <span className="opacity-80">{t.type}</span>
                  <span className="opacity-75">
                    {t.minutes.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    min · {t.sessions}{" "}
                    {t.sessions === 1 ? "session" : "sessions"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border border-white/18 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Energy matching
          </p>
          <p className="opacity-75 mb-0.5">
            High-energy minutes: {metrics.highEnergyMinutes} · Low-energy:{" "}
            {metrics.lowEnergyMinutes}
          </p>
          <p className="opacity-70">
            Use this to decide when to schedule heavier creative tasks vs. light
            maintenance.
          </p>
        </div>
      </div>
    </section>
  );
}

function HealthSection({ metrics }) {
  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
          Health · Signals
        </p>
        <p className="text-[10px] opacity-60">
          Days with vitals: {metrics.daysWithVitals} / {metrics.windowDays}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <NumberTile
          label="Sleep"
          value={
            metrics.avgSleepHours > 0
              ? metrics.avgSleepHours.toFixed(1)
              : "-"
          }
          sub="Average hours / night"
        />
        <NumberTile
          label="Energy"
          value={
            metrics.avgEnergyScore > 0
              ? metrics.avgEnergyScore.toFixed(1)
              : "-"
          }
          sub="Average 0–10 rating"
        />
        <NumberTile
          label="Pain"
          value={metrics.avgPainScore > 0 ? metrics.avgPainScore.toFixed(1) : "-"}
          sub="Average 0–10 rating"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
        <div className="border border-white/18 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Movement
          </p>
          <p className="opacity-75 mb-0.5">
            Minutes logged in window: {metrics.totalMovementMinutes}
          </p>
          <p className="opacity-70">
            Active days (movement logged): {metrics.daysWithMovement} /{" "}
            {metrics.windowDays}
          </p>
        </div>
        <div className="border border-white/18 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Inputs
          </p>
          <p className="opacity-75">
            Avg water:{" "}
            {metrics.avgWaterOz > 0 ? metrics.avgWaterOz.toFixed(0) : "-"} oz ·
            Avg caffeine:{" "}
            {metrics.avgCaffeineMg > 0
              ? metrics.avgCaffeineMg.toFixed(0)
              : "-"}{" "}
            mg
          </p>
          <p className="opacity-70 mt-0.5">
            These are descriptive only; use the separate Health panel for
            long-form notes and details.
          </p>
        </div>
      </div>
    </section>
  );
}

function InspectorSection({ raw }) {
  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <p className="text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
        Data Inspector
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
        <div className="border border-white/18 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Money source
          </p>
          <p className="opacity-75">
            Entries: {raw.ledgerEntries.length} · Selected date:{" "}
            {raw.ledgerState?.selectedDate || "-"}
          </p>
          <p className="opacity-60">
            Storage key: <span className="font-mono text-[9px]">{
              LEDGER_KEY
            }</span>
          </p>
        </div>
        <div className="border border-white/18 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Creative source
          </p>
          <p className="opacity-75">
            Ideas: {raw.creativeIdeas.length} · Sessions:{" "}
            {raw.creativeSessions.length}
          </p>
          <p className="opacity-60">
            Storage key: <span className="font-mono text-[9px]">{
              CREATIVE_KEY
            }</span>
          </p>
        </div>
        <div className="border border-white/18 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Health source
          </p>
          <p className="opacity-75">
            Activities: {raw.healthActivities.length} · Habits:{" "}
            {raw.healthHabits.length}
          </p>
          <p className="opacity-60">
            Storage key: <span className="font-mono text-[9px]">{
              HEALTH_KEY
            }</span>
          </p>
        </div>
      </div>
      <p className="mt-2 text-[9px] opacity-60">
        This is read-only. To change data, use the original panels that own
        each key.
      </p>
    </section>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function AnalyticsPanel() {
  const [settings, setSettings] = useState(() => ({
    dateRange: "7", // days as string
    lastLoadedAt: null,
  }));

  const [external, setExternal] = useState(() => ({
    ledgerState: null,
    creativeState: null,
    healthState: null,
    loaded: false,
  }));

  // hydrate own settings + external data
  useEffect(() => {
    const s = safeLoad(STORAGE_KEY);
    if (s) {
      setSettings((prev) => ({
        ...prev,
        ...s,
        dateRange: s.dateRange || "7",
      }));
    }

    const ledgerState = safeLoad(LEDGER_KEY);
    const creativeState = safeLoad(CREATIVE_KEY);
    const healthState = safeLoad(HEALTH_KEY);

    setExternal({
      ledgerState,
      creativeState,
      healthState,
      loaded: true,
    });
    setSettings((prev) => ({
      ...prev,
      lastLoadedAt: new Date().toISOString(),
    }));
  }, []);

  // persist settings
  useEffect(() => {
    saveState(settings);
  }, [settings]);

  const windowDays = useMemo(
    () => Math.max(1, parseInt(settings.dateRange || "7", 10) || 7),
    [settings.dateRange]
  );

  const today = todayStr();

  // Flatten external data
  const ledgerEntries = useMemo(
    () =>
      Array.isArray(external.ledgerState?.entries)
        ? external.ledgerState.entries
        : [],
    [external.ledgerState]
  );

  const creativeIdeas = useMemo(
    () =>
      Array.isArray(external.creativeState?.ideas)
        ? external.creativeState.ideas
        : [],
    [external.creativeState]
  );

  const creativeSessions = useMemo(
    () =>
      Array.isArray(external.creativeState?.sessions)
        ? external.creativeState.sessions
        : [],
    [external.creativeState]
  );

  const healthActivities = useMemo(
    () =>
      Array.isArray(external.healthState?.activities)
        ? external.healthState.activities
        : [],
    [external.healthState]
  );

  const healthHabits = useMemo(
    () =>
      Array.isArray(external.healthState?.habits)
        ? external.healthState.habits
        : [],
    [external.healthState]
  );

  const healthVitalsHistory = useMemo(() => {
    // Health panel currently stores a single "vitals" object for today.
    // For now, treat that as one-day sample; later you could expand panel
    // to keep a history and this will automatically start using it.
    const v = external.healthState?.vitals;
    if (!v) return [];
    return [{ date: today, ...v }];
  }, [external.healthState, today]);

  // ── Money metrics ───────────────────────────────────────────────────────────

  const moneyMetrics = useMemo(() => {
    if (!ledgerEntries.length) {
      return {
        windowDays,
        daysWithActivity: 0,
        quietDays: windowDays,
        spent: 0,
        income: 0,
        net: 0,
        avgSpentPerActiveDay: 0,
        avgIncomePerActiveDay: 0,
        categoryBreakdown: [],
      };
    }

    const startWindowDate = new Date(today);
    startWindowDate.setDate(startWindowDate.getDate() - (windowDays - 1));
    const startIso = startWindowDate.toISOString().slice(0, 10);

    const inWindow = ledgerEntries.filter((e) => {
      if (!e.date) return false;
      return e.date >= startIso && e.date <= today;
    });

    const byDay = new Map();
    let spent = 0;
    let income = 0;

    const categorySpent = new Map();

    inWindow.forEach((e) => {
      const d = e.date;
      if (!byDay.has(d)) byDay.set(d, { spent: 0, income: 0 });
      const amt = toNumber(e.amount);
      if (!amt) return;

      if (e.type === "income") {
        income += amt;
        byDay.get(d).income += amt;
      } else if (e.type === "expense") {
        spent += amt;
        byDay.get(d).spent += amt;

        const cat = e.category || "other";
        categorySpent.set(cat, (categorySpent.get(cat) || 0) + amt);
      }
    });

    const daysWithActivity = Array.from(byDay.values()).filter(
      (d) => d.spent || d.income
    ).length;
    const quietDays = windowDays - daysWithActivity;

    const avgSpent =
      daysWithActivity > 0 ? spent / daysWithActivity : 0;
    const avgIncome =
      daysWithActivity > 0 ? income / daysWithActivity : 0;

    const totalCat = Array.from(categorySpent.values()).reduce(
      (sum, v) => sum + v,
      0
    );
    const categoryBreakdown = Array.from(categorySpent.entries())
      .map(([category, cSpent]) => ({
        category,
        spent: cSpent,
        share: totalCat ? (cSpent / totalCat) * 100 : 0,
      }))
      .sort((a, b) => b.spent - a.spent);

    return {
      windowDays,
      daysWithActivity,
      quietDays,
      spent,
      income,
      net: income - spent,
      avgSpentPerActiveDay: avgSpent,
      avgIncomePerActiveDay: avgIncome,
      categoryBreakdown,
    };
  }, [ledgerEntries, windowDays, today]);

  // ── Creative metrics ────────────────────────────────────────────────────────

  const creativeMetrics = useMemo(() => {
    if (!creativeSessions.length) {
      return {
        windowDays,
        daysWithSessions: 0,
        totalMinutes: 0,
        totalSessions: 0,
        avgMinutesPerActiveDay: 0,
        avgSessionsPerDay: 0,
        byType: [],
        highEnergyMinutes: 0,
        lowEnergyMinutes: 0,
        streakDays: 0,
      };
    }

    const startWindowDate = new Date(today);
    startWindowDate.setDate(startWindowDate.getDate() - (windowDays - 1));
    const startIso = startWindowDate.toISOString().slice(0, 10);

    const inWindow = creativeSessions.filter((s) => {
      if (!s.date) return false;
      return s.date >= startIso && s.date <= today;
    });

    const byDay = new Map();
    let totalMinutes = 0;
    let highEnergyMinutes = 0;
    let lowEnergyMinutes = 0;

    const byType = new Map();

    inWindow.forEach((s) => {
      const d = s.date;
      if (!byDay.has(d))
        byDay.set(d, { sessions: 0, minutes: 0 });

      const minutes = toNumber(s.durationMinutes);
      const type = s.type || "other";
      const energy = s.energy || "any";

      byDay.get(d).sessions += 1;
      byDay.get(d).minutes += minutes;
      totalMinutes += minutes;

      byType.set(type, (byType.get(type) || 0) + minutes);

      if (energy === "high") highEnergyMinutes += minutes;
      if (energy === "low") lowEnergyMinutes += minutes;
    });

    const daysWithSessions = Array.from(byDay.values()).filter(
      (d) => d.sessions > 0
    ).length;

    const totalSessions = inWindow.length;
    const avgMinutesPerActiveDay =
      daysWithSessions > 0 ? totalMinutes / daysWithSessions : 0;
    const avgSessionsPerDay =
      windowDays > 0 ? totalSessions / windowDays : 0;

    const byTypeArr = Array.from(byType.entries())
      .map(([type, minutes]) => ({
        type,
        minutes,
        sessions: inWindow.filter((s) => (s.type || "other") === type)
          .length,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    // Approx streak: count how many consecutive days (from today backward)
    // have any session within the window.
    let streak = 0;
    for (let i = 0; i < windowDays; i += 1) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      if (byDay.has(iso) && byDay.get(iso).sessions > 0) {
        streak += 1;
      } else {
        break;
      }
    }

    return {
      windowDays,
      daysWithSessions,
      totalMinutes,
      totalSessions,
      avgMinutesPerActiveDay,
      avgSessionsPerDay,
      byType: byTypeArr,
      highEnergyMinutes,
      lowEnergyMinutes,
      streakDays: streak,
    };
  }, [creativeSessions, windowDays, today]);

  // ── Health metrics ─────────────────────────────────────────────────────────

  const healthMetrics = useMemo(() => {
    const windowDaysSafe = windowDays || 1;

    // For now vitals are only "today" sample if present.
    const vitalsSamples = healthVitalsHistory.filter((v) => !!v.date);

    const daysWithVitals = vitalsSamples.length;

    let sleepTotal = 0;
    let energyTotal = 0;
    let painTotal = 0;
    let waterTotal = 0;
    let caffeineTotal = 0;

    vitalsSamples.forEach((v) => {
      sleepTotal += toNumber(v.sleepHours);
      energyTotal += toNumber(v.energyScore);
      painTotal += toNumber(v.painScore);
      waterTotal += toNumber(v.waterOz);
      caffeineTotal += toNumber(v.caffeineMg);
    });

    const avgSleepHours =
      daysWithVitals > 0 ? sleepTotal / daysWithVitals : 0;
    const avgEnergyScore =
      daysWithVitals > 0 ? energyTotal / daysWithVitals : 0;
    const avgPainScore =
      daysWithVitals > 0 ? painTotal / daysWithVitals : 0;
    const avgWaterOz =
      daysWithVitals > 0 ? waterTotal / daysWithVitals : 0;
    const avgCaffeineMg =
      daysWithVitals > 0 ? caffeineTotal / daysWithVitals : 0;

    // Movement: activities array already stores dates and durations
    let totalMovementMinutes = 0;
    const byDayMove = new Map();

    const startWindowDate = new Date(today);
    startWindowDate.setDate(
      startWindowDate.getDate() - (windowDaysSafe - 1)
    );
    const startIso = startWindowDate.toISOString().slice(0, 10);

    healthActivities.forEach((a) => {
      if (!a.date) return;
      if (a.date < startIso || a.date > today) return;
      const d = a.date;
      const minutes = toNumber(a.durationMinutes);
      totalMovementMinutes += minutes;
      if (!byDayMove.has(d)) byDayMove.set(d, 0);
      byDayMove.set(d, byDayMove.get(d) + minutes);
    });

    const daysWithMovement = Array.from(byDayMove.values()).filter(
      (m) => m > 0
    ).length;

    return {
      windowDays: windowDaysSafe,
      daysWithVitals,
      avgSleepHours,
      avgEnergyScore,
      avgPainScore,
      avgWaterOz,
      avgCaffeineMg,
      totalMovementMinutes,
      daysWithMovement,
    };
  }, [healthVitalsHistory, healthActivities, windowDays, today]);

  // Raw inspector data
  const inspectorRaw = useMemo(
    () => ({
      ledgerState: external.ledgerState,
      creativeState: external.creativeState,
      healthState: external.healthState,
      ledgerEntries,
      creativeIdeas,
      creativeSessions,
      healthActivities,
      healthHabits,
    }),
    [
      external.ledgerState,
      external.creativeState,
      external.healthState,
      ledgerEntries,
      creativeIdeas,
      creativeSessions,
      healthActivities,
      healthHabits,
    ]
  );

  if (!external.loaded) {
    return (
      <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
        <p className="text-[11px] opacity-70">Loading analytics…</p>
      </section>
    );
  }

  return (
    <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
      <PanelHeader
        dateRange={settings.dateRange}
        onDateRangeChange={(dateRange) =>
          setSettings((s) => ({ ...s, dateRange }))
        }
      />

      <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
        <NumberTile
          label="Panels detected"
          value={[
            ledgerEntries.length ? "Money" : null,
            creativeSessions.length ? "Creative" : null,
            healthActivities.length || healthVitalsHistory.length
              ? "Health"
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || "None yet"
          }
          sub="Populate the other panels to give this more signal."
        />
        <NumberTile
          label="Window days"
          value={windowDays}
          sub={`Today: ${today}`}
        />
        <NumberTile
          label="Last synced"
          value={
            settings.lastLoadedAt
              ? settings.lastLoadedAt.slice(0, 16).replace("T", " ")
              : "-"
          }
          sub="Refreshes from local storage on page load."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <MoneySection metrics={moneyMetrics} />
        <CreativeSection metrics={creativeMetrics} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-3">
        <HealthSection metrics={healthMetrics} />
        <InspectorSection raw={inspectorRaw} />
      </div>
    </section>
  );
}
