// components/HistoryViewerPanel.js
"use client";

import { usePersistentState } from "../lib/usePersistentState";
import { useState } from "react";

export default function HistoryViewerPanel() {
  const [focusByDay] = usePersistentState("today_focus_by_day", {});
  const [obligationsByDay] = usePersistentState(
    "today_obligations_by_day",
    {}
  );

  const allDates = Array.from(
    new Set([
      ...Object.keys(focusByDay || {}),
      ...Object.keys(obligationsByDay || {}),
    ])
  ).sort().reverse();

  const [selectedDate, setSelectedDate] = useState(
    allDates.length ? allDates[0] : null
  );

  const focus = selectedDate ? focusByDay?.[selectedDate] : "";
  const obligations = selectedDate
    ? obligationsByDay?.[selectedDate] || []
    : [];

  return (
    <section className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xs tracking-[0.25em] uppercase">History</h2>
        {selectedDate && (
          <span className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
            {selectedDate}
          </span>
        )}
      </div>

      {allDates.length === 0 ? (
        <p className="text-xs opacity-60">
          No historical days recorded yet.
        </p>
      ) : (
        <>
          {/* Date Selector */}
          <div className="flex gap-2 flex-wrap mb-3">
            {allDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={
                  "px-3 py-1 text-[10px] uppercase tracking-[0.18em] border " +
                  (date === selectedDate
                    ? "border-white/80"
                    : "border-white/30 opacity-60")
                }
              >
                {date}
              </button>
            ))}
          </div>

          {/* Focus */}
          <div className="mb-4">
            <h3 className="text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
              Focus
            </h3>
            <p className="text-sm opacity-90 whitespace-pre-wrap">
              {focus || "—"}
            </p>
          </div>

          {/* Obligations */}
          <div>
            <h3 className="text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
              Obligations
            </h3>

            {obligations.length === 0 ? (
              <p className="text-xs opacity-60">None recorded.</p>
            ) : (
              <ul className="space-y-1">
                {obligations.map((item) => (
                  <li
                    key={item.id}
                    className="text-sm flex gap-2 items-center"
                  >
                    <span
                      className={
                        "inline-block h-[10px] w-[10px] border border-white/70 " +
                        (item.done ? "bg-white" : "")
                      }
                    />
                    <span
                      className={
                        item.done ? "line-through opacity-50" : ""
                      }
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
