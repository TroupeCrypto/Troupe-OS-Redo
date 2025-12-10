// components/TodayFocusPanel.js
"use client";

import { usePersistentState } from "../lib/usePersistentState";

export default function TodayFocusPanel() {
  const [focus, setFocus, isHydrated] = usePersistentState(
    "today_focus",
    ""
  );

  const handleChange = (e) => {
    setFocus(e.target.value);
  };

  return (
    <section className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <h2 className="text-xs tracking-[0.25em] uppercase mb-2">
        Today&apos;s Focus
      </h2>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading…</p>
      ) : (
        <textarea
          value={focus}
          onChange={handleChange}
          placeholder="Define one clear priority for the next block of time."
          className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[96px]"
        />
      )}

      <p className="mt-2 text-[11px] opacity-60">
        This will persist on this device and browser so you can refresh
        without losing today&apos;s priority.
      </p>
    </section>
  );
}
