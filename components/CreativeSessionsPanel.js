// components/CreativeSessionsPanel.js
"use client";

import { useState } from "react";
import { useDailyPersistentState } from "../lib/useDailyPersistentState";

const SESSION_TYPES = ["Music", "Art", "Writing", "Other"];
const SESSION_STATES = ["Idea", "In Progress", "Recorded", "Ready"];

export default function CreativeSessionsPanel() {
  const [sessions, setSessions, isHydrated, todayKey] =
    useDailyPersistentState("creative_sessions", []);

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("Music");
  const [state, setState] = useState("Idea");
  const [notes, setNotes] = useState("");

  const safeSessions = Array.isArray(sessions) ? sessions : [];

  const addSession = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setSessions((current) => {
      const list = Array.isArray(current) ? current : [];
      return [
        ...list,
        {
          id: Date.now(),
          title: trimmed,
          kind,
          state,
          notes: notes.trim(),
        },
      ];
    });

    setTitle("");
    setNotes("");
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addSession();
    }
  };

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
        Capture today&apos;s active creative blocks. Each day keeps its own
        session list on this device.
      </p>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading sessions…</p>
      ) : (
        <>
          {/* Input block */}
          <div className="border border-white/30 bg-black/50 px-3 py-3 mb-3 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
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
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes: tempo, mood, what to hit next in this block…"
              className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[64px]"
            />
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

          {/* List */}
          {safeSessions.length === 0 ? (
            <p className="text-xs opacity-60">
              No sessions logged for today yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {safeSessions
                .slice()
                .sort((a, b) => b.id - a.id)
                .map((session) => (
                  <li
                    key={session.id}
                    className="border border-white/25 bg-black/40 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
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
                        </div>
                        {session.notes ? (
                          <p className="text-xs opacity-80 whitespace-pre-wrap">
                            {session.notes}
                          </p>
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
