// components/DailyMoneyLedgerPanel.js
"use client";

import { useState, useMemo } from "react";
import { useDailyPersistentState } from "../lib/useDailyPersistentState";
import { useEventLog } from "../lib/useEventLog";

const SUBCATEGORIES = [
  "Income",
  "Expenses",
  "Transfers",
  "Investing",
  "Bills",
];

const AUTO_RULES = [
  { match: ["salary", "sale", "invoice"], category: "Income" },
  { match: ["rent", "utility", "bill"], category: "Bills" },
  { match: ["transfer"], category: "Transfers" },
  { match: ["stock", "crypto"], category: "Investing" },
];

export default function DailyMoneyLedgerPanel() {
  const [entries, setEntries, isHydrated, todayKey] =
    useDailyPersistentState("money_ledger", []);
  const { appendEvent } = useEventLog();

  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [direction, setDirection] = useState("OUT"); // OUT = expense, IN = income
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [taxTag, setTaxTag] = useState("");
  const [receiptTarget, setReceiptTarget] = useState(null);

  const safeEntries = useMemo(
    () => (Array.isArray(entries) ? entries : []),
    [entries]
  );

  const autoCategory = (text) => {
    const lower = text.toLowerCase();
    for (const rule of AUTO_RULES) {
      if (rule.match.some((m) => lower.includes(m))) return rule.category;
    }
    return direction === "IN" ? "Income" : "Expenses";
  };

  const addEntry = () => {
    const trimmedLabel = label.trim();
    const trimmedAmount = amount.trim();
    if (!trimmedLabel || !trimmedAmount) return;

    const numeric = Number.parseFloat(trimmedAmount.replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(numeric)) return;

    const chosenCategory = category.trim() || autoCategory(trimmedLabel);

    const entry = {
      id: Date.now(),
      label: trimmedLabel,
      amount: numeric,
      direction,
      category: chosenCategory,
      account: account.trim(),
      taxTag: taxTag.trim(),
      receipt: null,
    };

    setEntries((current) => {
      const list = Array.isArray(current) ? current : [];
      return [...list, entry];
    });

    setAmount("");
    setLabel("");
    setCategory("");
    setAccount("");
    setTaxTag("");

    appendEvent({
      panel: "Ledger",
      category: chosenCategory,
      action: "add-entry",
      data: entry,
    });
  };

  const removeEntry = (id) => {
    setEntries((current) => {
      const list = Array.isArray(current) ? current : [];
      return list.filter((e) => e.id !== id);
    });
  };

  const { totalIn, totalOut, net } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;

    for (const entry of safeEntries) {
      if (typeof entry.amount !== "number") continue;
      if (entry.direction === "IN") inSum += entry.amount;
      else outSum += entry.amount;
    }

    return {
      totalIn: inSum,
      totalOut: outSum,
      net: inSum - outSum,
    };
  }, [safeEntries]);

  const formatMoney = (value) => {
    if (!Number.isFinite(value)) return "—";
    return `$${value.toFixed(2)}`;
  };

  const burnRate =
    safeEntries.length > 0 ? (totalOut / 1).toFixed(2) : "0.00";

  const micro = (entry) => Math.abs(entry.amount) < 5;

  const handleReceipt = (e, id) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptTarget(id);
    const reader = new FileReader();
    reader.onload = () => {
      setEntries((curr) =>
        (curr || []).map((item) =>
          item.id === id ? { ...item, receipt: reader.result } : item
        )
      );
      setReceiptTarget(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <section className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xs tracking-[0.25em] uppercase">
          Daily Ledger
        </h2>
        <span className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          {todayKey}
        </span>
      </div>

      <p className="text-sm opacity-80 mb-3 max-w-2xl">
        Per-day movement with auto-categorization, micro-transaction detection,
        burn rate, and receipt capture. Stored locally.
      </p>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading ledger…</p>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-4 gap-2 text-xs mb-3">
            <div className="border border-white/30 px-3 py-2">
              <p className="tracking-[0.18em] uppercase opacity-60 mb-1">
                In
              </p>
              <p className="text-sm">{formatMoney(totalIn)}</p>
            </div>
            <div className="border border-white/30 px-3 py-2">
              <p className="tracking-[0.18em] uppercase opacity-60 mb-1">
                Out
              </p>
              <p className="text-sm">{formatMoney(totalOut)}</p>
            </div>
            <div className="border border-white/30 px-3 py-2">
              <p className="tracking-[0.18em] uppercase opacity-60 mb-1">
                Net
              </p>
              <p
                className={
                  "text-sm " +
                  (net > 0
                    ? "text-emerald-300"
                    : net < 0
                    ? "text-red-300"
                    : "text-white")
                }
              >
                {formatMoney(net)}
              </p>
            </div>
            <div className="border border-white/30 px-3 py-2">
              <p className="tracking-[0.18em] uppercase opacity-60 mb-1">
                Burn Rate
              </p>
              <p className="text-sm">${burnRate}/day</p>
            </div>
          </div>

          {/* Input row */}
          <div className="border border-white/30 bg-black/50 px-3 py-3 mb-3 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="$0.00"
                inputMode="decimal"
                className="w-full sm:w-[120px] bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Groceries, sale, deposit, etc."
                className="flex-1 bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="bg-black/60 border border-white/30 px-2 py-2 text-xs tracking-[0.18em] uppercase outline-none focus:border-white/80"
              >
                <option value="OUT">Out</option>
                <option value="IN">In</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 bg-black/60 border border-white/30 px-3 py-2 text-xs outline-none focus:border-white/80"
              >
                <option value="">Auto</option>
                {SUBCATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                value={taxTag}
                onChange={(e) => setTaxTag(e.target.value)}
                placeholder="Tax tag (deductible, VAT, etc.)"
                className="flex-1 bg-black/60 border border-white/30 px-3 py-2 text-xs outline-none focus:border-white/80"
              />
              <input
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="Account / wallet (optional)"
                className="flex-1 bg-black/60 border border-white/30 px-3 py-2 text-xs outline-none focus:border-white/80"
              />
              <div className="flex justify-end sm:w-auto w-full">
                <button
                  type="button"
                  onClick={addEntry}
                  className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>

          {/* Entries list */}
          {safeEntries.length === 0 ? (
            <p className="text-xs opacity-60">
              No money movements logged for today yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {safeEntries
                .slice()
                .sort((a, b) => b.id - a.id)
                .map((entry) => (
                  <li
                    key={entry.id}
                    className="border border-white/20 bg-black/40 px-3 py-2 text-sm flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={
                            entry.direction === "IN"
                              ? "text-emerald-300"
                              : "text-red-300"
                          }
                        >
                          {entry.direction === "IN" ? "+" : "-"}
                          {formatMoney(Math.abs(entry.amount))}
                        </span>
                        <span>{entry.label}</span>
                        {entry.category ? (
                          <span className="text-[10px] uppercase tracking-[0.18em] border border-white/40 px-2 py-[1px] opacity-80">
                            {entry.category}
                          </span>
                        ) : null}
                        {entry.account ? (
                          <span className="text-[10px] uppercase tracking-[0.18em] border border-white/20 px-2 py-[1px] opacity-60">
                            {entry.account}
                          </span>
                        ) : null}
                        {entry.taxTag ? (
                          <span className="text-[10px] uppercase tracking-[0.18em] border border-emerald-400 px-2 py-[1px] text-emerald-200">
                            {entry.taxTag}
                          </span>
                        ) : null}
                        {micro(entry) ? (
                          <span className="text-[10px] uppercase tracking-[0.18em] border border-amber-300 px-2 py-[1px] text-amber-200">
                            micro
                          </span>
                        ) : null}
                      </div>
                      <div className="flex gap-2 text-[11px] opacity-70 flex-wrap">
                        <label className="underline cursor-pointer">
                          Receipt
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleReceipt(e, entry.id)}
                            className="hidden"
                          />
                        </label>
                        {receiptTarget === entry.id ? (
                          <span>Saving…</span>
                        ) : null}
                      </div>
                      {entry.receipt ? (
                        <img
                          src={entry.receipt}
                          alt="Receipt"
                          className="h-16 mt-1 border border-white/30 object-contain"
                        />
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="text-[10px] opacity-60 hover:opacity-100"
                    >
                      remove
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
