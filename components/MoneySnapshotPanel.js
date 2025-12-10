// components/MoneySnapshotPanel.js
"use client";

import { usePersistentState } from "../lib/usePersistentState";

export default function MoneySnapshotPanel() {
  const [snapshot, setSnapshot, isHydrated] = usePersistentState(
    "money_snapshot",
    {
      cashOnHand: "",
      checking: "",
      savings: "",
      notes: "",
    }
  );

  const updateField = (field) => (e) => {
    const value = e.target.value;
    setSnapshot({
      ...snapshot,
      [field]: value,
    });
  };

  if (!isHydrated) {
    return (
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-white/40">
        <p className="text-sm opacity-70">Loading money snapshot…</p>
      </div>
    );
  }

  return (
    <div className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
        Today&apos;s Money Snapshot
      </h3>
      <p className="text-[11px] opacity-60 mb-3">
        Manual inputs only. Stored locally on this device and browser. Later
        this can sync to live accounts and ledgers.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
            Cash On Hand
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={snapshot.cashOnHand}
            onChange={updateField("cashOnHand")}
            placeholder="$160"
            className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
            Checking
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={snapshot.checking}
            onChange={updateField("checking")}
            placeholder="$0"
            className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
            Savings / Other
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={snapshot.savings}
            onChange={updateField("savings")}
            placeholder="$0"
            className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
          Notes
        </label>
        <textarea
          value={snapshot.notes}
          onChange={updateField("notes")}
          placeholder="Next inflows, must-pay items, or quick notes about today’s money picture."
          className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[80px]"
        />
      </div>
    </div>
  );
}
