"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "troupe_os_creative_sessions_v1";

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
    console.error("Failed to persist Creative Sessions state", err);
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createEmptyIdea(extra = {}) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: "",
    type: "music", // music | art | writing | other
    notes: "",
    priority: "medium", // low | medium | high
    status: "idea", // idea | scheduled | in-progress | complete
    energy: "any", // low | medium | high | any
    pinned: false,
    createdAt: now,
    updatedAt: now,
    ...extra,
  };
}

function createEmptySessionFromIdea(idea) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  return {
    id: createId(),
    ideaId: idea.id,
    titleSnapshot: idea.title || "",
    type: idea.type || "other",
    date: today,
    durationMinutes: "",
    energy: idea.energy || "any",
    notes: "",
    createdAt: now,
  };
}

function createEmptyAdHocSession() {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  return {
    id: createId(),
    ideaId: null,
    titleSnapshot: "",
    type: "other",
    date: today,
    durationMinutes: "",
    energy: "any",
    notes: "",
    createdAt: now,
  };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function CreativeHeader({ ideaCount, sessionCount }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          Creative Sessions
        </p>
        <h2 className="text-sm font-semibold">Output Engine</h2>
      </div>
      <div className="text-right text-[10px] opacity-75">
        <p>Ideas: {ideaCount}</p>
        <p className="opacity-60">Sessions logged: {sessionCount}</p>
      </div>
    </header>
  );
}

function CaptureBar({ title, type, notes, onChangeField, onCommit }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (title.trim()) onCommit();
    }
  };

  return (
    <section className="mb-3">
      <label className="block text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
        Capture Idea
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeField("captureTitle", e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-black/60 border border-white/25 px-2 py-2 text-[12px] rounded-sm outline-none focus:border-white/70 mb-1"
            placeholder=""
          />
          <textarea
            value={notes}
            onChange={(e) => onChangeField("captureNotes", e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-black/60 border border-white/25 px-2 py-2 text-[11px] rounded-sm outline-none focus:border-white/70 min-h-[40px] resize-vertical"
            placeholder=""
          />
        </div>
        <div className="w-full sm:w-40 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.18em] opacity-60">
              Type
            </span>
            <select
              value={type}
              onChange={(e) => onChangeField("captureType", e.target.value)}
              className="flex-1 bg-black/60 border border-white/25 px-2 py-1 text-[11px] rounded-sm outline-none focus:border-white/70"
            >
              <option value="music">Music</option>
              <option value="art">Art</option>
              <option value="writing">Writing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onCommit}
            disabled={!title.trim()}
            className="border border-white/70 px-3 py-2 rounded-sm text-[10px] uppercase tracking-[0.18em] disabled:border-white/25 disabled:text-white/35"
          >
            Save Idea
          </button>
          <p className="text-[9px] opacity-50">
            ⌘+Enter / Ctrl+Enter to save.
          </p>
        </div>
      </div>
    </section>
  );
}

function FiltersBar({ statusFilter, energyFilter, onChangeStatus, onChangeEnergy }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-3 text-[10px]">
      <div className="flex items-center gap-2">
        <span className="uppercase tracking-[0.18em] opacity-60">Status</span>
        <select
          value={statusFilter}
          onChange={(e) => onChangeStatus(e.target.value)}
          className="bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/70"
        >
          <option value="open">Open</option>
          <option value="idea">Idea only</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In progress</option>
          <option value="complete">Complete</option>
          <option value="all">All</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="uppercase tracking-[0.18em] opacity-60">Energy</span>
        <select
          value={energyFilter}
          onChange={(e) => onChangeEnergy(e.target.value)}
          className="bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/70"
        >
          <option value="any">Any</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  );
}

