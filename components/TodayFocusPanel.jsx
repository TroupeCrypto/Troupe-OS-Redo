"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "troupe_os_today_focus_v1";

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
    console.error("Failed to persist Today Focus state", err);
  }
}

// Subcomponents
function TodayFocusHeader({ dateLabel }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          Today Focus
        </p>
        <h2 className="text-sm font-semibold">Operating Horizon</h2>
      </div>
      <span className="text-[11px] opacity-60">{dateLabel}</span>
    </header>
  );
}

function PrimaryFocusSection({ value, onChange }) {
  return (
    <section className="mb-3">
      <label className="block text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
        Primary Focus
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/50 border border-white/20 px-2 py-2 text-[12px] rounded-sm outline-none focus:border-white/60 min-h-[56px] resize-vertical"
        placeholder=""
      />
    </section>
  );
}

function SecondaryFocusSection({ value, onChange }) {
  return (
    <section className="mb-3">
      <label className="block text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
        Secondary Focus
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/50 border border-white/20 px-2 py-2 text-[12px] rounded-sm outline-none focus:border-white/60 min-h-[48px] resize-vertical"
        placeholder=""
      />
    </section>
  );
}

function TaskRow({ task, onChangeTask, onToggleDone, onRemove }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <button
        type="button"
        onClick={onToggleDone}
        className={`w-4 h-4 rounded-sm border border-white/40 flex items-center justify-center text-[10px] ${
          task.done ? "bg-white text-black" : "bg-transparent text-transparent"
        }`}
      >
        ✓
      </button>
      <input
        type="text"
        value={task.label}
        onChange={(e) => onChangeTask(e.target.value)}
        className="flex-1 bg-black/50 border border-white/20 px-2 py-1 text-[12px] rounded-sm outline-none focus:border-white/60"
        placeholder=""
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-[10px] opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

function TopTasksSection({ tasks, onChangeTasks }) {
  const handleChangeTask = (index, label) => {
    const next = tasks.map((t, i) =>
      i === index ? { ...t, label } : t
    );
    onChangeTasks(next);
  };

  const handleToggleDone = (index) => {
    const next = tasks.map((t, i) =>
      i === index ? { ...t, done: !t.done } : t
    );
    onChangeTasks(next);
  };

  const handleRemove = (index) => {
    const next = tasks.filter((_, i) => i !== index);
    onChangeTasks(next);
  };

  const handleAdd = () => {
    onChangeTasks([...tasks, { id: crypto.randomUUID(), label: "", done: false }]);
  };

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[10px] tracking-[0.22em] uppercase opacity-70">
          Top Tasks
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] opacity-70 hover:opacity-100"
        >
          + Add
        </button>
      </div>
      <div>
        {tasks.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            onChangeTask={(label) => handleChangeTask(index, label)}
            onToggleDone={() => handleToggleDone(index)}
            onRemove={() => handleRemove(index)}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-[11px] opacity-40 mt-1">
            No tasks yet. Use “+ Add” to define today&apos;s moves.
          </p>
        )}
      </div>
    </section>
  );
}

