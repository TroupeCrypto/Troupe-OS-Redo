// components/CreativeSessionsPanel.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useDailyPersistentState } from "../lib/useDailyPersistentState";
import { usePersistentState } from "../lib/usePersistentState";
import { useEventLog } from "../lib/useEventLog";

const SESSION_TYPES = ["Music", "Art", "Writing", "Design", "R&D"];
const SESSION_STATES = ["Idea", "In Progress", "Recorded", "Ready"];

export default function CreativeSessionsPanel() {
  const [sessions, setSessions, isHydrated, todayKey] =
    useDailyPersistentState("creative_sessions", []);
  const [streakData, setStreakData] = usePersistentState(
    "creative_streaks",
    { days: [] }
  );
  const { appendEvent } = useEventLog();

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("Music");
  const [state, setState] = useState("Idea");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("neutral");
  const [project, setProject] = useState("");
  const [revenueTag, setRevenueTag] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [activeTab, setActiveTab] = useState("Music");

  const safeSessions = useMemo(
    () => (Array.isArray(sessions) ? sessions : []),
    [sessions]
  );
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowTs(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (safeSessions.length > 0) {
      const today = todayKey;
      if (!streakData.days?.includes(today)) {
        setStreakData((curr) => ({
          days: [...(curr?.days || []), today],
        }));
      }
    }
  }, [safeSessions, todayKey, streakData, setStreakData]);

  const addSession = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const now = Date.now();
    const entry = {
      id: now,
      title: trimmed,
      kind,
      state,
      notes: notes.trim(),
      mood,
      project: project.trim(),
      revenueTag: revenueTag.trim(),
      timerMinutes: minutes,
      startedAt: now,
      outputs: [],
    };

    setSessions((current) => {
      const list = Array.isArray(current) ? current : [];
      return [...list, entry];
    });

    setTitle("");
    setNotes("");
    setProject("");
    setRevenueTag("");

    appendEvent({
      panel: "Creative",
      category: kind,
      action: "start-session",
      data: entry,
      tags: [mood],
    });
  };

  const updateState = (id, nextState) => {
    setSessions((current) => {
      const list = Array.isArray(current) ? current : [];
      return list.map((s) =>
        s.id === id ? { ...s, state: nextState } : s
      );
    });
  };

  const removeSession = (id) => {
    setSessions((current) => {
      const list = Array.isArray(current) ? current : [];
      return list.filter((s) => s.id !== id);
    });
  };

  const handleUpload = (e, id) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSessions((current) => {
        const list = Array.isArray(current) ? current : [];
        return list.map((s) =>
          s.id === id
            ? { ...s, outputs: [...(s.outputs || []), reader.result] }
            : s
        );
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const filteredSessions = safeSessions.filter(
    (s) => s.kind === activeTab
  );

  const streakCount = streakData.days?.length || 0;

  const stalled =
    safeSessions.filter((s) => nowTs - s.startedAt > 90 * 60 * 1000)
      .length > 0;

  return (
    <section className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xs tracking-[0.25em] uppercase">
          Sessions
        </h2>
        <span className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          {todayKey}
        </span>
      </div>

      <p className="text-sm opacity-80 mb-3 max-w-2xl">
        Capture today&apos;s creative blocks with timers, moods, and revenue
        tags. Streaks increment per active day.
      </p>

      <div className="flex flex-wrap gap-2 mb-3 text-[11px] uppercase tracking-[0.18em]">
        {SESSION_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={
              "px-3 py-1 border " +
              (activeTab === t
                ? "border-white/90"
                : "border-white/40 opacity-70")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading sessions…</p>
      ) : (
        <>
          {/* Input block */}
          <div className="border border-white/30 bg-black/50 px-3 py-3 mb-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Track title, piece name, or idea handle"
                className="flex-1 bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="bg-black/60 border border-white/30 px-2 py-2 text-xs tracking-[0.18em] uppercase outline-none focus:border-white/80"
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="bg-black/60 border border-white/30 px-2 py-2 text-xs tracking-[0.18em] uppercase outline-none focus:border-white/80"
              >
                {SESSION_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="bg-black/60 border border-white/30 px-2 py-2 text-xs tracking-[0.18em] uppercase outline-none focus:border-white/80"
              >
                {["neutral", "calm", "wired", "blocked", "flow"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Project tag"
                className="bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
              <input
                value={revenueTag}
                onChange={(e) => setRevenueTag(e.target.value)}
                placeholder="Revenue link (deal, drop, client)"
                className="bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
              <input
                type="number"
                min="5"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes: tempo, mood, what to hit next in this block…"
                className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[64px]"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addSession}
                className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
              >
                Add Session
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="flex flex-wrap gap-2 mb-2 text-[11px]">
            <span className="border border-white/30 px-2 py-[2px] rounded-full">
              Streak: {streakCount} days
            </span>
            {stalled ? (
              <span className="border border-amber-400 px-2 py-[2px] rounded-full text-amber-200">
                Block detected: session stale
              </span>
            ) : null}
          </div>

          {/* List */}
          {filteredSessions.length === 0 ? (
            <p className="text-xs opacity-60">
              No sessions logged for this type today.
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredSessions
                .slice()
                .sort((a, b) => b.id - a.id)
                .map((session) => (
                  <li
                    key={session.id}
                    className="border border-white/25 bg-black/40 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm">
                            {session.title}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.18em] border border-white/40 px-2 py-[1px]">
                            {session.kind}
                          </span>
                          <select
                            value={session.state}
                            onChange={(e) =>
                              updateState(session.id, e.target.value)
                            }
                            className="text-[10px] uppercase tracking-[0.18em] bg-black/70 border border-white/40 px-2 py-[1px] outline-none"
                          >
                            {SESSION_STATES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <span className="text-[11px] opacity-70">
                            Mood: {session.mood}
                          </span>
                          {session.project ? (
                            <span className="text-[10px] uppercase tracking-[0.18em] border border-white/40 px-2 py-[1px]">
                              {session.project}
                            </span>
                          ) : null}
                          {session.revenueTag ? (
                            <span className="text-[10px] uppercase tracking-[0.18em] border border-emerald-400 px-2 py-[1px] text-emerald-200">
                              {session.revenueTag}
                            </span>
                          ) : null}
                        </div>
                        {session.notes ? (
                          <p className="text-xs opacity-80 whitespace-pre-wrap">
                            {session.notes}
                          </p>
                        ) : null}
                        <p className="text-[11px] opacity-60 mt-1">
                          Timer: {session.timerMinutes} min
                        </p>
                        <label className="text-[11px] underline cursor-pointer">
                          Upload output
                          <input
                            type="file"
                            accept="image/*,audio/*"
                            onChange={(e) => handleUpload(e, session.id)}
                            className="hidden"
                          />
                        </label>
                        {session.outputs?.length ? (
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {session.outputs.map((out, idx) => (
                              <img
                                key={idx}
                                src={out}
                                alt="session output"
                                className="h-16 border border-white/30 object-cover"
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSession(session.id)}
                        className="text-[10px] opacity-60 hover:opacity-100"
                      >
                        remove
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