function IdeaRow({ idea, onChange, onTogglePinned, onStatusChange, onCreateSession, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...idea,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      className={`border rounded-sm px-2 py-2 mb-1 text-[11px] ${
        idea.pinned
          ? "border-indigo-300 bg-indigo-400/5"
          : "border-white/18 bg-black/35"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onTogglePinned}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            idea.pinned
              ? "border-indigo-300 text-indigo-300"
              : "border-white/25 text-white/40 hover:border-indigo-300 hover:text-indigo-300"
          }`}
        >
          ●
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <input
              type="text"
              value={idea.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="flex-1 bg-transparent border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70"
              placeholder=""
            />
            <select
              value={idea.type}
              onChange={(e) => handleFieldChange("type", e.target.value)}
              className="bg-black/60 border border-white/20 px-1.5 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            >
              <option value="music">Music</option>
              <option value="art">Art</option>
              <option value="writing">Writing</option>
              <option value="other">Other</option>
            </select>
            <select
              value={idea.priority}
              onChange={(e) => handleFieldChange("priority", e.target.value)}
              className="bg-black/60 border border-white/20 px-1.5 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            >
              <option value="low">Low</option>
              <option value="medium">Med</option>
              <option value="high">High</option>
            </select>
            <select
              value={idea.energy}
              onChange={(e) => handleFieldChange("energy", e.target.value)}
              className="bg-black/60 border border-white/20 px-1.5 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            >
              <option value="any">Any</option>
              <option value="low">Low</option>
              <option value="medium">Med</option>
              <option value="high">High</option>
            </select>
            <select
              value={idea.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-black/60 border border-white/20 px-1.5 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            >
              <option value="idea">Idea</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          <textarea
            value={idea.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="w-full bg-black/60 border border-white/20 px-2 py-1 rounded-sm outline-none focus:border-white/70 text-[10px] min-h-[36px] resize-vertical"
            placeholder=""
          />
          <div className="mt-1 flex items-center justify-between text-[9px] opacity-65">
            <span>
              Priority: {idea.priority} · Energy: {idea.energy}
            </span>
            <span>
              Created {idea.createdAt.slice(0, 10)} · Updated{" "}
              {idea.updatedAt.slice(0, 16).replace("T", " ")}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-1">
          <button
            type="button"
            onClick={onCreateSession}
            className="px-2 py-1 rounded-sm border border-emerald-300 text-[10px] text-emerald-200 hover:border-emerald-200"
          >
            Log Session
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

function IdeaLane({
  label,
  type,
  ideas,
  statusFilter,
  energyFilter,
  onChangeIdea,
  onTogglePinned,
  onStatusChange,
  onCreateSession,
  onRemoveIdea,
}) {
  const filtered = useMemo(() => {
    return ideas
      .filter((idea) => idea.type === type)
      .filter((idea) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "open") {
          return idea.status === "idea" || idea.status === "scheduled" || idea.status === "in-progress";
        }
        return idea.status === statusFilter;
      })
      .filter((idea) => {
        if (energyFilter === "any") return true;
        return idea.energy === energyFilter || idea.energy === "any";
      })
      .slice()
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (a.priority === b.priority) {
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      });
  }, [ideas, type, statusFilter, energyFilter]);

  return (
    <section className="border border-white/18 rounded-md px-2 py-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
          {label}
        </p>
        <span className="text-[10px] opacity-60">{filtered.length}</span>
      </div>
      {filtered.length === 0 ? (
        <p className="text-[11px] opacity-40 mt-1">
          No ideas in this lane for the current filters.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {filtered.map((idea) => (
            <IdeaRow
              key={idea.id}
              idea={idea}
              onChange={(next) => onChangeIdea(idea.id, next)}
              onTogglePinned={() => onTogglePinned(idea.id)}
              onStatusChange={(status) => onStatusChange(idea.id, status)}
              onCreateSession={() => onCreateSession(idea)}
              onRemove={() => onRemoveIdea(idea.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SessionRow({ session, ideaTitle, onChange, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...session,
      [field]: value,
    });
  };

  return (
    <div className="border border-white/20 bg-black/40 rounded-sm px-2 py-2 mb-1 text-[11px]">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <div className="flex items-center gap-1">
          <span className="text-[9px] uppercase opacity-50">Date</span>
          <input
            type="date"
            value={session.date}
            onChange={(e) => handleFieldChange("date", e.target.value)}
            className="bg-black/60 border border-white/25 px-1 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
          />
        </div>
        <select
          value={session.type}
          onChange={(e) => handleFieldChange("type", e.target.value)}
          className="bg-black/60 border border-white/25 px-1.5 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
        >
          <option value="music">Music</option>
          <option value="art">Art</option>
          <option value="writing">Writing</option>
          <option value="other">Other</option>
        </select>
        <div className="flex items-center gap-1">
          <span className="text-[9px] uppercase opacity-50">Minutes</span>
          <input
            type="number"
            value={session.durationMinutes}
            onChange={(e) => handleFieldChange("durationMinutes", e.target.value)}
            className="w-16 bg-black/60 border border-white/25 px-1 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
            placeholder=""
          />
        </div>
        <select
          value={session.energy}
          onChange={(e) => handleFieldChange("energy", e.target.value)}
          className="bg-black/60 border border-white/25 px-1.5 py-1 rounded-sm outline-none focus:border-white/70 text-[10px]"
        >
          <option value="any">Any</option>
          <option value="low">Low</option>
          <option value="medium">Med</option>
          <option value="high">High</option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto text-[9px] opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      </div>
      <input
        type="text"
        value={session.titleSnapshot}
        onChange={(e) => handleFieldChange("titleSnapshot", e.target.value)}
        className="w-full bg-transparent border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 mb-1"
        placeholder={ideaTitle || ""}
      />
      <textarea
        value={session.notes}
        onChange={(e) => handleFieldChange("notes", e.target.value)}
        className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/70 text-[10px] min-h-[40px] resize-vertical"
        placeholder=""
      />
      {ideaTitle && (
        <p className="mt-1 text-[9px] opacity-55">
          Linked idea: {ideaTitle}
        </p>
      )}
    </div>
  );
}

function SessionsSection({ ideas, sessions, onChangeSessions }) {
  const handleAddAdHoc = () => {
    onChangeSessions([createEmptyAdHocSession(), ...sessions]);
  };

  const handleChange = (id, next) => {
    const nextList = sessions.map((s) => (s.id === id ? next : s));
    onChangeSessions(nextList);
  };

  const handleRemove = (id) => {
    const nextList = sessions.filter((s) => s.id !== id);
    onChangeSessions(nextList);
  };

  const sorted = useMemo(
    () =>
      sessions
        .slice()
        .sort((a, b) => {
          if (a.date === b.date) {
            return (b.createdAt || "").localeCompare(a.createdAt || "");
          }
          return a.date < b.date ? 1 : -1;
        }),
    [sessions]
  );

  const totalMinutes = sorted.reduce((sum, s) => {
    const n = parseFloat(String(s.durationMinutes || "").replace(/,/g, ""));
    if (!Number.isFinite(n)) return sum;
    return sum + n;
  }, 0);

  return (
    <section className="border border-white/20 rounded-md px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            Sessions Log
          </p>
          <p className="text-[10px] opacity-55">
            How often you are actually shipping.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddAdHoc}
          className="text-[10px] border border-white/70 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
        >
          + Session
        </button>
      </div>
      <p className="text-[10px] opacity-65 mb-2">
        Total logged minutes: {totalMinutes}
      </p>
      {sorted.length === 0 ? (
        <p className="text-[11px] opacity-40">
          No sessions logged yet. Start tracking even small 10–15 minute bursts.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {sorted.map((session) => {
            const idea = session.ideaId
              ? ideas.find((i) => i.id === session.ideaId)
              : null;
            return (
              <SessionRow
                key={session.id}
                session={session}
                ideaTitle={idea ? idea.title : ""}
                onChange={(next) => handleChange(session.id, next)}
                onRemove={() => handleRemove(session.id)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function SummaryStrip({ ideas, sessions }) {
  const totalIdeas = ideas.length;
  const completeIdeas = ideas.filter((i) => i.status === "complete").length;
  const scheduledIdeas = ideas.filter((i) => i.status === "scheduled").length;
  const inProgressIdeas = ideas.filter((i) => i.status === "in-progress").length;

  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce((sum, s) => {
    const n = parseFloat(String(s.durationMinutes || "").replace(/,/g, ""));
    if (!Number.isFinite(n)) return sum;
    return sum + n;
  }, 0);

  return (
    <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Ideas</p>
        <p className="mt-1 opacity-80">
          Total: {totalIdeas} · Complete: {completeIdeas}
        </p>
        <p className="opacity-70">
          In flight: {scheduledIdeas + inProgressIdeas}
        </p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Today</p>
        <p className="mt-1 opacity-80">
          Sessions: {todaySessions.length} · Minutes: {todayMinutes}
        </p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Balance</p>
        <p className="mt-1 opacity-80">
          Music: {ideas.filter((i) => i.type === "music").length} · Art:{" "}
          {ideas.filter((i) => i.type === "art").length}
        </p>
        <p className="opacity-80">
          Writing: {ideas.filter((i) => i.type === "writing").length} · Other:{" "}
          {ideas.filter((i) => i.type === "other").length}
        </p>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function CreativeSessionsPanel() {
  const [state, setState] = useState(() => ({
    ideas: [],
    sessions: [],
    captureTitle: "",
    captureType: "music",
    captureNotes: "",
    statusFilter: "open",
    energyFilter: "any",
  }));

  // hydrate
  useEffect(() => {
    const initial = loadInitialState();
    if (initial) {
      setState((prev) => ({
        ...prev,
        ...initial,
        ideas: Array.isArray(initial.ideas) ? initial.ideas : [],
        sessions: Array.isArray(initial.sessions) ? initial.sessions : [],
      }));
    }
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleChangeField = (field, value) => {
    setState((s) => ({ ...s, [field]: value }));
  };

  const handleCommitIdea = () => {
    const title = state.captureTitle.trim();
    if (!title) return;
    const idea = createEmptyIdea({
      title,
      type: state.captureType,
      notes: state.captureNotes.trim(),
    });
    setState((s) => ({
      ...s,
      ideas: [idea, ...s.ideas],
      captureTitle: "",
      captureNotes: "",
    }));
  };

  const handleChangeIdea = (id, next) => {
    setState((s) => ({
      ...s,
      ideas: s.ideas.map((i) => (i.id === id ? next : i)),
    }));
  };

  const handleTogglePinnedIdea = (id) => {
    setState((s) => ({
      ...s,
      ideas: s.ideas.map((i) =>
        i.id === id
          ? { ...i, pinned: !i.pinned, updatedAt: new Date().toISOString() }
          : i
      ),
    }));
  };

  const handleStatusChange = (id, status) => {
    setState((s) => ({
      ...s,
      ideas: s.ideas.map((i) =>
        i.id === id
          ? { ...i, status, updatedAt: new Date().toISOString() }
          : i
      ),
    }));
  };

  const handleCreateSessionFromIdea = (idea) => {
    const newSession = createEmptySessionFromIdea(idea);
    setState((s) => ({
      ...s,
      sessions: [newSession, ...s.sessions],
    }));
  };

  const handleRemoveIdea = (id) => {
    setState((s) => ({
      ...s,
      ideas: s.ideas.filter((i) => i.id !== id),
      sessions: s.sessions.map((sess) =>
        sess.ideaId === id ? { ...sess, ideaId: null } : sess
      ),
    }));
  };

  const handleChangeSessions = (sessions) => {
    setState((s) => ({ ...s, sessions }));
  };

  return (
    <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
      <CreativeHeader
        ideaCount={state.ideas.length}
        sessionCount={state.sessions.length}
      />

      <CaptureBar
        title={state.captureTitle}
        type={state.captureType}
        notes={state.captureNotes}
        onChangeField={handleChangeField}
        onCommit={handleCommitIdea}
      />

      <SummaryStrip ideas={state.ideas} sessions={state.sessions} />

      <FiltersBar
        statusFilter={state.statusFilter}
        energyFilter={state.energyFilter}
        onChangeStatus={(statusFilter) =>
          setState((s) => ({ ...s, statusFilter }))
        }
        onChangeEnergy={(energyFilter) =>
          setState((s) => ({ ...s, energyFilter }))
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <IdeaLane
            label="Music"
            type="music"
            ideas={state.ideas}
            statusFilter={state.statusFilter}
            energyFilter={state.energyFilter}
            onChangeIdea={handleChangeIdea}
            onTogglePinned={handleTogglePinnedIdea}
            onStatusChange={handleStatusChange}
            onCreateSession={handleCreateSessionFromIdea}
            onRemoveIdea={handleRemoveIdea}
          />
          <IdeaLane
            label="Art"
            type="art"
            ideas={state.ideas}
            statusFilter={state.statusFilter}
            energyFilter={state.energyFilter}
            onChangeIdea={handleChangeIdea}
            onTogglePinned={handleTogglePinnedIdea}
            onStatusChange={handleStatusChange}
            onCreateSession={handleCreateSessionFromIdea}
            onRemoveIdea={handleRemoveIdea}
          />
          <IdeaLane
            label="Writing"
            type="writing"
            ideas={state.ideas}
            statusFilter={state.statusFilter}
            energyFilter={state.energyFilter}
            onChangeIdea={handleChangeIdea}
            onTogglePinned={handleTogglePinnedIdea}
            onStatusChange={handleStatusChange}
            onCreateSession={handleCreateSessionFromIdea}
            onRemoveIdea={handleRemoveIdea}
          />
          <IdeaLane
            label="Other"
            type="other"
            ideas={state.ideas}
            statusFilter={state.statusFilter}
            energyFilter={state.energyFilter}
            onChangeIdea={handleChangeIdea}
            onTogglePinned={handleTogglePinnedIdea}
            onStatusChange={handleStatusChange}
            onCreateSession={handleCreateSessionFromIdea}
            onRemoveIdea={handleRemoveIdea}
          />
        </div>

        <SessionsSection
          ideas={state.ideas}
          sessions={state.sessions}
          onChangeSessions={handleChangeSessions}
        />
      </div>
    </section>
  );
}