function TimeBlockRow({ block, onChange, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...block, [field]: value });
  };

  return (
    <div className="grid grid-cols-[auto,1fr,auto] gap-2 mb-1 items-center">
      <div className="flex items-center gap-1">
        <input
          type="time"
          value={block.start}
          onChange={(e) => handleFieldChange("start", e.target.value)}
          className="bg-black/50 border border-white/20 px-1 py-1 text-[11px] rounded-sm outline-none focus:border-white/60 w-[72px]"
        />
        <span className="text-[10px] opacity-60">→</span>
        <input
          type="time"
          value={block.end}
          onChange={(e) => handleFieldChange("end", e.target.value)}
          className="bg-black/50 border border-white/20 px-1 py-1 text-[11px] rounded-sm outline-none focus:border-white/60 w-[72px]"
        />
      </div>
      <input
        type="text"
        value={block.label}
        onChange={(e) => handleFieldChange("label", e.target.value)}
        className="bg-black/50 border border-white/20 px-2 py-1 text-[12px] rounded-sm outline-none focus:border-white/60"
        placeholder=""
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-[10px] opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

function TimeBlocksSection({ blocks, onChangeBlocks }) {
  const handleChangeBlock = (index, nextBlock) => {
    const next = blocks.map((b, i) => (i === index ? nextBlock : b));
    onChangeBlocks(next);
  };

  const handleRemove = (index) => {
    const next = blocks.filter((_, i) => i !== index);
    onChangeBlocks(next);
  };

  const handleAdd = () => {
    onChangeBlocks([
      ...blocks,
      { id: crypto.randomUUID(), start: "", end: "", label: "" },
    ]);
  };

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[10px] tracking-[0.22em] uppercase opacity-70">
          Time Blocks
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] opacity-70 hover:opacity-100"
        >
          + Add
        </button>
      </div>
      <div>
        {blocks.map((block, index) => (
          <TimeBlockRow
            key={block.id}
            block={block}
            onChange={(nextBlock) => handleChangeBlock(index, nextBlock)}
            onRemove={() => handleRemove(index)}
          />
        ))}
        {blocks.length === 0 && (
          <p className="text-[11px] opacity-40 mt-1">
            Use blocks to reserve deep-focus windows, admin sweeps, or creative
            sprints.
          </p>
        )}
      </div>
    </section>
  );
}

function GuardrailsSection({ distractions, onChangeDistractions, rewards, onChangeRewards }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
          Distractions to Avoid
        </label>
        <textarea
          value={distractions}
          onChange={(e) => onChangeDistractions(e.target.value)}
          className="w-full bg-black/50 border border-white/20 px-2 py-2 text-[12px] rounded-sm outline-none focus:border-white/60 min-h-[60px] resize-vertical"
          placeholder=""
        />
      </div>
      <div>
        <label className="block text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
          Micro-Rewards
        </label>
        <textarea
          value={rewards}
          onChange={(e) => onChangeRewards(e.target.value)}
          className="w-full bg-black/50 border border-white/20 px-2 py-2 text-[12px] rounded-sm outline-none focus:border-white/60 min-h-[60px] resize-vertical"
          placeholder=""
        />
      </div>
    </section>
  );
}

export default function TodayFocusPanel() {
  const [state, setState] = useState(() => ({
    primaryFocus: "",
    secondaryFocus: "",
    topTasks: [],
    timeBlocks: [],
    distractions: "",
    rewards: "",
  }));

  // hydrate from localStorage
  useEffect(() => {
    const initial = loadInitialState();
    if (initial) {
      setState((prev) => ({
        ...prev,
        ...initial,
        topTasks: Array.isArray(initial.topTasks) ? initial.topTasks : [],
        timeBlocks: Array.isArray(initial.timeBlocks) ? initial.timeBlocks : [],
      }));
    }
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
      <TodayFocusHeader dateLabel={todayLabel} />

      <PrimaryFocusSection
        value={state.primaryFocus}
        onChange={(primaryFocus) => setState((s) => ({ ...s, primaryFocus }))}
      />

      <SecondaryFocusSection
        value={state.secondaryFocus}
        onChange={(secondaryFocus) => setState((s) => ({ ...s, secondaryFocus }))}
      />

      <TopTasksSection
        tasks={state.topTasks}
        onChangeTasks={(topTasks) => setState((s) => ({ ...s, topTasks }))}
      />

      <TimeBlocksSection
        blocks={state.timeBlocks}
        onChangeBlocks={(timeBlocks) => setState((s) => ({ ...s, timeBlocks }))}
      />

      <GuardrailsSection
        distractions={state.distractions}
        onChangeDistractions={(distractions) =>
          setState((s) => ({ ...s, distractions }))
        }
        rewards={state.rewards}
        onChangeRewards={(rewards) =>
          setState((s) => ({ ...s, rewards }))
        }
      />
    </section>
  );
}
