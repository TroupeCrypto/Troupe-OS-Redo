"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "troupe_os_daily_money_ledger_v1";

function loadInitialState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
    console.error("Failed to persist Daily Money Ledger state", err);
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyEntry(extra = {}) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    date: todayStr(),
    type: "expense", // expense | income | transfer
    method: "cash", // cash | card | digital | crypto | other
    category: "essentials", // essentials | work | creative | health | fun | debt | other
    amount: "",
    currency: "USD",
    description: "",
    tag: "",
    notes: "",
    pinned: false,
    createdAt: now,
    updatedAt: now,
    ...extra,
  };
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function LedgerHeader({ selectedDate, totals }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          Daily Money Ledger
        </p>
        <h2 className="text-sm font-semibold">Flow for {selectedDate}</h2>
      </div>
      <div className="text-right text-[10px] opacity-80">
        <p>
          Spent:{" "}
          {totals.spent.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </p>
        <p>
          In:{" "}
          {totals.income.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}{" "}
          · Net:{" "}
          {totals.net.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </p>
      </div>
    </header>
  );
}

function DateControls({ selectedDate, onChange }) {
  const handleShift = (days) => {
    const d = new Date(selectedDate || todayStr());
    d.setDate(d.getDate() + days);
    onChange(d.toISOString().slice(0, 10));
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px]">
      <span className="uppercase tracking-[0.18em] opacity-60">Day</span>
      <button
        type="button"
        onClick={() => handleShift(-1)}
        className="border border-white/40 px-2 py-1 rounded-sm"
      >
        ◀
      </button>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value || todayStr())}
        className="bg-black/60 border border-white/35 px-2 py-1 rounded-sm outline-none focus:border-white/80"
      />
      <button
        type="button"
        onClick={() => onChange(todayStr())}
        className="border border-white/40 px-2 py-1 rounded-sm"
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => handleShift(1)}
        className="border border-white/40 px-2 py-1 rounded-sm"
      >
        ▶
      </button>
    </div>
  );
}

