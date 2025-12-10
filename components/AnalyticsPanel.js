"use client";

import { useMemo, useState } from "react";
import { usePersistentState } from "../lib/usePersistentState";
import { useEventLog } from "../lib/useEventLog";

const TABS = [
  "Financial",
  "Behavioral",
  "Creative",
  "Operational",
  "Predictive",
];

export default function AnalyticsPanel() {
  const [ledgerByDay] = usePersistentState("money_ledger_by_day", {});
  const [healthByDay] = usePersistentState("health_energy_by_day", {});
  const [sessionsByDay] = usePersistentState("creative_sessions_by_day", {});
  const [focusByDay] = usePersistentState("today_focus_by_day", {});
  const [obligationsByDay] = usePersistentState(
    "today_obligations_by_day",
    {}
  );
  const [scratchpad] = usePersistentState("scratchpad", "");
  const { events } = useEventLog();
  const [tab, setTab] = useState("Financial");

  const dates = useMemo(
    () =>
      Array.from(
        new Set([
          ...Object.keys(ledgerByDay || {}),
          ...Object.keys(healthByDay || {}),
          ...Object.keys(sessionsByDay || {}),
        ])
      ).sort(),
    [ledgerByDay, healthByDay, sessionsByDay]
  );

  const financial = useMemo(() => {
    const last = dates.slice(-7);
    let revenue = 0;
    let expenses = 0;
    last.forEach((d) => {
      const list = ledgerByDay?.[d] || [];
      list.forEach((e) => {
        if (typeof e.amount !== "number") return;
        if (e.direction === "IN") revenue += e.amount;
        else expenses += e.amount;
      });
    });
    const net = revenue - expenses;
    const breakdown = {};
    last.forEach((d) =>
      (ledgerByDay?.[d] || []).forEach((e) => {
        if (!breakdown[e.category]) breakdown[e.category] = 0;
        breakdown[e.category] += e.direction === "IN" ? e.amount : -e.amount;
      })
    );
    return { revenue, expenses, net, breakdown };
  }, [dates, ledgerByDay]);

  const behaviorMap = useMemo(() => {
    const moods = [];
    const outcomes = [];
    Object.values(healthByDay || {}).forEach((h) => {
      if (h?.mood) moods.push(h.mood);
      if (h?.productivity) outcomes.push(h.productivity);
    });
    const tags = (events || []).flatMap((e) => e.tags || []);
    return { moods, outcomes, tags };
  }, [healthByDay, events]);

  const creativeROI = useMemo(() => {
    const allSessions = Object.values(sessionsByDay || {}).flat();
    const revenueLinked = allSessions.filter((s) => s?.revenueTag);
    return {
      total: allSessions.length,
      revenueLinked: revenueLinked.length,
      ratio:
        allSessions.length > 0
          ? (revenueLinked.length / allSessions.length) * 100
          : 0,
    };
  }, [sessionsByDay]);

  const bottlenecks = useMemo(() => {
    const overdue = Object.values(obligationsByDay || {})
      .flat()
      .filter((o) => o?.due && o.due < new Date().toISOString().slice(0, 10));
    const lockedTasks = Object.values(focusByDay || {})
      .flatMap((t) => (Array.isArray(t?.tasks) ? t.tasks : []))
      .filter((t) => t.locked && !t.done);
    return { overdue, lockedTasks };
  }, [obligationsByDay, focusByDay]);

  const forecast = useMemo(() => {
    const nets = dates.slice(-3).map((d) => {
      const list = ledgerByDay?.[d] || [];
      return list.reduce(
        (acc, e) =>
          typeof e.amount === "number"
            ? acc + (e.direction === "IN" ? e.amount : -e.amount)
            : acc,
        0
      );
    });
    const avg =
      nets.length > 0 ? nets.reduce((a, b) => a + b, 0) / nets.length : 0;
    return {
      projectedNet: avg,
      rule: "Mean of last 3 days",
    };
  }, [dates, ledgerByDay]);

  return (
    <section className="border-b border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
            Analytics
          </p>
          <h2 className="text-lg sm:text-xl">Cross-Panel Insights</h2>
        </div>
        <p className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          Local View Only
        </p>
      </div>

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

      {tab === "Financial" && (
        <div className="space-y-2 text-sm">
          <p>Revenue: ${financial.revenue.toFixed(2)}</p>
          <p>Expenses: ${financial.expenses.toFixed(2)}</p>
          <p
            className={
              financial.net >= 0 ? "text-emerald-300" : "text-red-300"
            }
          >
            Net: ${financial.net.toFixed(2)}
          </p>
          <div>
            <p className="text-[11px] opacity-70 uppercase">Breakdown</p>
            <ul className="text-xs space-y-1">
              {Object.entries(financial.breakdown).map(([cat, val]) => (
                <li key={cat}>
                  {cat}: {val.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "Behavioral" && (
        <div className="space-y-2 text-sm">
          <p>Tracked moods: {behaviorMap.moods.join(", ") || "none"}</p>
          <p>
            Productivity tags: {behaviorMap.outcomes.join(", ") || "none"}
          </p>
          <p>Event tags: {behaviorMap.tags.join(", ") || "none"}</p>
        </div>
      )}

      {tab === "Creative" && (
        <div className="space-y-2 text-sm">
          <p>
            Creative ROI: {creativeROI.revenueLinked}/
            {creativeROI.total} sessions linked to revenue (
            {creativeROI.ratio.toFixed(1)}%)
          </p>
          <p>
            Scratchpad length:{" "}
            {typeof scratchpad === "string" ? scratchpad.length : 0}
          </p>
        </div>
      )}

      {tab === "Operational" && (
        <div className="space-y-2 text-sm">
          <p>
            Bottlenecks: {bottlenecks.overdue.length} overdue obligations,{" "}
            {bottlenecks.lockedTasks.length} non-negotiable tasks open.
          </p>
          <ul className="text-xs space-y-1">
            {bottlenecks.overdue.slice(0, 3).map((o) => (
              <li key={o.id}>Overdue: {o.text}</li>
            ))}
          </ul>
        </div>
      )}

      {tab === "Predictive" && (
        <div className="space-y-2 text-sm">
          <p>
            Forward forecast: ${forecast.projectedNet.toFixed(2)} (rule:{" "}
            {forecast.rule})
          </p>
          <p>Basis dates: {dates.slice(-3).join(", ") || "n/a"}</p>
        </div>
      )}
    </section>
  );
}
