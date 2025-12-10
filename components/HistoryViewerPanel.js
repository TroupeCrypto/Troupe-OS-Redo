// components/HistoryViewerPanel.js
"use client";

import { useMemo, useState } from "react";
import { useEventLog } from "../lib/useEventLog";

const TABS = [
  "Actions",
  "Finance",
  "Health",
  "Creative",
  "System",
];

export default function HistoryViewerPanel() {
  const { events, groupedByDay, isHydrated } = useEventLog();
  const [activeTab, setActiveTab] = useState("Actions");
  const [search, setSearch] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("all");

  const sortedDays = useMemo(
    () =>
      Object.keys(groupedByDay || {})
        .sort()
        .reverse(),
    [groupedByDay]
  );

  const filteredEvents = useMemo(() => {
    return (events || [])
      .filter((evt) => {
        if (filterOutcome === "wins" && evt.outcome !== "win") return false;
        if (filterOutcome === "fails" && evt.outcome !== "fail") return false;
        if (activeTab !== "Actions" && evt.category !== activeTab)
          return false;
        if (!search.trim()) return true;
        const haystack = JSON.stringify(evt).toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
      .sort((a, b) => (a.ts || "").localeCompare(b.ts || ""));
  }, [events, activeTab, search, filterOutcome]);

  const downloadTimeline = () => {
    const blob = new Blob([JSON.stringify(filteredEvents, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "troupe-history-timeline.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderDaySlice = (day) => {
    const dayEvents = groupedByDay?.[day] || [];
    return (
      <div key={day} className="border border-white/20 px-3 py-2 mb-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">
            {day}
          </p>
          <p className="text-[11px] opacity-60">
            {dayEvents.length} events
          </p>
        </div>
        <div className="flex gap-2 flex-wrap text-[10px] opacity-70 mb-2">
          {["win", "fail"].map((tag) => {
            const count = dayEvents.filter((e) => e.outcome === tag).length;
            return (
              <span
                key={tag}
                className="border border-white/20 px-2 py-[2px] rounded-full"
              >
                {tag}: {count}
              </span>
            );
          })}
        </div>
        <ul className="space-y-1">
          {dayEvents
            .filter((evt) => {
              if (filterOutcome === "wins" && evt.outcome !== "win")
                return false;
              if (filterOutcome === "fails" && evt.outcome !== "fail")
                return false;
              if (activeTab !== "Actions" && evt.category !== activeTab)
                return false;
              if (!search.trim()) return true;
              const hay = JSON.stringify(evt).toLowerCase();
              return hay.includes(search.toLowerCase());
            })
            .map((evt) => (
              <li
                key={evt.id}
                className="text-sm border border-white/15 px-2 py-1"
              >
                <div className="flex justify-between text-[11px] opacity-70">
                  <span>
                    {evt.category} · {evt.panel}
                  </span>
                  <span>{evt.ts?.slice(11, 19)}</span>
                </div>
                <p className="text-sm">
                  {evt.action} {evt.data?.label || evt.data?.intent || ""}
                </p>
                {evt.tags?.length ? (
                  <div className="flex gap-1 flex-wrap text-[10px] opacity-70">
                    {evt.tags.map((t) => (
                      <span
                        key={t}
                        className="border border-white/25 px-2 py-[1px] rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
        </ul>
      </div>
    );
  };

  return (
    <section className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xs tracking-[0.25em] uppercase">History</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterOutcome("all")}
            className={
              "text-[10px] uppercase border px-2 py-[2px] " +
              (filterOutcome === "all"
                ? "border-white/80"
                : "border-white/30 opacity-70")
            }
          >
            All
          </button>
          <button
            onClick={() => setFilterOutcome("wins")}
            className={
              "text-[10px] uppercase border px-2 py-[2px] " +
              (filterOutcome === "wins"
                ? "border-white/80"
                : "border-white/30 opacity-70")
            }
          >
            Wins
          </button>
          <button
            onClick={() => setFilterOutcome("fails")}
            className={
              "text-[10px] uppercase border px-2 py-[2px] " +
              (filterOutcome === "fails"
                ? "border-white/80"
                : "border-white/30 opacity-70")
            }
          >
            Fails
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3 text-[11px] uppercase tracking-[0.18em]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              "px-3 py-1 border " +
              (activeTab === tab
                ? "border-white/90"
                : "border-white/40 opacity-70")
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search outcomes or emotion tags"
          className="flex-1 bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
        />
        <button
          type="button"
          onClick={downloadTimeline}
          className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
        >
          Export JSON
        </button>
      </div>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading history…</p>
      ) : sortedDays.length === 0 ? (
        <p className="text-xs opacity-60">No events recorded yet.</p>
      ) : (
        <div>
          <div className="text-[11px] opacity-70 mb-2">
            Time-lapse: {filteredEvents.length} matching events ·{" "}
            {sortedDays.length} days tracked
          </div>
          {sortedDays.map((day) => renderDaySlice(day))}
        </div>
      )}
    </section>
  );
}
