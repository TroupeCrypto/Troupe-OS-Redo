"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "troupe_os_money_snapshot_v1";

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
    console.error("Failed to persist Money Snapshot state", err);
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createEmptyAccount(extra = {}) {
  return {
    id: createId(),
    label: "",
    type: "Cash",
    currency: "USD",
    balance: "",
    isDebt: false,
    pinned: false,
    includeInTotals: true,
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...extra,
  };
}

function createEmptyIncome(extra = {}) {
  return {
    id: createId(),
    label: "",
    amount: "",
    currency: "USD",
    cadence: "Monthly",
    active: true,
    pinned: false,
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...extra,
  };
}

function createEmptyBucket(extra = {}) {
  return {
    id: createId(),
    label: "",
    currency: "USD",
    allocated: "",
    spent: "",
    pinned: false,
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...extra,
  };
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function MoneySnapshotHeader({ netWorth, totalAssets, totalDebts }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          Money Snapshot
        </p>
        <h2 className="text-sm font-semibold">Today&apos;s Position</h2>
      </div>
      <div className="text-right text-[10px] opacity-80">
        <p>Net worth: {netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        <p className="opacity-60">
          Assets: {totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })} · Debts:{" "}
          {totalDebts.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    </header>
  );
}

function HighLevelTargets({ targets, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...targets, [field]: value });
  };

  return (
    <section className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
      <div className="border border-white/22 rounded-sm px-2 py-2">
        <label className="block text-[9px] tracking-[0.2em] uppercase opacity-60 mb-1">
          Cash Buffer Target
        </label>
        <input
          type="number"
          value={targets.cashBuffer}
          onChange={(e) => handleChange("cashBuffer", e.target.value)}
          className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70"
          placeholder=""
        />
        <p className="mt-1 text-[10px] opacity-55">
          Amount that makes today feel safe.
        </p>
      </div>
      <div className="border border-white/22 rounded-sm px-2 py-2">
        <label className="block text-[9px] tracking-[0.2em] uppercase opacity-60 mb-1">
          Monthly Income Target
        </label>
        <input
          type="number"
          value={targets.monthlyIncomeTarget}
          onChange={(e) => handleChange("monthlyIncomeTarget", e.target.value)}
          className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70"
          placeholder=""
        />
        <p className="mt-1 text-[10px] opacity-55">
          What &quot;good month&quot; income looks like.
        </p>
      </div>
      <div className="border border-white/22 rounded-sm px-2 py-2">
        <label className="block text-[9px] tracking-[0.2em] uppercase opacity-60 mb-1">
          Short-Term Focus
        </label>
        <textarea
          value={targets.shortTermFocus}
          onChange={(e) => handleChange("shortTermFocus", e.target.value)}
          className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 min-h-[46px] resize-vertical"
          placeholder=""
        />
      </div>
    </section>
  );
}

