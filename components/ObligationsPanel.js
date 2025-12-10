// components/ObligationsPanel.js
"use client";

import { useDailyPersistentState } from "../lib/useDailyPersistentState";
import { useEventLog } from "../lib/useEventLog";
import { useMemo, useState } from "react";

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `ob-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const SUBTABS = ["Bills", "Legal", "Deadlines", "People", "Recurring"];
const RECURRENCE = ["none", "weekly", "monthly"];

export default function ObligationsPanel() {
  const [items, setItems, isHydrated, todayKey] =
    useDailyPersistentState("today_obligations", []);
  const { appendEvent } = useEventLog();
  const [activeTab, setActiveTab] = useState("Bills");
  const [draft, setDraft] = useState("");
  const [person, setPerson] = useState("");
  const [due, setDue] = useState("");
  const [recurring, setRecurring] = useState("none");
  const [legalTag, setLegalTag] = useState("");
  const [amount, setAmount] = useState("");
  const [uploadingId, setUploadingId] = useState(null);
  // eslint-disable-next-line react-hooks/purity
  const nowTs = useMemo(() => Date.now(), []);

  const safeItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items]
  );

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const entry = {
      id: Date.now(),
      text: trimmed,
      category: activeTab,
      person: person.trim() || null,
      due: due || null,
      recurring,
      legal: legalTag.trim() || null,
      amount: amount.trim() || null,
      done: false,
      confirmationImage: null,
    };

    setItems((current) => {
      const list = Array.isArray(current) ? current : [];
      return [...list, entry];
    });

    setDraft("");
    setPerson("");
    setDue("");
    setRecurring("none");
    setLegalTag("");
    setAmount("");

    appendEvent({
      panel: "Obligations",
      category: activeTab,
      action: "add",
      data: entry,
      tags: ["obligation"],
    });
  };

  const toggleDone = (id) => {
    const updated = safeItems.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setItems(updated);

    const changed = updated.find((i) => i.id === id);
    if (changed?.done && changed.recurring !== "none") {
      const nextDue = nextDueDate(changed.due, changed.recurring);
      const nextItem = {
        ...changed,
        id: makeId(),
        due: nextDue,
        done: false,
      };
      setItems([...updated, nextItem]);
    }
  };

  const nextDueDate = (dateStr, recurrence) => {
    const base = dateStr ? new Date(dateStr) : new Date();
    const next = new Date(base.getTime());
    if (recurrence === "weekly") {
      next.setDate(base.getDate() + 7);
    } else if (recurrence === "monthly") {
      next.setMonth(base.getMonth() + 1);
    }
    return next.toISOString().slice(0, 10);
  };

  const removeItem = (id) => {
    setItems(safeItems.filter((item) => item.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addItem();
    }
  };

  const riskLevel = (item) => {
    if (!item.due) return "none";
    const today = new Date(nowTs).toISOString().slice(0, 10);
    if (item.due <= today) return "critical";
    const delta =
      (new Date(item.due).getTime() - nowTs) / (1000 * 60 * 60 * 24);
    if (delta <= 2) return "high";
    if (delta <= 5) return "medium";
    return "low";
  };

  const onUpload = (event, id) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const updated = safeItems.map((item) =>
        item.id === id ? { ...item, confirmationImage: dataUrl } : item
      );
      setItems(updated);
      setUploadingId(null);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const filtered = safeItems.filter(
    (item) => activeTab === "Recurring" ? item.recurring !== "none" : item.category === activeTab
  );

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
        Bills, legal, and people-linked obligations for{" "}
        <span className="opacity-100">{todayKey}</span>. Recurring items
        auto-generate their next instance on completion.
      </p>

      <div className="flex flex-wrap gap-2 mb-3 text-[11px] uppercase tracking-[0.18em]">
        {SUBTABS.map((tab) => (
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
        ))}
      </div>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading…</p>
      ) : (
        <>
          <div className="border border-white/30 bg-black/50 px-3 py-3 space-y-2 mb-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the obligation"
              className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[56px]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <input
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="Person / owner"
                className="bg-black/60 border border-white/30 px-3 py-2 outline-none focus:border-white/80"
              />
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="bg-black/60 border border-white/30 px-3 py-2 outline-none focus:border-white/80"
              />
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value)}
                className="bg-black/60 border border-white/30 px-3 py-2 outline-none focus:border-white/80"
              >
                {RECURRENCE.map((r) => (
                  <option key={r} value={r}>
                    {r === "none" ? "One-time" : r}
                  </option>
                ))}
              </select>
              <input
                value={legalTag}
                onChange={(e) => setLegalTag(e.target.value)}
                placeholder="Legal/compliance tag"
                className="bg-black/60 border border-white/30 px-3 py-2 outline-none focus:border-white/80"
              />
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (optional)"
                className="bg-black/60 border border-white/30 px-3 py-2 outline-none focus:border-white/80"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-2 text-xs border border-white/70 tracking-[0.18em] uppercase"
              >
                Add
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-xs opacity-60">
              No obligations captured yet for this tab.
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 border border-white/20 bg-black/40 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-3">
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
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] opacity-70">
                    {item.person ? (
                      <span className="border border-white/30 px-2 py-[1px] rounded-full">
                        Person: {item.person}
                      </span>
                    ) : null}
                    {item.due ? (
                      <span
                        className={
                          "border px-2 py-[1px] rounded-full " +
                          (riskLevel(item) === "critical"
                            ? "border-red-400 text-red-200"
                            : riskLevel(item) === "high"
                            ? "border-amber-300 text-amber-200"
                            : "border-white/30")
                        }
                      >
                        Due {item.due}
                      </span>
                    ) : null}
                    {item.recurring !== "none" ? (
                      <span className="border border-white/30 px-2 py-[1px] rounded-full">
                        {item.recurring}
                      </span>
                    ) : null}
                    {item.legal ? (
                      <span className="border border-white/30 px-2 py-[1px] rounded-full">
                        Legal: {item.legal}
                      </span>
                    ) : null}
                    {item.amount ? (
                      <span className="border border-white/30 px-2 py-[1px] rounded-full">
                        {item.amount}
                      </span>
                    ) : null}
                    <label className="cursor-pointer border border-white/30 px-2 py-[1px] rounded-full">
                      Upload confirmation
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onUpload(e, item.id)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploadingId === item.id ? (
                    <p className="text-[11px] opacity-70">Saving image…</p>
                  ) : null}
                  {item.confirmationImage ? (
                    <img
                      src={item.confirmationImage}
                      alt="Payment confirmation"
                      className="max-h-32 object-contain border border-white/20"
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
