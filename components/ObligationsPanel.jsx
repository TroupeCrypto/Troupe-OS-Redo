"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "troupe_os_obligations_v1";

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
    console.error("Failed to persist Obligations state", err);
  }
}

function createEmptyItem(extra = {}) {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    label: "",
    dueDate: "",
    amount: "",
    person: "",
    location: "",
    notes: "",
    done: false,
    pinned: false,
    ...extra,
  };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function ObligationsHeader({ counts }) {
  const { total, open, done } = counts;
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          Obligations
        </p>
        <h2 className="text-sm font-semibold">External Demands</h2>
      </div>
      <div className="text-right">
        <p className="text-[10px] opacity-60">
          Total: {total} · Open: {open} · Done: {done}
        </p>
      </div>
    </header>
  );
}

function FilterBar({ filter, onChange }) {
  const options = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "due-today", label: "Due Today" },
    { value: "overdue", label: "Overdue" },
    { value: "done", label: "Completed" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="text-[10px] tracking-[0.22em] uppercase opacity-60">
        View
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-2 py-1 text-[10px] rounded-sm border ${
              filter === opt.value
                ? "border-white text-white"
                : "border-white/25 text-white/70 hover:border-white/60 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ObligationRow({ item, category, onChange, onToggleDone, onTogglePinned, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...item, [field]: value });
  };

  return (
    <div
      className={`rounded-sm border px-2 py-2 mb-1 text-[11px] ${
        item.done ? "border-emerald-400/60 bg-emerald-400/5" : "border-white/18 bg-black/30"
      }`}
    >
      <div className="flex items-start gap-2 mb-1">
        <button
          type="button"
          onClick={onToggleDone}
          className={`mt-[2px] w-4 h-4 rounded-sm border flex items-center justify-center text-[9px] ${
            item.done
              ? "border-emerald-300 bg-emerald-300 text-black"
              : "border-white/40 text-transparent"
          }`}
        >
          ✓
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={item.label}
            onChange={(e) => handleFieldChange("label", e.target.value)}
            className="w-full bg-transparent border border-white/15 px-2 py-1 text-[11px] rounded-sm outline-none focus:border-white/60"
            placeholder=""
          />
          <div className="mt-1 grid grid-cols-2 gap-1">
            {/* Due date + amount/person depending on category */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">Due</span>
              <input
                type="date"
                value={item.dueDate}
                onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                className="flex-1 bg-black/50 border border-white/15 px-1 py-1 text-[10px] rounded-sm outline-none focus:border-white/60"
              />
            </div>
            {category === "financial" && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase opacity-50">Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={item.amount}
                  onChange={(e) => handleFieldChange("amount", e.target.value)}
                  className="flex-1 bg-black/50 border border-white/15 px-1 py-1 text-[10px] rounded-sm outline-none focus:border-white/60"
                  placeholder=""
                />
              </div>
            )}
            {category === "time" && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase opacity-50">Location</span>
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                  className="flex-1 bg-black/50 border border-white/15 px-1 py-1 text-[10px] rounded-sm outline-none focus:border-white/60"
                  placeholder=""
                />
              </div>
            )}
            {category === "social" && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase opacity-50">Person</span>
                <input
                  type="text"
                  value={item.person}
                  onChange={(e) => handleFieldChange("person", e.target.value)}
                  className="flex-1 bg-black/50 border border-white/15 px-1 py-1 text-[10px] rounded-sm outline-none focus:border-white/60"
                  placeholder=""
                />
              </div>
            )}
            {category === "admin" && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase opacity-50">Context</span>
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                  className="flex-1 bg-black/50 border border-white/15 px-1 py-1 text-[10px] rounded-sm outline-none focus:border-white/60"
                  placeholder=""
                />
              </div>
            )}
          </div>
          <textarea
            value={item.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="mt-1 w-full bg-black/40 border border-white/15 px-2 py-1 text-[10px] rounded-sm outline-none focus:border-white/60 min-h-[38px] resize-vertical"
            placeholder=""
          />
        </div>
        <div className="flex flex-col items-end gap-1 ml-1">
          <button
            type="button"
            onClick={onTogglePinned}
            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
              item.pinned
                ? "border-yellow-300 text-yellow-300"
                : "border-white/25 text-white/40 hover:border-yellow-300 hover:text-yellow-300"
            }`}
          >
            ●
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

function ObligationSection({
  title,
  subtitle,
  category,
  items,
  filter,
  onChangeItems,
}) {
  const handleAdd = () => {
    onChangeItems([...items, createEmptyItem({ category })]);
  };

  const handleChangeItem = (index, nextItem) => {
    const next = items.map((it, i) => (i === index ? nextItem : it));
    onChangeItems(next);
  };

  const handleToggleDone = (index) => {
    const next = items.map((it, i) =>
      i === index ? { ...it, done: !it.done } : it
    );
    onChangeItems(next);
  };

  const handleTogglePinned = (index) => {
    const next = items.map((it, i) =>
      i === index ? { ...it, pinned: !it.pinned } : it
    );
    onChangeItems(next);
  };

  const handleRemove = (index) => {
    const next = items.filter((_, i) => i !== index);
    onChangeItems(next);
  };

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const filteredItems = useMemo(() => {
    const base = [...items];

    // pin on top within this section
    base.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    if (filter === "all") return base;
    if (filter === "done") return base.filter((it) => it.done);
    if (filter === "open") return base.filter((it) => !it.done);

    if (filter === "due-today") {
      return base.filter(
        (it) =>
          !it.done &&
          it.dueDate &&
          it.dueDate === todayStr
      );
    }

    if (filter === "overdue") {
      return base.filter((it) => {
        if (it.done || !it.dueDate) return false;
        return it.dueDate < todayStr;
      });
    }

    return base;
  }, [items, filter, todayStr]);

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            {title}
          </p>
          {subtitle && (
            <p className="text-[10px] opacity-50">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] opacity-70 hover:opacity-100 border border-white/30 px-2 py-1 rounded-sm"
        >
          + Add
        </button>
      </div>
      {filteredItems.length === 0 ? (
        <p className="text-[11px] opacity-40 mt-1">
          No items in this section for the current view.
        </p>
      ) : (
        <div>
          {filteredItems.map((item, index) => (
            <ObligationRow
              key={item.id}
              item={item}
              category={category}
              onChange={(nextItem) => {
                const originalIndex = items.findIndex((x) => x.id === item.id);
                if (originalIndex === -1) return;
                handleChangeItem(originalIndex, nextItem);
              }}
              onToggleDone={() => {
                const originalIndex = items.findIndex((x) => x.id === item.id);
                if (originalIndex === -1) return;
                handleToggleDone(originalIndex);
              }}
              onTogglePinned={() => {
                const originalIndex = items.findIndex((x) => x.id === item.id);
                if (originalIndex === -1) return;
                handleTogglePinned(originalIndex);
              }}
              onRemove={() => {
                const originalIndex = items.findIndex((x) => x.id === item.id);
                if (originalIndex === -1) return;
                handleRemove(originalIndex);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryStrip({ state }) {
  const allItems = [
    ...state.financial,
    ...state.time,
    ...state.social,
    ...state.admin,
  ];
  const total = allItems.length;
  const open = allItems.filter((it) => !it.done).length;
  const done = total - open;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const dueToday = allItems.filter(
    (it) => !it.done && it.dueDate && it.dueDate === todayStr
  ).length;

  const overdue = allItems.filter(
    (it) => !it.done && it.dueDate && it.dueDate < todayStr
  ).length;

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 text-[10px]">
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Counts</p>
        <p className="mt-1 opacity-80">
          Total: {total} · Open: {open} · Done: {done}
        </p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Time Pressure</p>
        <p className="mt-1 opacity-80">
          Due today: {dueToday} · Overdue: {overdue}
        </p>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function ObligationsPanel() {
  const [state, setState] = useState(() => ({
    financial: [],
    time: [],
    social: [],
    admin: [],
    filter: "open",
  }));

  // hydrate
  useEffect(() => {
    const initial = loadInitialState();
    if (initial) {
      setState((prev) => ({
        ...prev,
        ...initial,
        financial: Array.isArray(initial.financial) ? initial.financial : [],
        time: Array.isArray(initial.time) ? initial.time : [],
        social: Array.isArray(initial.social) ? initial.social : [],
        admin: Array.isArray(initial.admin) ? initial.admin : [],
      }));
    }
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const allItems = [
    ...state.financial,
    ...state.time,
    ...state.social,
    ...state.admin,
  ];
  const counts = {
    total: allItems.length,
    open: allItems.filter((it) => !it.done).length,
    done: allItems.filter((it) => it.done).length,
  };

  return (
    <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
      <ObligationsHeader counts={counts} />

      <FilterBar
        filter={state.filter}
        onChange={(filter) => setState((s) => ({ ...s, filter }))}
      />

      <SummaryStrip state={state} />

      <ObligationSection
        title="Financial"
        subtitle="Bills, debts, renewals, subscriptions."
        category="financial"
        items={state.financial}
        filter={state.filter}
        onChangeItems={(financial) => setState((s) => ({ ...s, financial }))}
      />

      <ObligationSection
        title="Time / Calendar"
        subtitle="Appointments, calls, events with time anchors."
        category="time"
        items={state.time}
        filter={state.filter}
        onChangeItems={(time) => setState((s) => ({ ...s, time }))}
      />

      <ObligationSection
        title="Social / Relational"
        subtitle="People you owe responses, favors, or follow-ups."
        category="social"
        items={state.social}
        filter={state.filter}
        onChangeItems={(social) => setState((s) => ({ ...s, social }))}
      />

      <ObligationSection
        title="Admin / Ops"
        subtitle="Chores, errands, administration, maintenance."
        category="admin"
        items={state.admin}
        filter={state.filter}
        onChangeItems={(admin) => setState((s) => ({ ...s, admin }))}
      />
    </section>
  );
}
