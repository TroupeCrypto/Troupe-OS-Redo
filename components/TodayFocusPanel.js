// components/TodayFocusPanel.js
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDailyPersistentState } from "../lib/useDailyPersistentState";
import { useEventLog } from "../lib/useEventLog";

const DEFAULT_STATE = {
  intent: "",
  tasks: [],
  blocks: [],
  priority: "Medium",
  rewards: [],
};

const PRIORITY_LEVELS = [
  { value: "Low", color: "text-emerald-300" },
  { value: "Medium", color: "text-white" },
  { value: "High", color: "text-amber-300" },
  { value: "Critical", color: "text-red-300" },
];

export default function TodayFocusPanel() {
  const [state, setState, isHydrated, todayKey] =
    useDailyPersistentState("today_focus", DEFAULT_STATE);
  const { appendEvent } = useEventLog();
  const [activeTab, setActiveTab] = useState("Tasks");
  const [taskDraft, setTaskDraft] = useState("");
  const [intentDraft, setIntentDraft] = useState("");
  const [blockDraft, setBlockDraft] = useState({
    label: "",
    minutes: 25,
  });
  const [rewardDraft, setRewardDraft] = useState("");
  const [tick, setTick] = useState(0);

  const safeState = useMemo(
    () => ({
      intent: state?.intent ?? "",
      tasks: Array.isArray(state?.tasks) ? state.tasks : [],
      blocks: Array.isArray(state?.blocks) ? state.blocks : [],
      priority: PRIORITY_LEVELS.some((p) => p.value === state?.priority)
        ? state?.priority
        : "Medium",
      rewards: Array.isArray(state?.rewards) ? state.rewards : [],
    }),
    [state]
  );

  // Heartbeat for countdowns
  useEffect(() => {
    setTick(Date.now());
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const lockedTasks = safeState.tasks.filter((t) => t.locked);

  const updateState = useCallback(
    (patch) => {
      setState((current) => ({
        ...(current || DEFAULT_STATE),
        ...patch,
      }));
    },
    [setState]
  );

  const addTask = () => {
    const trimmed = taskDraft.trim();
    if (!trimmed) return;
    const next = {
      id: Date.now(),
      text: trimmed,
      done: false,
      locked: lockedTasks.length < 3, // auto-lock until cap
    };
    updateState({ tasks: [...safeState.tasks, next] });
    setTaskDraft("");
    appendEvent({
      panel: "Today",
      category: "Tasks",
      action: "add-task",
      outcome: "created",
      data: next,
      tags: ["today", "focus"],
    });
  };

  const toggleTask = (id) => {
    const updated = safeState.tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    updateState({ tasks: updated });
    appendEvent({
      panel: "Today",
      category: "Tasks",
      action: "toggle-task",
      outcome: updated.find((t) => t.id === id)?.done ? "done" : "open",
      data: { id },
    });
  };

  const toggleLock = (id) => {
    const target = safeState.tasks.find((t) => t.id === id);
    if (!target) return;

    if (!target.locked && lockedTasks.length >= 3) {
      window.alert("Top-3 non-negotiables already set. Unlock one first.");
      return;
    }

    const updated = safeState.tasks.map((t) =>
      t.id === id ? { ...t, locked: !t.locked } : t
    );
    updateState({ tasks: updated });
  };

  const removeTask = (id) => {
    updateState({ tasks: safeState.tasks.filter((t) => t.id !== id) });
  };

  const saveIntent = () => {
    const next = intentDraft.trim();
    updateState({ intent: next });
    appendEvent({
      panel: "Today",
      category: "Intent",
      action: "update-intent",
      data: { intent: next },
    });
  };

  const addBlock = () => {
    const label = blockDraft.label.trim();
    const minutes = Number(blockDraft.minutes) || 0;
    if (!label || minutes <= 0) return;
    const block = {
      id: Date.now(),
      label,
      minutes,
      status: "idle",
      startedAt: null,
    };
    updateState({ blocks: [...safeState.blocks, block] });
    setBlockDraft({ label: "", minutes: 25 });
  };

  const startBlock = (id) => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const updated = safeState.blocks.map((b) =>
      b.id === id
        ? {
            ...b,
            status: "running",
            startedAt: now,
          }
        : { ...b, status: b.status === "running" ? "idle" : b.status }
    );
    updateState({ blocks: updated });
  };

  const stopBlock = useCallback(
    (id, finished = false) => {
      const updated = safeState.blocks.map((b) =>
        b.id === id
          ? {
              ...b,
              status: finished ? "done" : "idle",
            }
          : b
      );
      updateState({ blocks: updated });
    },
    [safeState.blocks, updateState]
  );

  const addReward = () => {
    const label = rewardDraft.trim();
    if (!label) return;
    const reward = {
      id: Date.now(),
      label,
      unlocked: false,
    };
    updateState({ rewards: [...safeState.rewards, reward] });
    setRewardDraft("");
  };

  const unlockEligibleRewards = () => {
    const allLockedDone =
      lockedTasks.length > 0 &&
      lockedTasks.every((t) => t.done === true);
    const updated = safeState.rewards.map((r) =>
      allLockedDone ? { ...r, unlocked: true } : r
    );
    updateState({ rewards: updated });
    appendEvent({
      panel: "Today",
      category: "Rewards",
      action: "unlock",
      outcome: allLockedDone ? "unlocked" : "pending",
      data: { lockedDone: allLockedDone },
    });
  };

  const activeRunningBlock = safeState.blocks.find(
    (b) => b.status === "running"
  );

  const runningRemaining = useMemo(() => {
    if (!activeRunningBlock?.startedAt) return null;
    const elapsedMs = tick - activeRunningBlock.startedAt;
    const totalMs = activeRunningBlock.minutes * 60 * 1000;
    const remaining = Math.max(totalMs - elapsedMs, 0);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  }, [activeRunningBlock, tick]);

  useEffect(() => {
    if (activeRunningBlock && runningRemaining === "0:00") {
      stopBlock(activeRunningBlock.id, true);
      appendEvent({
        panel: "Today",
        category: "Time Blocks",
        action: "block-finished",
        data: { label: activeRunningBlock.label },
      });
    }
  }, [activeRunningBlock, runningRemaining, stopBlock, appendEvent]);

  if (!isHydrated) {
    return (
      <section className="px-4 py-3 sm:px-6 sm:py-4">
        <p className="text-sm opacity-70">Loading…</p>
      </section>
    );
  }

  return (
    <section className="px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xs tracking-[0.25em] uppercase">
          Today&apos;s Focus
        </h2>
        <span className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          {todayKey}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3 text-[11px] uppercase tracking-[0.18em]">
        {["Tasks", "Intent", "Time Blocks", "Priority", "Rewards"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                "px-3 py-1 border " +
                (activeTab === tab
                  ? "border-white/90"
                  : "border-white/40 opacity-70")
              }
            >
              {tab}
            </button>
          )
        )}
      </div>

      {activeTab === "Tasks" && (
        <div className="space-y-3">
          <div className="border border-white/30 bg-black/50 px-3 py-3">
            <p className="text-xs opacity-80 mb-2">
              Top-3 non-negotiables auto-lock. Unlock one to promote another.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={taskDraft}
                onChange={(e) => setTaskDraft(e.target.value)}
                placeholder="Task title"
                className="flex-1 bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
              <button
                type="button"
                onClick={addTask}
                className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
              >
                Add Task
              </button>
            </div>
          </div>

          <ul className="space-y-2">
            {safeState.tasks.length === 0 ? (
              <p className="text-xs opacity-60">
                No tasks added for today yet.
              </p>
            ) : (
              safeState.tasks
                .slice()
                .sort((a, b) => Number(b.locked) - Number(a.locked))
                .map((task) => (
                  <li
                    key={task.id}
                    className="border border-white/25 bg-black/40 px-3 py-2 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className={
                            "h-4 w-4 border " +
                            (task.done
                              ? "bg-white border-white"
                              : "border-white/60")
                          }
                          aria-label="toggle task"
                        />
                        <span
                          className={
                            "text-sm " +
                            (task.done ? "line-through opacity-60" : "")
                          }
                        >
                          {task.text}
                        </span>
                        {task.locked && (
                          <span className="text-[10px] uppercase tracking-[0.18em] border border-white/50 px-2 py-[1px]">
                            Non-Negotiable
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1 text-[11px] opacity-70">
                        <button
                          type="button"
                          onClick={() => toggleLock(task.id)}
                          className="underline"
                        >
                          {task.locked ? "Unlock" : "Lock"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))
            )}
          </ul>
        </div>
      )}

      {activeTab === "Intent" && (
        <div className="space-y-2">
          <p className="text-sm opacity-80">
            Daily intent anchors the day. It is stored locally per date.
          </p>
          <textarea
            value={intentDraft || safeState.intent}
            onChange={(e) => setIntentDraft(e.target.value)}
            placeholder="State the intent for today with clear outcomes."
            className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[120px]"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveIntent}
              className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
            >
              Save Intent
            </button>
          </div>
        </div>
      )}

      {activeTab === "Time Blocks" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              value={blockDraft.label}
              onChange={(e) =>
                setBlockDraft((p) => ({ ...p, label: e.target.value }))
              }
              placeholder="Block label"
              className="bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
            <input
              type="number"
              min="5"
              value={blockDraft.minutes}
              onChange={(e) =>
                setBlockDraft((p) => ({
                  ...p,
                  minutes: Number(e.target.value),
                }))
              }
              className="bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
            <button
              type="button"
              onClick={addBlock}
              className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
            >
              Add Block
            </button>
          </div>

          {activeRunningBlock ? (
            <div className="border border-emerald-400/60 px-3 py-2 text-sm flex items-center justify-between">
              <div>
                <p className="uppercase text-[11px] tracking-[0.18em] opacity-70">
                  Running
                </p>
                <p>{activeRunningBlock.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono">{runningRemaining}</span>
                <button
                  type="button"
                  onClick={() => stopBlock(activeRunningBlock.id)}
                  className="text-xs border border-white/70 px-2 py-1 uppercase tracking-[0.18em]"
                >
                  Stop
                </button>
              </div>
            </div>
          ) : null}

          <ul className="space-y-2">
            {safeState.blocks.length === 0 ? (
              <p className="text-xs opacity-60">No blocks scheduled.</p>
            ) : (
              safeState.blocks
                .slice()
                .sort((a, b) => b.id - a.id)
                .map((block) => (
                  <li
                    key={block.id}
                    className="border border-white/25 bg-black/40 px-3 py-2 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm">{block.label}</p>
                      <p className="text-[11px] opacity-60">
                        {block.minutes} min · {block.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {block.status !== "running" && (
                        <button
                          type="button"
                          onClick={() => startBlock(block.id)}
                          className="text-xs border border-white/70 px-2 py-1 uppercase tracking-[0.18em]"
                        >
                          Start
                        </button>
                      )}
                      {block.status === "running" && (
                        <button
                          type="button"
                          onClick={() => stopBlock(block.id)}
                          className="text-xs border border-white/70 px-2 py-1 uppercase tracking-[0.18em]"
                        >
                          Pause
                        </button>
                      )}
                      {block.status === "done" && (
                        <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                          Complete
                        </span>
                      )}
                    </div>
                  </li>
                ))
            )}
          </ul>
        </div>
      )}

      {activeTab === "Priority" && (
        <div className="space-y-3">
          <p className="text-sm opacity-80">
            Set the heat scale for today so downstream panels can react.
          </p>
          <div className="flex gap-2">
            {PRIORITY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => updateState({ priority: level.value })}
                className={
                  "px-3 py-2 border text-xs tracking-[0.18em] uppercase " +
                  (safeState.priority === level.value
                    ? "border-white/90"
                    : "border-white/30 opacity-70")
                }
              >
                <span className={level.color}>{level.value}</span>
              </button>
            ))}
          </div>
          <p className="text-xs opacity-60">
            Heat scale influences alerts and rewards. Current:{" "}
            <span className="opacity-100">{safeState.priority}</span>
          </p>
        </div>
      )}

      {activeTab === "Rewards" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={rewardDraft}
              onChange={(e) => setRewardDraft(e.target.value)}
              placeholder="Reward to unlock (walk, show, treat)"
              className="flex-1 bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
            <button
              type="button"
              onClick={addReward}
              className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
            >
              Add
            </button>
          </div>
          <button
            type="button"
            onClick={unlockEligibleRewards}
            className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
          >
            Unlock when non-negotiables done
          </button>
          <ul className="space-y-2">
            {safeState.rewards.length === 0 ? (
              <p className="text-xs opacity-60">No rewards added.</p>
            ) : (
              safeState.rewards.map((reward) => (
                <li
                  key={reward.id}
                  className="border border-white/25 bg-black/40 px-3 py-2 flex items-center justify-between"
                >
                  <span>{reward.label}</span>
                  <span
                    className={
                      "text-[10px] uppercase tracking-[0.18em] " +
                      (reward.unlocked
                        ? "text-emerald-300"
                        : "text-amber-200")
                    }
                  >
                    {reward.unlocked ? "Unlocked" : "Pending"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[11px] opacity-60">
        This focus is scoped to <span className="opacity-90">{todayKey}</span>.
        Daily intent, non-negotiables, blocks, and rewards stay local and ready
        to sync later.
      </p>
    </section>
  );
}