function SummaryStrip({ dayTotals, weekTotals }) {
  return (
    <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
      <div className="border border-white/22 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Today</p>
        <p className="mt-1 opacity-80">
          Spent:{" "}
          {dayTotals.spent.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </p>
        <p className="opacity-80">
          In:{" "}
          {dayTotals.income.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}{" "}
          · Net:{" "}
          {dayTotals.net.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </p>
      </div>
      <div className="border border-white/22 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Last 7 Days</p>
        <p className="mt-1 opacity-80">
          Spent:{" "}
          {weekTotals.spent.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </p>
        <p className="opacity-80">
          In:{" "}
          {weekTotals.income.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}{" "}
          · Net:{" "}
          {weekTotals.net.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </p>
      </div>
      <div className="border border-white/22 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Pattern</p>
        <p className="mt-1 opacity-80">
          Essentials vs other is visible in the ledger below; keep essentials
          pinned and obvious.
        </p>
      </div>
    </div>
  );
}

function QuickAddBar({
  date,
  type,
  method,
  category,
  description,
  amount,
  onChangeField,
  onCommit,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (description.trim() && amount.trim()) onCommit();
    }
  };

  return (
    <section className="mb-3 border border-white/20 rounded-md px-3 py-2 text-[11px]">
      <p className="text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
        Quick Add
      </p>
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr,auto,auto,auto,auto] gap-2 items-center">
        <input
          type="text"
          value={description}
          onChange={(e) => onChangeField("quickDescription", e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          placeholder=""
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => onChangeField("quickAmount", e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80 w-full"
          placeholder=""
        />
        <select
          value={type}
          onChange={(e) => onChangeField("quickType", e.target.value)}
          className="bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
        </select>
        <select
          value={method}
          onChange={(e) => onChangeField("quickMethod", e.target.value)}
          className="bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="digital">Digital</option>
          <option value="crypto">Crypto</option>
          <option value="other">Other</option>
        </select>
        <select
          value={category}
          onChange={(e) => onChangeField("quickCategory", e.target.value)}
          className="bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
        >
          <option value="essentials">Essentials</option>
          <option value="work">Work</option>
          <option value="creative">Creative</option>
          <option value="health">Health</option>
          <option value="fun">Fun</option>
          <option value="debt">Debt</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] opacity-70">
          <span className="uppercase tracking-[0.18em]">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => onChangeField("quickDate", e.target.value)}
            className="bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <button
            type="button"
            onClick={onCommit}
            disabled={!description.trim() || !amount.trim()}
            className="border border-white/80 px-3 py-1 rounded-sm uppercase tracking-[0.18em] disabled:border-white/25 disabled:text-white/35"
          >
            Save Entry
          </button>
          <span className="opacity-60">⌘+Enter / Ctrl+Enter</span>
        </div>
      </div>
    </section>
  );
}

function Row({ entry, onChange, onTogglePinned, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...entry,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const numeric = toNumber(entry.amount);
  const signedAmount =
    entry.type === "income"
      ? numeric
      : entry.type === "expense"
      ? -Math.abs(numeric)
      : 0;

  const isPositive = signedAmount >= 0;

  return (
    <div
      className={`border rounded-sm px-2 py-2 mb-1 text-[11px] ${
        entry.type === "income"
          ? "border-emerald-400/70 bg-emerald-400/5"
          : entry.type === "expense"
          ? "border-red-400/70 bg-red-400/5"
          : "border-white/20 bg-black/40"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            entry.pinned
              ? "border-yellow-300 text-yellow-300"
              : "border-white/25 text-white/40 hover:border-yellow-300 hover:text-yellow-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <input
              type="text"
              value={entry.description}
              onChange={(e) =>
                handleFieldChange("description", e.target.value)
              }
              className="flex-1 bg-transparent border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder=""
            />
            <input
              type="number"
              value={entry.amount}
              onChange={(e) => handleFieldChange("amount", e.target.value)}
              className="w-24 bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder=""
            />
            <select
              value={entry.currency}
              onChange={(e) =>
                handleFieldChange("currency", e.target.value)
              }
              className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CAD</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <select
              value={entry.type}
              onChange={(e) => handleFieldChange("type", e.target.value)}
              className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
            <select
              value={entry.method}
              onChange={(e) => handleFieldChange("method", e.target.value)}
              className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="digital">Digital</option>
              <option value="crypto">Crypto</option>
              <option value="other">Other</option>
            </select>
            <select
              value={entry.category}
              onChange={(e) =>
                handleFieldChange("category", e.target.value)
              }
              className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
            >
              <option value="essentials">Essentials</option>
              <option value="work">Work</option>
              <option value="creative">Creative</option>
              <option value="health">Health</option>
              <option value="fun">Fun</option>
              <option value="debt">Debt</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              value={entry.tag}
              onChange={(e) => handleFieldChange("tag", e.target.value)}
              className="flex-1 bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder=""
            />
            <div className="flex items-center gap-1 text-[10px] opacity-70 ml-auto">
              <span>{entry.date}</span>
              <span>
                {isPositive ? "+" : ""}
                {signedAmount.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{" "}
                {entry.currency}
              </span>
            </div>
          </div>
          <textarea
            value={entry.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80 text-[10px] min-h-[32px] resize-vertical"
            placeholder=""
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[9px] opacity-60 hover:opacity-100 mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function FiltersBar({
  typeFilter,
  methodFilter,
  categoryFilter,
  onChangeType,
  onChangeMethod,
  onChangeCategory,
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-3 text-[10px]">
      <div className="flex items-center gap-1">
        <span className="uppercase tracking-[0.18em] opacity-60">
          Type
        </span>
        <select
          value={typeFilter}
          onChange={(e) => onChangeType(e.target.value)}
          className="bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
        >
          <option value="all">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>
      <div className="flex items-center gap-1">
        <span className="uppercase tracking-[0.18em] opacity-60">
          Method
        </span>
        <select
          value={methodFilter}
          onChange={(e) => onChangeMethod(e.target.value)}
          className="bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
        >
          <option value="all">All</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="digital">Digital</option>
          <option value="crypto">Crypto</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex items-center gap-1">
        <span className="uppercase tracking-[0.18em] opacity-60">
          Category
        </span>
        <select
          value={categoryFilter}
          onChange={(e) => onChangeCategory(e.target.value)}
          className="bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
        >
          <option value="all">All</option>
          <option value="essentials">Essentials</option>
          <option value="work">Work</option>
          <option value="creative">Creative</option>
          <option value="health">Health</option>
          <option value="fun">Fun</option>
          <option value="debt">Debt</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
}

function LedgerList({
  entries,
  onChangeEntry,
  onTogglePinned,
  onRemoveEntry,
}) {
  if (entries.length === 0) {
    return (
      <p className="text-[11px] opacity-40 mt-1">
        No entries for this day and filter set. Log something in Quick Add.
      </p>
    );
  }

  return (
    <div className="max-h-72 overflow-y-auto pr-1">
      {entries.map((entry) => (
        <Row
          key={entry.id}
          entry={entry}
          onChange={(next) => onChangeEntry(entry.id, next)}
          onTogglePinned={() => onTogglePinned(entry.id)}
          onRemove={() => onRemoveEntry(entry.id)}
        />
      ))}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function DailyMoneyLedgerPanel() {
  const [state, setState] = useState(() => ({
    entries: [],
    selectedDate: todayStr(),
    typeFilter: "all",
    methodFilter: "all",
    categoryFilter: "all",
    quickDescription: "",
    quickAmount: "",
    quickType: "expense",
    quickMethod: "cash",
    quickCategory: "essentials",
    quickDate: todayStr(),
  }));

  // hydrate
  useEffect(() => {
    const initial = loadInitialState();
    if (initial) {
      setState((prev) => ({
        ...prev,
        ...initial,
        entries: Array.isArray(initial.entries) ? initial.entries : [],
        selectedDate: initial.selectedDate || todayStr(),
        quickDate: initial.quickDate || todayStr(),
      }));
    }
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const dayEntries = useMemo(
    () =>
      state.entries.filter((e) => e.date === state.selectedDate),
    [state.entries, state.selectedDate]
  );

  const filteredEntries = useMemo(() => {
    return dayEntries
      .slice()
      .filter((e) =>
        state.typeFilter === "all" ? true : e.type === state.typeFilter
      )
      .filter((e) =>
        state.methodFilter === "all" ? true : e.method === state.methodFilter
      )
      .filter((e) =>
        state.categoryFilter === "all"
          ? true
          : e.category === state.categoryFilter
      )
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // newest at top
        return (b.updatedAt || "").localeCompare(a.updatedAt || "");
      });
  }, [
    dayEntries,
    state.typeFilter,
    state.methodFilter,
    state.categoryFilter,
  ]);

  const dayTotals = useMemo(() => {
    let spent = 0;
    let income = 0;
    dayEntries.forEach((e) => {
      const amt = toNumber(e.amount);
      if (!amt) return;
      if (e.type === "income") income += amt;
      if (e.type === "expense") spent += amt;
    });
    return {
      spent,
      income,
      net: income - spent,
    };
  }, [dayEntries]);

  const weekTotals = useMemo(() => {
    const selected = new Date(state.selectedDate || todayStr());
    const weekEntries = state.entries.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      const diffDays = Math.floor(
        (selected.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays >= 0 && diffDays < 7;
    });

    let spent = 0;
    let income = 0;
    weekEntries.forEach((e) => {
      const amt = toNumber(e.amount);
      if (!amt) return;
      if (e.type === "income") income += amt;
      if (e.type === "expense") spent += amt;
    });
    return {
      spent,
      income,
      net: income - spent,
    };
  }, [state.entries, state.selectedDate]);

  const handleChangeField = (field, value) => {
    setState((s) => ({ ...s, [field]: value }));
  };

  const handleCommitQuick = () => {
    const description = state.quickDescription.trim();
    const amount = state.quickAmount.trim();
    if (!description || !amount) return;
    const entry = createEmptyEntry({
      description,
      amount,
      type: state.quickType,
      method: state.quickMethod,
      category: state.quickCategory,
      date: state.quickDate || state.selectedDate || todayStr(),
    });
    setState((s) => ({
      ...s,
      entries: [entry, ...s.entries],
      quickDescription: "",
      quickAmount: "",
      selectedDate: entry.date,
    }));
  };

  const handleChangeEntry = (id, next) => {
    setState((s) => ({
      ...s,
      entries: s.entries.map((e) => (e.id === id ? next : e)),
    }));
  };

  const handleTogglePinned = (id) => {
    setState((s) => ({
      ...s,
      entries: s.entries.map((e) =>
        e.id === id
          ? { ...e, pinned: !e.pinned, updatedAt: new Date().toISOString() }
          : e
      ),
    }));
  };

  const handleRemoveEntry = (id) => {
    setState((s) => ({
      ...s,
      entries: s.entries.filter((e) => e.id !== id),
    }));
  };

  return (
    <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
      <LedgerHeader selectedDate={state.selectedDate} totals={dayTotals} />

      <DateControls
        selectedDate={state.selectedDate}
        onChange={(selectedDate) =>
          setState((s) => ({ ...s, selectedDate, quickDate: selectedDate }))
        }
      />

      <SummaryStrip dayTotals={dayTotals} weekTotals={weekTotals} />

      <QuickAddBar
        date={state.quickDate}
        type={state.quickType}
        method={state.quickMethod}
        category={state.quickCategory}
        description={state.quickDescription}
        amount={state.quickAmount}
        onChangeField={handleChangeField}
        onCommit={handleCommitQuick}
      />

      <FiltersBar
        typeFilter={state.typeFilter}
        methodFilter={state.methodFilter}
        categoryFilter={state.categoryFilter}
        onChangeType={(typeFilter) => setState((s) => ({ ...s, typeFilter }))}
        onChangeMethod={(methodFilter) =>
          setState((s) => ({ ...s, methodFilter }))
        }
        onChangeCategory={(categoryFilter) =>
          setState((s) => ({ ...s, categoryFilter }))
        }
      />

      <LedgerList
        entries={filteredEntries}
        onChangeEntry={handleChangeEntry}
        onTogglePinned={handleTogglePinned}
        onRemoveEntry={handleRemoveEntry}
      />
    </section>
  );
}
