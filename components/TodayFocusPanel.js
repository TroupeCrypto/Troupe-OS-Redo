// components/TodayFocusPanel.js
"use client";

import { useDailyPersistentState } from "../lib/useDailyPersistentState";

export default function TodayFocusPanel() {
  const [focus, setFocus, isHydrated, todayKey] =
    useDailyPersistentState("today_focus", "");

  return (
    <section className="px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xs tracking-[0.25em] uppercase">
          Today&apos;s Focus
        </h2>
        <span className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          {todayKey}
        </span>
      </div>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading…</p>
      ) : (
        <textarea
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="Define one clear priority for the next block of time."
          className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[96px]"
        />
      )}

      <p className="mt-2 text-[11px] opacity-60">
        This focus is scoped to <span className="opacity-90">{todayKey}</span>.
        Tomorrow starts fresh with an empty slot, while previous days remain
        stored locally on this device.
      </p>
    </section>
  );
}
