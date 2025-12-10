// components/ObligationsPanel.js
"use client";

import { usePersistentState } from "../lib/usePersistentState";
import { useState } from "react";

export default function ObligationsPanel() {
  const [items, setItems, isHydrated] = usePersistentState(
    "today_obligations",
    []
  );
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next = [
      ...items,
      {
        id: Date.now(),
        text: trimmed,
        done: false,
      },
    ];
    setItems(next);
    setDraft("");
  };

  const toggleDone = (id) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setItems(next);
  };

  const removeItem = (id) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <section className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <h2 className="text-xs tracking-[0.25em] uppercase mb-2">
        Obligations
      </h2>

      <p className="text-sm opacity-80 mb-3">
        Capture immediate things you cannot afford to forget. Later this will
        sync with reminders, money, and commitments. For now, it stays local
        to this device.
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

          {items.length === 0 ? (
            <p className="text-xs opacity-60">
              No obligations captured yet. Add the things you can&apos;t miss
              today.
            </p>
          ) : (
            <ul className="space-y-1">
              {items.map((item) => (
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
