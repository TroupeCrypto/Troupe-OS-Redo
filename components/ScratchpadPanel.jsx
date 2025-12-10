"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "troupe_os_scratchpad_v1";

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
    console.error("Failed to persist Scratchpad state", err);
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createEmptyThread() {
  return {
    id: createId(),
    title: "",
    body: "",
    tag: "",
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createEmptyClip() {
  return {
    id: createId(),
    label: "",
    url: "",
    notes: "",
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createEmptyAtom() {
  return {
    id: createId(),
    text: "",
    context: "",
    createdAt: new Date().toISOString(),
  };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function ScratchpadHeader({ atomCount, threadCount, clipCount }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          Scratchpad
        </p>
        <h2 className="text-sm font-semibold">Thinking Surface</h2>
      </div>
      <div className="text-right text-[10px] opacity-70">
        <p>
          Atoms: {atomCount} · Threads: {threadCount} · Clips: {clipCount}
        </p>
      </div>
    </header>
  );
}

function CaptureBar({ value, onChange, onCommit }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim()) onCommit();
    }
  };

  return (
    <section className="mb-3">
      <label className="block text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
        Quick Capture
      </label>
      <div className="flex items-start gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-black/60 border border-white/25 px-2 py-2 text-[12px] rounded-sm outline-none focus:border-white/70 min-h-[48px] resize-vertical"
          placeholder=""
        />
        <button
          type="button"
          onClick={onCommit}
          disabled={!value.trim()}
          className="mt-0.5 px-3 py-2 text-[10px] uppercase tracking-[0.18em] border rounded-sm border-white/70 disabled:border-white/20 disabled:text-white/30"
        >
          Save
        </button>
      </div>
      <p className="mt-1 text-[10px] opacity-50">
        Press ⌘+Enter / Ctrl+Enter to save atom.
      </p>
    </section>
  );
}

function AtomList({ atoms, onRemove }) {
  if (atoms.length === 0) {
    return (
      <p className="text-[11px] opacity-40 mt-1">
        No captured atoms yet. Use Quick Capture to log fragments.
      </p>
    );
  }

  return (
    <div className="max-h-32 overflow-y-auto pr-1">
      {atoms
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .map((atom) => (
          <div
            key={atom.id}
            className="border border-white/18 bg-black/40 rounded-sm px-2 py-1 mb-1 text-[11px] flex items-start gap-2"
          >
            <div className="flex-1">
              <p className="opacity-90">{atom.text}</p>
              {atom.context && (
                <p className="mt-0.5 text-[10px] opacity-55">
                  {atom.context}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onRemove(atom.id)}
              className="text-[9px] opacity-60 hover:opacity-100 mt-0.5"
            >
              ✕
            </button>
          </div>
        ))}
    </div>
  );
}

function ThreadRow({ thread, onChange, onTogglePinned, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...thread,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      className={`border rounded-sm px-2 py-2 mb-1 text-[11px] ${
        thread.pinned
          ? "border-indigo-300 bg-indigo-400/5"
          : "border-white/18 bg-black/40"
      }`}
    >
      <div className="flex items-start gap-2 mb-1">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
            thread.pinned
              ? "border-indigo-300 text-indigo-300"
              : "border-white/25 text-white/40 hover:border-indigo-300 hover:text-indigo-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={thread.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className="w-full bg-transparent border border-white/18 px-2 py-1 text-[11px] rounded-sm outline-none focus:border-white/70"
            placeholder=""
          />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[9px] uppercase opacity-50">Tag</span>
            <input
              type="text"
              value={thread.tag}
              onChange={(e) => handleFieldChange("tag", e.target.value)}
              className="flex-1 bg-black/60 border border-white/18 px-2 py-1 text-[10px] rounded-sm outline-none focus:border-white/70"
              placeholder=""
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[9px] opacity-60 hover:opacity-100 mt-0.5"
        >
          ✕
        </button>
      </div>
      <textarea
        value={thread.body}
        onChange={(e) => handleFieldChange("body", e.target.value)}
        className="w-full bg-black/60 border border-white/18 px-2 py-1 text-[11px] rounded-sm outline-none focus:border-white/70 min-h-[60px] resize-vertical"
        placeholder=""
      />
    </div>
  );
}

function ThreadSection({ threads, filterTag, onChangeThreads, onChangeFilter }) {
  const handleAdd = () => {
    onChangeThreads([...threads, createEmptyThread()]);
  };

  const handleChangeThread = (id, next) => {
    const nextList = threads.map((t) => (t.id === id ? next : t));
    onChangeThreads(nextList);
  };

  const handleTogglePinned = (id) => {
    const nextList = threads.map((t) =>
      t.id === id ? { ...t, pinned: !t.pinned, updatedAt: new Date().toISOString() } : t
    );
    onChangeThreads(nextList);
  };

  const handleRemove = (id) => {
    const nextList = threads.filter((t) => t.id !== id);
    onChangeThreads(nextList);
  };

  const availableTags = useMemo(() => {
    const tags = new Set(
      threads
        .map((t) => (t.tag || "").trim())
        .filter((t) => t.length > 0)
    );
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [threads]);

  const visibleThreads = useMemo(() => {
    const base = threads
      .slice()
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.updatedAt || "").localeCompare(a.updatedAt || "");
      });

    if (!filterTag.trim()) return base;
    return base.filter(
      (t) => (t.tag || "").trim().toLowerCase() === filterTag.trim().toLowerCase()
    );
  }, [threads, filterTag]);

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            Threads
          </p>
          <p className="text-[10px] opacity-50">
            Promote atoms into structured notes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] opacity-70 hover:opacity-100 border border-white/30 px-2 py-1 rounded-sm"
        >
          + Thread
        </button>
      </div>
      <div className="flex items-center gap-2 mb-2 text-[10px]">
        <span className="uppercase tracking-[0.18em] opacity-60">
          Tag Filter
        </span>
        <input
          type="text"
          value={filterTag}
          onChange={(e) => onChangeFilter(e.target.value)}
          className="flex-1 bg-black/60 border border-white/25 px-2 py-1 rounded-sm outline-none focus:border-white/70"
          placeholder=""
        />
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onChangeFilter(tag)}
                className={`px-2 py-1 rounded-sm border text-[10px] ${
                  filterTag.trim().toLowerCase() === tag.toLowerCase()
                    ? "border-white text-white"
                    : "border-white/25 text-white/70 hover:border-white/60 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
      {visibleThreads.length === 0 ? (
        <p className="text-[11px] opacity-40 mt-1">
          No threads for the current filter. Start one or clear the tag filter.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {visibleThreads.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              onChange={(next) => handleChangeThread(thread.id, next)}
              onTogglePinned={() => handleTogglePinned(thread.id)}
              onRemove={() => handleRemove(thread.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ClipRow({ clip, onChange, onTogglePinned, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...clip,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="border border-white/18 bg-black/40 rounded-sm px-2 py-2 mb-1 text-[11px] flex items-start gap-2">
      <button
        type="button"
        onClick={onTogglePinned}
        className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
          clip.pinned
            ? "border-emerald-300 text-emerald-300"
            : "border-white/25 text-white/40 hover:border-emerald-300 hover:text-emerald-300"
        }`}
      >
        ●
      </button>
      <div className="flex-1">
        <input
          type="text"
          value={clip.label}
          onChange={(e) => handleFieldChange("label", e.target.value)}
          className="w-full bg-transparent border border-white/18 px-2 py-1 text-[11px] rounded-sm outline-none focus:border-white/70"
          placeholder=""
        />
        <input
          type="url"
          value={clip.url}
          onChange={(e) => handleFieldChange("url", e.target.value)}
          className="mt-1 w-full bg-black/60 border border-white/18 px-2 py-1 text-[11px] rounded-sm outline-none focus:border-white/70"
          placeholder=""
        />
        <textarea
          value={clip.notes}
          onChange={(e) => handleFieldChange("notes", e.target.value)}
          className="mt-1 w-full bg-black/60 border border-white/18 px-2 py-1 text-[10px] rounded-sm outline-none focus:border-white/70 min-h-[40px] resize-vertical"
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
  );
}

