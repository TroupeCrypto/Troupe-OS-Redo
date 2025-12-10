// components/ObligationsPanel.js
"use client";

import { useDailyPersistentState } from "../lib/useDailyPersistentState";
import { useState } from "react";

export default function ObligationsPanel() {
  const [items, setItems, isHydrated, todayKey] =
    useDailyPersistentState("today_obligations", []);
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setItems((current) => {
      const list = Array.isArray(current) ? current : [];
      return [
        ...list,
        {
          id: Date.now(),
          text: trimmed,
          done: false,
        },
      ];
    });

    setDraft("");
  };

  const toggleDone = (id) => {
    setItems((current) => {
      const list = Array.isArray(current) ? current : [];
      return list.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      );
    });
  };

  const removeItem = (id) => {
    setItems((current) => {
      const list = Array.isArray(current) ? current : [];
      return list.filter((item) => item.id !== id);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addItem();
    }
  };

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="px-4 py-3 sm:px-6 sm:py-4 border-t border-white/40">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xs tracking-[0.25em] uppercase">
          Obligations
        </h2>
        <span className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          {todayKey}
        </span>
      </div>

      <p className="text-sm opacity-80 mb-3">
        Capture immediate things you cannot afford to forget for{" "}
        <span className="opacity-100">{todayKey}</span>. Each day gets its
        own list on this device.
      </p>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading…</p>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rent due, call X, send Y, pay Z…"
              className="flex-1 bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[56px]"
            />
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-2 text-xs border border-white/70 tracking-[0.18em] uppercase"
            >
              Add
            </button>
          </div>

          {safeItems.length === 0 ? (
            <p className="text-xs opacity-60">
              No obligations captured yet for today.
            </p>
          ) : (
            <ul className="space-y-1">
              {safeItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleDone(item.id)}
                    className="flex-1 text-left text-sm"
                  >
                    <span
                      className={
                        "inline-block mr-2 h-[10px] w-[10px] border border-white/70 align-middle " +
                        (item.done ? "bg-white" : "")
                      }
                    />
                    <span
                      className={
                        "align-middle " +
                        (item.done ? "line-through opacity-50" : "")
                      }
                    >
                      {item.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
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
