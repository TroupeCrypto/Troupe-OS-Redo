"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "troupe_os_history_viewer_v1";

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
    console.error("Failed to persist History Viewer state", err);
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createEmptyEntry(dateStr) {
  return {
    id: createId(),
    date: dateStr || new Date().toISOString().slice(0, 10),
    headline: "",
    wins: "",
    lessons: "",
    money: "",
    health: "",
    creative: "",
    notes: "",
    tag: "",
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function HistoryHeader({ rangeLabel, entryCount }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          History
        </p>
        <h2 className="text-sm font-semibold">Past Cycles</h2>
      </div>
      <div className="text-right text-[10px] opacity-70">
        <p>{rangeLabel}</p>
        <p className="opacity-60">Entries: {entryCount}</p>
      </div>
    </header>
  );
}

function RangeFilter({ filter, onChange }) {
  const options = [
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "365", label: "Last year" },
    { value: "all", label: "All time" },
  ];

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px]">
      <span className="uppercase tracking-[0.18em] opacity-60">Range</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-2 py-1 rounded-sm border ${
              filter === opt.value
                ? "border-white text-white"
                : "border-white/30 text-white/70 hover:border-white/70 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TagFilter({ tagFilter, onChange, availableTags }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px]">
      <span className="uppercase tracking-[0.18em] opacity-60">Tag</span>
      <input
        type="text"
        value={tagFilter}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/70"
        placeholder=""
      />
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(tag)}
              className={`px-2 py-1 rounded-sm border ${
                tagFilter.trim().toLowerCase() === tag.toLowerCase()
                  ? "border-white text-white"
                  : "border-white/25 text-white/70 hover:border-white/70 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EntrySummaryStrip({ entries }) {
  if (entries.length === 0) {
    return (
      <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
        <div className="border border-white/20 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60">Summary</p>
          <p className="mt-1 opacity-70">
            No history captured yet. Start with today.
          </p>
        </div>
      </div>
    );
  }

  const sorted = entries
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const firstDate = sorted[0].date;
  const lastDate = sorted[sorted.length - 1].date;

  const countByTag = entries.reduce((acc, e) => {
    const tag = (e.tag || "").trim();
    if (!tag) return acc;
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  const topTag =
    Object.keys(countByTag).length === 0
      ? null
      : Object.entries(countByTag).sort((a, b) => b[1] - a[1])[0][0];

  const withMoney = entries.filter((e) => (e.money || "").trim()).length;
  const withHealth = entries.filter((e) => (e.health || "").trim()).length;
  const withCreative = entries.filter((e) => (e.creative || "").trim()).length;

  return (
    <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Span</p>
        <p className="mt-1 opacity-80">
          {firstDate} → {lastDate}
        </p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Tags</p>
        <p className="mt-1 opacity-80">
          Unique tags: {Object.keys(countByTag).length}
        </p>
        {topTag && (
          <p className="opacity-70 mt-0.5">Most used: {topTag}</p>
        )}
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Signals</p>
        <p className="mt-1 opacity-80">
          Money: {withMoney} · Health: {withHealth} · Creative: {withCreative}
        </p>
      </div>
    </div>
  );
}

function EntryRow({ entry, onChange, onTogglePinned, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...entry,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const dateLabel = entry.date || "";

  return (
    <div
      className={`border rounded-sm px-3 py-2 mb-2 text-[11px] ${
        entry.pinned
          ? "border-indigo-300 bg-indigo-400/5"
          : "border-white/18 bg-black/40"
      }`}
    >
      <div className="flex items-start gap-2 mb-1">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            entry.pinned
              ? "border-indigo-300 text-indigo-300"
              : "border-white/25 text-white/40 hover:border-indigo-300 hover:text-indigo-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">Date</span>
              <input
                type="date"
                value={entry.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                className="bg-black/60 border border-white/22 px-1 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={entry.headline}
                onChange={(e) =>
                  handleFieldChange("headline", e.target.value)
                }
                className="w-full bg-transparent border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70"
                placeholder=""
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase opacity-50">Tag</span>
              <input
                type="text"
                value={entry.tag}
                onChange={(e) => handleFieldChange("tag", e.target.value)}
                className="bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 text-[10px] w-28"
                placeholder=""
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <div>
              <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
                Wins
              </label>
              <textarea
                value={entry.wins}
                onChange={(e) => handleFieldChange("wins", e.target.value)}
                className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 min-h-[40px] resize-vertical"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
                Lessons
              </label>
              <textarea
                value={entry.lessons}
                onChange={(e) =>
                  handleFieldChange("lessons", e.target.value)
                }
                className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 min-h-[40px] resize-vertical"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
                Notes
              </label>
              <textarea
                value={entry.notes}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 min-h-[40px] resize-vertical"
                placeholder=""
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
                Money
              </label>
              <textarea
                value={entry.money}
                onChange={(e) => handleFieldChange("money", e.target.value)}
                className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 min-h-[34px] resize-vertical"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
                Health / Energy
              </label>
              <textarea
                value={entry.health}
                onChange={(e) => handleFieldChange("health", e.target.value)}
                className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 min-h-[34px] resize-vertical"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
                Creative
              </label>
              <textarea
                value={entry.creative}
                onChange={(e) =>
                  handleFieldChange("creative", e.target.value)
                }
                className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 min-h-[34px] resize-vertical"
                placeholder=""
              />
            </div>
          </div>
          <p className="mt-1 text-[9px] opacity-50">
            {dateLabel} · last updated{" "}
            {entry.updatedAt ? entry.updatedAt.slice(0, 16).replace("T", " ") : ""}
          </p>
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

function EntryList({ entries, onChangeEntry, onTogglePinned, onRemoveEntry }) {
  if (entries.length === 0) {
    return (
      <p className="text-[11px] opacity-40 mt-1">
        No entries for this view. Adjust filters or create today&apos;s entry.
      </p>
    );
  }

  return (
    <div className="max-h-72 overflow-y-auto pr-1">
      {entries.map((entry) => (
        <EntryRow
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

function NewEntryControls({ onCreateToday, onCreateBlank }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px]">
      <button
        type="button"
        onClick={onCreateToday}
        className="border border-white/70 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
      >
        New Today
      </button>
      <button
        type="button"
        onClick={onCreateBlank}
        className="border border-white/30 px-2 py-1 rounded-sm uppercase tracking-[0.18em] opacity-80 hover:border-white/70 hover:opacity-100"
      >
        New Blank
      </button>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function HistoryViewerPanel() {
  const [state, setState] = useState(() => ({
    entries: [],
    rangeFilter: "90",
    tagFilter: "",
  }));

  // hydrate
  useEffect(() => {
    const initial = loadInitialState();
    if (initial) {
      setState((prev) => ({
        ...prev,
        ...initial,
        entries: Array.isArray(initial.entries) ? initial.entries : [],
      }));
    }
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const availableTags = useMemo(() => {
    const tags = new Set(
      state.entries
        .map((e) => (e.tag || "").trim())
        .filter((t) => t.length > 0)
    );
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [state.entries]);

  const filteredEntries = useMemo(() => {
    const now = new Date();
    let cutoffDate = null;

    if (state.rangeFilter !== "all") {
      const days = parseInt(state.rangeFilter, 10);
      if (Number.isFinite(days) && days > 0) {
        const d = new Date(now);
        d.setDate(d.getDate() - days);
        cutoffDate = d.toISOString().slice(0, 10);
      }
    }

    return state.entries
      .slice()
      .filter((e) => {
        if (cutoffDate && e.date && e.date < cutoffDate) return false;
        return true;
      })
      .filter((e) => {
        const tagFilter = (state.tagFilter || "").trim();
        if (!tagFilter) return true;
        const tag = (e.tag || "").trim().toLowerCase();
        return tag === tagFilter.toLowerCase();
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (a.date === b.date) {
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }
        return a.date < b.date ? 1 : -1; // newest dates first
      });
  }, [state.entries, state.rangeFilter, state.tagFilter]);

  const rangeLabel = useMemo(() => {
    switch (state.rangeFilter) {
      case "30":
        return "Last 30 days";
      case "90":
        return "Last 90 days";
      case "365":
        return "Last year";
      case "all":
      default:
        return "All time";
    }
  }, [state.rangeFilter]);

  const handleCreateToday = () => {
    setState((s) => {
      const existing = s.entries.find((e) => e.date === todayStr);
      if (existing) {
        const bumped = {
          ...existing,
          pinned: true,
          updatedAt: new Date().toISOString(),
        };
        const others = s.entries.filter((e) => e.id !== existing.id);
        return {
          ...s,
          entries: [bumped, ...others],
        };
      }
      const nextEntry = createEmptyEntry(todayStr);
      return {
        ...s,
        entries: [nextEntry, ...s.entries],
      };
    });
  };

  const handleCreateBlank = () => {
    setState((s) => ({
      ...s,
      entries: [createEmptyEntry(""), ...s.entries],
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
      <HistoryHeader
        rangeLabel={rangeLabel}
        entryCount={filteredEntries.length}
      />

      <NewEntryControls
        onCreateToday={handleCreateToday}
        onCreateBlank={handleCreateBlank}
      />

      <RangeFilter
        filter={state.rangeFilter}
        onChange={(rangeFilter) => setState((s) => ({ ...s, rangeFilter }))}
      />

      <TagFilter
        tagFilter={state.tagFilter}
        onChange={(tagFilter) => setState((s) => ({ ...s, tagFilter }))}
        availableTags={availableTags}
      />

      <EntrySummaryStrip entries={filteredEntries} />

      <EntryList
        entries={filteredEntries}
        onChangeEntry={handleChangeEntry}
        onTogglePinned={handleTogglePinned}
        onRemoveEntry={handleRemoveEntry}
      />
    </section>
  );
}