function ClipsSection({ clips, onChangeClips }) {
  const handleAdd = () => {
    onChangeClips([...clips, createEmptyClip()]);
  };

  const handleChange = (id, next) => {
    const nextList = clips.map((c) => (c.id === id ? next : c));
    onChangeClips(nextList);
  };

  const handleTogglePinned = (id) => {
    const nextList = clips.map((c) =>
      c.id === id ? { ...c, pinned: !c.pinned, updatedAt: new Date().toISOString() } : c
    );
    onChangeClips(nextList);
  };

  const handleRemove = (id) => {
    const nextList = clips.filter((c) => c.id !== id);
    onChangeClips(nextList);
  };

  const visible = useMemo(
    () =>
      clips
        .slice()
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }),
    [clips]
  );

  return (
    <section className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            Clips
          </p>
          <p className="text-[10px] opacity-50">
            Links and references to revisit.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] opacity-70 hover:opacity-100 border border-white/30 px-2 py-1 rounded-sm"
        >
          + Clip
        </button>
      </div>
      {visible.length === 0 ? (
        <p className="text-[11px] opacity-40 mt-1">
          No clips saved yet. Pin key URLs, docs, and references here.
        </p>
      ) : (
        <div className="max-h-56 overflow-y-auto pr-1">
          {visible.map((clip) => (
            <ClipRow
              key={clip.id}
              clip={clip}
              onChange={(next) => handleChange(clip.id, next)}
              onTogglePinned={() => handleTogglePinned(clip.id)}
              onRemove={() => handleRemove(clip.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AtomSection({ atoms, onRemoveAtom }) {
  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
          Atoms
        </p>
        {atoms.length > 0 && (
          <p className="text-[10px] opacity-60">Recent fragments</p>
        )}
      </div>
      <AtomList atoms={atoms} onRemove={onRemoveAtom} />
    </section>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function ScratchpadPanel() {
  const [state, setState] = useState(() => ({
    captureText: "",
    atoms: [],
    threads: [],
    clips: [],
    threadTagFilter: "",
  }));

  // hydrate
  useEffect(() => {
    const initial = loadInitialState();
    if (initial) {
      setState((prev) => ({
        ...prev,
        ...initial,
        atoms: Array.isArray(initial.atoms) ? initial.atoms : [],
        threads: Array.isArray(initial.threads) ? initial.threads : [],
        clips: Array.isArray(initial.clips) ? initial.clips : [],
      }));
    }
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleCommitAtom = () => {
    const text = state.captureText.trim();
    if (!text) return;

    const newAtom = createEmptyAtom();
    newAtom.text = text;
    newAtom.context = "";

    setState((s) => ({
      ...s,
      captureText: "",
      atoms: [newAtom, ...s.atoms],
    }));
  };

  const handleRemoveAtom = (id) => {
    setState((s) => ({
      ...s,
      atoms: s.atoms.filter((a) => a.id !== id),
    }));
  };

  const atomCount = state.atoms.length;
  const threadCount = state.threads.length;
  const clipCount = state.clips.length;

  return (
    <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
      <ScratchpadHeader
        atomCount={atomCount}
        threadCount={threadCount}
        clipCount={clipCount}
      />

      <CaptureBar
        value={state.captureText}
        onChange={(captureText) => setState((s) => ({ ...s, captureText }))}
        onCommit={handleCommitAtom}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <AtomSection atoms={state.atoms} onRemoveAtom={handleRemoveAtom} />
          <ClipsSection
            clips={state.clips}
            onChangeClips={(clips) => setState((s) => ({ ...s, clips }))}
          />
        </div>
        <div>
          <ThreadSection
            threads={state.threads}
            filterTag={state.threadTagFilter}
            onChangeThreads={(threads) => setState((s) => ({ ...s, threads }))}
            onChangeFilter={(threadTagFilter) =>
              setState((s) => ({ ...s, threadTagFilter }))
            }
          />
        </div>
      </div>
    </section>
  );
}
