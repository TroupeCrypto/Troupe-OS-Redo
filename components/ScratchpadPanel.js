// components/ScratchpadPanel.js
"use client";

import { usePersistentState } from "../lib/usePersistentState";

export default function ScratchpadPanel() {
  const [text, setText, isHydrated] = usePersistentState(
    "scratchpad",
    ""
  );

  const handleChange = (e) => setText(e.target.value);

  return (
    <section className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <h2 className="text-xs tracking-[0.25em] uppercase mb-2">
        Scratchpad
      </h2>

      <p className="text-sm opacity-80 mb-3">
        Quick capture for thoughts, plans, numbers, or anything that should
        not live in your head. Stored locally on this device and browser.
      </p>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading…</p>
      ) : (
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Drop raw notes here. This area will later sync into a persistent store and connect to tasks, money, and decisions."
          className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[160px]"
        />
      )}

      <p className="mt-2 text-[11px] opacity-60">
        Content saved automatically as you type. Clearing this box will also
        clear the stored version.
      </p>
    </section>
  );
}