function SummaryStrip({ monthlyIncome, buckets }) {
  const totalAllocated = buckets.reduce(
    (sum, b) => sum + toNumber(b.allocated),
    0
  );
  const totalSpent = buckets.reduce((sum, b) => sum + toNumber(b.spent), 0);
  const remaining = totalAllocated - totalSpent;

  return (
    <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Flow</p>
        <p className="mt-1 opacity-80">
          Est. monthly income: {monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Buckets</p>
        <p className="mt-1 opacity-80">
          Allocated: {totalAllocated.toLocaleString(undefined, { maximumFractionDigits: 0 })} · Spent:{" "}
          {totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Available</p>
        <p className="mt-1 opacity-80">
          Remaining across buckets:{" "}
          {remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
}

function AccountRow({ account, onChange, onTogglePinned, onToggleDebt, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...account,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const numericBalance = toNumber(account.balance);
  const effectiveBalance = account.isDebt ? -Math.abs(numericBalance) : numericBalance;

  return (
    <div
      className={`border rounded-sm px-2 py-2 mb-1 text-[11px] ${
        account.isDebt
          ? "border-red-400/70 bg-red-400/5"
          : "border-white/18 bg-black/40"
      }`}
    >
      <div className="flex items-start gap-2 mb-1">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            account.pinned
              ? "border-yellow-300 text-yellow-300"
              : "border-white/25 text-white/40 hover:border-yellow-300 hover:text-yellow-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <div className="grid grid-cols-[minmax(0,1fr),auto] gap-1 mb-1">
            <input
              type="text"
              value={account.label}
              onChange={(e) => handleFieldChange("label", e.target.value)}
              className="bg-transparent border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70"
              placeholder=""
            />
            <select
              value={account.type}
              onChange={(e) => handleFieldChange("type", e.target.value)}
              className="bg-black/60 border border-white/20 px-1 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            >
              <option>Cash</option>
              <option>Bank</option>
              <option>Credit</option>
              <option>Brokerage</option>
              <option>Crypto</option>
              <option>Other</option>
            </select>
          </div>
          <div className="grid grid-cols-[auto,1fr,auto,auto] gap-1 items-center">
            <span className="text-[9px] uppercase opacity-50">Bal</span>
            <input
              type="number"
              value={account.balance}
              onChange={(e) => handleFieldChange("balance", e.target.value)}
              className="bg-black/60 border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70"
              placeholder=""
            />
            <select
              value={account.currency}
              onChange={(e) => handleFieldChange("currency", e.target.value)}
              className="bg-black/60 border border-white/20 px-1 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CAD</option>
              <option>Other</option>
            </select>
            <button
              type="button"
              onClick={onToggleDebt}
              className={`px-2 py-1 rounded-sm text-[10px] border ${
                account.isDebt
                  ? "border-red-400 text-red-300"
                  : "border-white/25 text-white/60"
              }`}
            >
              {account.isDebt ? "Debt" : "Asset"}
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] opacity-70">
            <span>
              Effective: {effectiveBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
              {account.currency}
            </span>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={account.includeInTotals}
                onChange={(e) => handleFieldChange("includeInTotals", e.target.checked)}
                className="w-3 h-3"
              />
              <span>Include in totals</span>
            </label>
          </div>
          <textarea
            value={account.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="mt-1 w-full bg-black/60 border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70 text-[10px] min-h-[34px] resize-vertical"
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

function AccountsSection({ accounts, onChangeAccounts }) {
  const handleAdd = () => {
    onChangeAccounts([...accounts, createEmptyAccount()]);
  };

  const handleChange = (id, next) => {
    const nextList = accounts.map((a) => (a.id === id ? next : a));
    onChangeAccounts(nextList);
  };

  const handleTogglePinned = (id) => {
    const nextList = accounts.map((a) =>
      a.id === id
        ? { ...a, pinned: !a.pinned, updatedAt: new Date().toISOString() }
        : a
    );
    onChangeAccounts(nextList);
  };

  const handleToggleDebt = (id) => {
    const nextList = accounts.map((a) =>
      a.id === id
        ? { ...a, isDebt: !a.isDebt, updatedAt: new Date().toISOString() }
        : a
    );
    onChangeAccounts(nextList);
  };

  const handleRemove = (id) => {
    const nextList = accounts.filter((a) => a.id !== id);
    onChangeAccounts(nextList);
  };

  const visible = useMemo(
    () =>
      accounts
        .slice()
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }),
    [accounts]
  );

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            Accounts
          </p>
          <p className="text-[10px] opacity-50">
            Cash, banks, cards, brokerage, crypto.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] opacity-70 hover:opacity-100 border border-white/30 px-2 py-1 rounded-sm"
        >
          + Account
        </button>
      </div>
      {visible.length === 0 ? (
        <p className="text-[11px] opacity-40 mt-1">
          No accounts yet. Add each place where money lives or is owed.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {visible.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              onChange={(next) => handleChange(account.id, next)}
              onTogglePinned={() => handleTogglePinned(account.id)}
              onToggleDebt={() => handleToggleDebt(account.id)}
              onRemove={() => handleRemove(account.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function IncomeRow({ income, onChange, onTogglePinned, onToggleActive, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...income,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      className={`border rounded-sm px-2 py-2 mb-1 text-[11px] ${
        income.active
          ? "border-emerald-400/60 bg-emerald-400/5"
          : "border-white/18 bg-black/40 opacity-70"
      }`}
    >
      <div className="flex items-start gap-2 mb-1">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            income.pinned
              ? "border-emerald-300 text-emerald-300"
              : "border-white/25 text-white/40 hover:border-emerald-300 hover:text-emerald-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={income.label}
            onChange={(e) => handleFieldChange("label", e.target.value)}
            className="w-full bg-transparent border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70"
            placeholder=""
          />
          <div className="mt-1 grid grid-cols-[auto,1fr,auto,auto] gap-1 items-center">
            <span className="text-[9px] uppercase opacity-50">Amount</span>
            <input
              type="number"
              value={income.amount}
              onChange={(e) => handleFieldChange("amount", e.target.value)}
              className="bg-black/60 border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70"
              placeholder=""
            />
            <select
              value={income.currency}
              onChange={(e) => handleFieldChange("currency", e.target.value)}
              className="bg-black/60 border border-white/20 px-1 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CAD</option>
              <option>Other</option>
            </select>
            <select
              value={income.cadence}
              onChange={(e) => handleFieldChange("cadence", e.target.value)}
              className="bg-black/60 border border-white/20 px-1 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Biweekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
              <option>Irregular</option>
            </select>
          </div>
          <textarea
            value={income.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="mt-1 w-full bg-black/60 border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70 text-[10px] min-h-[34px] resize-vertical"
            placeholder=""
          />
        </div>
        <div className="flex flex-col items-end gap-1 ml-1">
          <button
            type="button"
            onClick={onToggleActive}
            className={`px-2 py-1 rounded-sm text-[10px] border ${
              income.active
                ? "border-emerald-400 text-emerald-300"
                : "border-white/25 text-white/60"
            }`}
          >
            {income.active ? "Active" : "Paused"}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-[9px] opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function IncomeSection({ income, onChangeIncome }) {
  const handleAdd = () => {
    onChangeIncome([...income, createEmptyIncome()]);
  };

  const handleChange = (id, next) => {
    const nextList = income.map((inc) => (inc.id === id ? next : inc));
    onChangeIncome(nextList);
  };

  const handleTogglePinned = (id) => {
    const nextList = income.map((inc) =>
      inc.id === id
        ? { ...inc, pinned: !inc.pinned, updatedAt: new Date().toISOString() }
        : inc
    );
    onChangeIncome(nextList);
  };

  const handleToggleActive = (id) => {
    const nextList = income.map((inc) =>
      inc.id === id
        ? { ...inc, active: !inc.active, updatedAt: new Date().toISOString() }
        : inc
    );
    onChangeIncome(nextList);
  };

  const handleRemove = (id) => {
    const nextList = income.filter((inc) => inc.id !== id);
    onChangeIncome(nextList);
  };

  const visible = useMemo(
    () =>
      income
        .slice()
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }),
    [income]
  );

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            Income Streams
          </p>
          <p className="text-[10px] opacity-50">
            Jobs, side income, royalties, recurring inflows.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] opacity-70 hover:opacity-100 border border-white/30 px-2 py-1 rounded-sm"
        >
          + Income
        </button>
      </div>
      {visible.length === 0 ? (
        <p className="text-[11px] opacity-40 mt-1">
          No income sources recorded yet. Add each distinct stream.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {visible.map((inc) => (
            <IncomeRow
              key={inc.id}
              income={inc}
              onChange={(next) => handleChange(inc.id, next)}
              onTogglePinned={() => handleTogglePinned(inc.id)}
              onToggleActive={() => handleToggleActive(inc.id)}
              onRemove={() => handleRemove(inc.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BucketRow({ bucket, onChange, onTogglePinned, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...bucket,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const allocated = toNumber(bucket.allocated);
  const spent = toNumber(bucket.spent);
  const remaining = allocated - spent;

  return (
    <div className="border border-white/18 bg-black/40 rounded-sm px-2 py-2 mb-1 text-[11px]">
      <div className="flex items-start gap-2 mb-1">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            bucket.pinned
              ? "border-sky-300 text-sky-300"
              : "border-white/25 text-white/40 hover:border-sky-300 hover:text-sky-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={bucket.label}
            onChange={(e) => handleFieldChange("label", e.target.value)}
            className="w-full bg-transparent border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70"
            placeholder=""
          />
          <div className="mt-1 grid grid-cols-[auto,1fr,auto,1fr] gap-1 items-center">
            <span className="text-[9px] uppercase opacity-50">Alloc</span>
            <input
              type="number"
              value={bucket.allocated}
              onChange={(e) => handleFieldChange("allocated", e.target.value)}
              className="bg-black/60 border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70"
              placeholder=""
            />
            <span className="text-[9px] uppercase opacity-50">Spent</span>
            <input
              type="number"
              value={bucket.spent}
              onChange={(e) => handleFieldChange("spent", e.target.value)}
              className="bg-black/60 border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70"
              placeholder=""
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] opacity-75">
            <span>
              Remaining:{" "}
              {remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
              {bucket.currency}
            </span>
            <select
              value={bucket.currency}
              onChange={(e) => handleFieldChange("currency", e.target.value)}
              className="bg-black/60 border border-white/20 px-1 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CAD</option>
              <option>Other</option>
            </select>
          </div>
          <textarea
            value={bucket.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="mt-1 w-full bg-black/60 border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70 text-[10px] min-h-[34px] resize-vertical"
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

function BucketsSection({ buckets, onChangeBuckets }) {
  const handleAdd = () => {
    onChangeBuckets([...buckets, createEmptyBucket()]);
  };

  const handleChange = (id, next) => {
    const nextList = buckets.map((b) => (b.id === id ? next : b));
    onChangeBuckets(nextList);
  };

  const handleTogglePinned = (id) => {
    const nextList = buckets.map((b) =>
      b.id === id
        ? { ...b, pinned: !b.pinned, updatedAt: new Date().toISOString() }
        : b
    );
    onChangeBuckets(nextList);
  };

  const handleRemove = (id) => {
    const nextList = buckets.filter((b) => b.id !== id);
    onChangeBuckets(nextList);
  };

  const visible = useMemo(
    () =>
      buckets
        .slice()
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }),
    [buckets]
  );

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            Buckets / Envelopes
          </p>
          <p className="text-[10px] opacity-50">
            Categories you are actively feeding.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] opacity-70 hover:opacity-100 border border-white/30 px-2 py-1 rounded-sm"
        >
          + Bucket
        </button>
      </div>
      {visible.length === 0 ? (
        <p className="text-[11px] opacity-40 mt-1">
          No buckets defined. Add categories like rent, food, creative, debt
          payoff.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {visible.map((bucket) => (
            <BucketRow
              key={bucket.id}
              bucket={bucket}
              onChange={(next) => handleChange(bucket.id, next)}
              onTogglePinned={() => handleTogglePinned(bucket.id)}
              onRemove={() => handleRemove(bucket.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NotesSection({ value, onChange }) {
  return (
    <section className="mt-2">
      <label className="block text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
        Money Notes
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/60 border border-white/22 px-2 py-2 rounded-sm outline-none focus:border-white/70 text-[11px] min-h-[52px] resize-vertical"
        placeholder=""
      />
    </section>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function MoneySnapshotPanel() {
  const [state, setState] = useState(() => ({
    targets: {
      cashBuffer: "",
      monthlyIncomeTarget: "",
      shortTermFocus: "",
    },
    accounts: [],
    income: [],
    buckets: [],
    notes: "",
  }));

  // hydrate
  useEffect(() => {
    const initial = loadInitialState();
    if (initial) {
      setState((prev) => ({
        ...prev,
        ...initial,
        targets: {
          ...prev.targets,
          ...(initial.targets || {}),
        },
        accounts: Array.isArray(initial.accounts) ? initial.accounts : [],
        income: Array.isArray(initial.income) ? initial.income : [],
        buckets: Array.isArray(initial.buckets) ? initial.buckets : [],
      }));
    }
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  // derived totals
  const totals = useMemo(() => {
    const included = state.accounts.filter((a) => a.includeInTotals);
    let totalAssets = 0;
    let totalDebts = 0;

    included.forEach((acc) => {
      const val = toNumber(acc.balance);
      if (!val) return;
      if (acc.isDebt) {
        totalDebts += Math.abs(val);
      } else {
        totalAssets += val;
      }
    });

    const netWorth = totalAssets - totalDebts;

    let monthlyIncome = 0;
    state.income.forEach((inc) => {
      if (!inc.active) return;
      const amt = toNumber(inc.amount);
      if (!amt) return;

      switch (inc.cadence) {
        case "Daily":
          monthlyIncome += amt * 30;
          break;
        case "Weekly":
          monthlyIncome += amt * 4;
          break;
        case "Biweekly":
          monthlyIncome += amt * 2;
          break;
        case "Monthly":
          monthlyIncome += amt;
          break;
        case "Yearly":
          monthlyIncome += amt / 12;
          break;
        case "Irregular":
        default:
          break;
      }
    });

    return { totalAssets, totalDebts, netWorth, monthlyIncome };
  }, [state.accounts, state.income]);

  return (
    <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
      <MoneySnapshotHeader
        netWorth={totals.netWorth}
        totalAssets={totals.totalAssets}
        totalDebts={totals.totalDebts}
      />

      <HighLevelTargets
        targets={state.targets}
        onChange={(targets) => setState((s) => ({ ...s, targets }))}
      />

      <SummaryStrip monthlyIncome={totals.monthlyIncome} buckets={state.buckets} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <AccountsSection
            accounts={state.accounts}
            onChangeAccounts={(accounts) => setState((s) => ({ ...s, accounts }))}
          />
        </div>
        <div>
          <IncomeSection
            income={state.income}
            onChangeIncome={(income) => setState((s) => ({ ...s, income }))}
          />
          <BucketsSection
            buckets={state.buckets}
            onChangeBuckets={(buckets) => setState((s) => ({ ...s, buckets }))}
          />
        </div>
      </div>

      <NotesSection
        value={state.notes}
        onChange={(notes) => setState((s) => ({ ...s, notes }))}
      />
    </section>
  );
}
