// components/MoneySnapshotPanel.js
"use client";

import { useMemo, useState, useEffect } from "react";
import { usePersistentState } from "../lib/usePersistentState";
import { useEventLog } from "../lib/useEventLog";

const CATEGORIES = ["Cash", "Bank", "Crypto", "Debt", "Assets"];

export default function MoneySnapshotPanel() {
  const [snapshot, setSnapshot, isHydrated] = usePersistentState(
    "money_snapshot",
    {
      entries: [],
      notes: "",
      history: [],
      lastSync: null,
    }
  );
  const { appendEvent } = useEventLog();
  const [tab, setTab] = useState("Cash");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  const safeEntries = useMemo(
    () => (Array.isArray(snapshot.entries) ? snapshot.entries : []),
    [snapshot.entries]
  );

  const addEntry = () => {
    const trimmed = label.trim();
    const value = Number.parseFloat(amount.replace(/[^0-9.-]/g, ""));
    if (!trimmed || Number.isNaN(value)) return;
    const entry = {
      id: Date.now(),
      label: trimmed,
      amount: value,
      category: tab,
      ts: new Date().toISOString(),
    };
    setSnapshot((current) => ({
      ...(current || {}),
      entries: [...safeEntries, entry],
    }));
    setLabel("");
    setAmount("");
    appendEvent({
      panel: "Money",
      category: tab,
      action: "add-balance",
      data: entry,
    });
  };

  const totals = useMemo(() => {
    const totalsObj = CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: 0 }), {});
    safeEntries.forEach((e) => {
      totalsObj[e.category] += e.amount;
    });
    return totalsObj;
  }, [safeEntries]);

  const assetsTotal = totals.Cash + totals.Bank + totals.Crypto + totals.Assets;
  const debtTotal = Math.abs(totals.Debt);
  const net = assetsTotal - debtTotal;

  const lastHistory = snapshot.history?.slice(-1)[0];
  const currentTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowTs(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);
  const delta24 =
    lastHistory && nowTs - new Date(lastHistory.ts).getTime() <= 86400000
      ? currentTotal - lastHistory.total
      : null;

  const recordSnapshot = () => {
    const entry = { ts: new Date().toISOString(), total: currentTotal };
    setSnapshot((curr) => ({
      ...(curr || {}),
      history: [...(curr?.history || []), entry].slice(-30),
      lastSync: entry.ts,
    }));
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
        Manual inputs with local persistence. Records history for 24h delta and
        prepares API sync payloads.
      </p>

      <div className="flex flex-wrap gap-2 mb-3 text-[11px] uppercase tracking-[0.18em]">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setTab(c)}
            className={
              "px-3 py-1 border " +
              (tab === c ? "border-white/90" : "border-white/40 opacity-70")
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={`${tab} label`}
          className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="$0"
          inputMode="decimal"
          className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
        />
        <button
          type="button"
          onClick={addEntry}
          className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
        >
          Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="border border-white/30 px-3 py-3">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
            24h Delta
          </p>
          <p
            className={
              "text-lg " +
              (delta24 === null
                ? "opacity-70"
                : delta24 >= 0
                ? "text-emerald-300"
                : "text-red-300")
            }
          >
            {delta24 === null ? "record snapshot" : `${delta24.toFixed(2)}`}
          </p>
        </div>
        <div className="border border-white/30 px-3 py-3">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
            Cash Flow Velocity
          </p>
          <p className="text-lg">
            {lastHistory
              ? `${((currentTotal - lastHistory.total) / 24).toFixed(2)} /hr`
              : "pending sample"}
          </p>
        </div>
        <div className="border border-white/30 px-3 py-3">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
            Net Position
          </p>
          <p
            className={
              "text-lg " +
              (net >= 0 ? "text-emerald-300" : "text-red-300")
            }
          >
            {net.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
          Asset Breakdown
        </p>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.filter((c) => c !== "Debt").map((c) => {
            const pct =
              assetsTotal > 0 ? Math.round((totals[c] / assetsTotal) * 100) : 0;
            return (
              <div key={c} className="w-32">
                <div className="h-2 bg-white/10">
                  <div
                    className="h-2 bg-white"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  {c}: {pct}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
          Debt vs Assets
        </p>
        <div className="h-3 bg-white/10 mb-1">
          <div
            className="h-3 bg-emerald-300"
            style={{
              width: assetsTotal + debtTotal === 0
                ? "0%"
                : `${(assetsTotal / (assetsTotal + debtTotal)) * 100}%`,
            }}
          />
        </div>
        <p className="text-[11px] opacity-70">
          Assets {assetsTotal.toFixed(2)} vs Debt {debtTotal.toFixed(2)}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-[11px] tracking-[0.18em] uppercase mb-1 opacity-70">
          Notes
        </label>
        <textarea
          value={snapshot.notes}
          onChange={(e) =>
            setSnapshot((curr) => ({ ...(curr || {}), notes: e.target.value }))
          }
          placeholder="Next inflows, must-pay items, or quick notes about today’s money picture."
          className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[80px]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={recordSnapshot}
          className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
        >
          Record Snapshot
        </button>
        <p className="text-[11px] opacity-70">
          Last sync: {snapshot.lastSync || "not captured"} · entries:{" "}
          {safeEntries.length}
        </p>
      </div>
    </div>
  );
}
