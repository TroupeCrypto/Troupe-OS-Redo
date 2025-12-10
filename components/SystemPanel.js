"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "troupe_os_system_panel_v1";

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
    console.error("Failed to persist System Panel state", err);
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function defaultState() {
  return {
    environment: {
      label: "Local Console",
      mode: "solo", // solo | live | client
      threatLevel: "normal", // normal | elevated | lockdown
      geoTag: "LOCAL",
      allowedGeo: "LOCAL",
      accessWindowStart: "05:00",
      accessWindowEnd: "23:00",
      lastUpdated: null,
    },
    featureFlags: [
      {
        id: createId(),
        key: "show_money_panels",
        label: "Money panels visible",
        enabled: true,
        scope: "personal",
        notes: "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: createId(),
        key: "show_health_panels",
        label: "Health & Energy visible",
        enabled: true,
        scope: "personal",
        notes: "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: createId(),
        key: "debug_mode_ui",
        label: "Debug visuals",
        enabled: false,
        scope: "dev",
        notes: "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    automations: [],
    notes: "",
    lastExport: null,
  };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function PanelHeader({ environment }) {
  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
          System
        </p>
        <h2 className="text-sm font-semibold">Troupe OS Core Settings</h2>
      </div>
      <div className="text-right text-[10px] opacity-80">
        <p>
          Mode: <span className="font-medium">{environment.mode}</span> · Threat:{" "}
          <span className="font-medium">{environment.threatLevel}</span>
        </p>
        <p className="opacity-70">
          Geo: {environment.geoTag} → {environment.allowedGeo}
        </p>
      </div>
    </header>
  );
}

function EnvironmentSection({ env, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...env,
      [field]: value,
      lastUpdated: nowIso(),
    });
  };

  return (
    <section className="mb-3 border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <p className="text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
        Environment &amp; Access
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Label
          </label>
          <input
            type="text"
            value={env.label}
            onChange={(e) => handleChange("label", e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Mode
          </label>
          <select
            value={env.mode}
            onChange={(e) => handleChange("mode", e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          >
            <option value="solo">Solo</option>
            <option value="live">Live</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Threat level
          </label>
          <select
            value={env.threatLevel}
            onChange={(e) => handleChange("threatLevel", e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          >
            <option value="normal">Normal</option>
            <option value="elevated">Elevated</option>
            <option value="lockdown">Lockdown</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Geo tag (this device)
          </label>
          <input
            type="text"
            value={env.geoTag}
            onChange={(e) => handleChange("geoTag", e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Allowed geo
          </label>
          <input
            type="text"
            value={env.allowedGeo}
            onChange={(e) => handleChange("allowedGeo", e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Access window
          </label>
          <div className="flex items-center gap-1">
            <input
              type="time"
              value={env.accessWindowStart}
              onChange={(e) =>
                handleChange("accessWindowStart", e.target.value)
              }
              className="flex-1 bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
            />
            <span className="text-[10px] opacity-60">→</span>
            <input
              type="time"
              value={env.accessWindowEnd}
              onChange={(e) =>
                handleChange("accessWindowEnd", e.target.value)
              }
              className="flex-1 bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
            />
          </div>
        </div>
      </div>
      {env.lastUpdated && (
        <p className="text-[9px] opacity-60">
          Last updated:{" "}
          {env.lastUpdated.slice(0, 16).replace("T", " ")}
        </p>
      )}
    </section>
  );
}

function FeatureFlagRow({ flag, onChange, onToggle, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...flag,
      [field]: value,
      updatedAt: nowIso(),
    });
  };

  return (
    <div className="border border-white/20 bg-black/40 rounded-sm px-2 py-2 mb-1 text-[11px]">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onToggle}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            flag.enabled
              ? "border-emerald-300 text-emerald-300"
              : "border-white/25 text-white/40 hover:border-emerald-300 hover:text-emerald-300"
          }`}
        >
          {flag.enabled ? "●" : "○"}
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <input
              type="text"
              value={flag.key}
              onChange={(e) => handleFieldChange("key", e.target.value)}
              className="flex-1 bg-transparent border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder=""
            />
            <select
              value={flag.scope}
              onChange={(e) => handleFieldChange("scope", e.target.value)}
              className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
            >
              <option value="personal">Personal</option>
              <option value="client">Client</option>
              <option value="dev">Dev</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>
          <input
            type="text"
            value={flag.label}
            onChange={(e) => handleFieldChange("label", e.target.value)}
            className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80 mb-1"
            placeholder=""
          />
          <textarea
            value={flag.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80 text-[10px] min-h-[30px] resize-vertical"
            placeholder=""
          />
          <p className="mt-1 text-[9px] opacity-65">
            {flag.enabled ? "Enabled" : "Disabled"} ·{" "}
            {flag.updatedAt
              ? flag.updatedAt.slice(0, 16).replace("T", " ")
              : ""}
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

function FeatureFlagsSection({ flags, onChangeFlags }) {
  const handleAdd = () => {
    const now = nowIso();
    const next = {
      id: createId(),
      key: "",
      label: "",
      enabled: false,
      scope: "personal",
      notes: "",
      createdAt: now,
      updatedAt: now,
    };
    onChangeFlags([next, ...flags]);
  };

  const handleChange = (id, next) => {
    onChangeFlags(flags.map((f) => (f.id === id ? next : f)));
  };

  const handleToggle = (id) => {
    onChangeFlags(
      flags.map((f) =>
        f.id === id
          ? { ...f, enabled: !f.enabled, updatedAt: nowIso() }
          : f
      )
    );
  };

  const handleRemove = (id) => {
    onChangeFlags(flags.filter((f) => f.id !== id));
  };

  const sorted = useMemo(
    () =>
      flags
        .slice()
        .sort((a, b) => {
          if (a.enabled && !b.enabled) return -1;
          if (!a.enabled && b.enabled) return 1;
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }),
    [flags]
  );

  const enabledCount = sorted.filter((f) => f.enabled).length;

  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            Feature Flags
          </p>
          <p className="text-[10px] opacity-60">
            Enabled: {enabledCount} / {sorted.length}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] border border-white/70 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
        >
          + Flag
        </button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-[11px] opacity-40">
          Define toggles for views, debug layers, and experimental flows.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {sorted.map((flag) => (
            <FeatureFlagRow
              key={flag.id}
              flag={flag}
              onChange={(next) => handleChange(flag.id, next)}
              onToggle={() => handleToggle(flag.id)}
              onRemove={() => handleRemove(flag.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AutomationRow({ rule, onChange, onToggleEnabled, onRemove }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...rule,
      [field]: value,
      updatedAt: nowIso(),
    });
  };

  return (
    <div className="border border-white/20 bg-black/40 rounded-sm px-2 py-2 mb-1 text-[11px]">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onToggleEnabled}
          className={`mt-[2px] w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
            rule.enabled
              ? "border-emerald-300 text-emerald-300"
              : "border-white/25 text-white/40 hover:border-emerald-300 hover:text-emerald-300"
          }`}
        >
          {rule.enabled ? "●" : "○"}
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <input
              type="text"
              value={rule.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="flex-1 bg-transparent border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder=""
            />
            <select
              value={rule.scope}
              onChange={(e) => handleFieldChange("scope", e.target.value)}
              className="bg-black/60 border border-white/22 px-1.5 py-1 rounded-sm outline-none focus:border-white/80 text-[10px]"
            >
              <option value="daily">Daily</option>
              <option value="money">Money</option>
              <option value="health">Health</option>
              <option value="creative">Creative</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              value={rule.when}
              onChange={(e) => handleFieldChange("when", e.target.value)}
              className="w-40 bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80"
              placeholder="Condition"
            />
          </div>
          <textarea
            value={rule.action}
            onChange={(e) => handleFieldChange("action", e.target.value)}
            className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80 text-[10px] min-h-[32px] resize-vertical mb-1"
            placeholder="Action / reminder / script description"
          />
          <textarea
            value={rule.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="w-full bg-black/60 border border-white/22 px-2 py-1 rounded-sm outline-none focus:border-white/80 text-[10px] min-h-[26px] resize-vertical"
            placeholder=""
          />
          <p className="mt-1 text-[9px] opacity-65">
            {rule.enabled ? "Active" : "Disabled"} ·{" "}
            {rule.updatedAt
              ? rule.updatedAt.slice(0, 16).replace("T", " ")
              : ""}
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

function AutomationsSection({ automations, onChangeAutomations }) {
  const handleAdd = () => {
    const now = nowIso();
    const next = {
      id: createId(),
      name: "",
      scope: "daily",
      when: "",
      action: "",
      notes: "",
      enabled: false,
      createdAt: now,
      updatedAt: now,
    };
    onChangeAutomations([next, ...automations]);
  };

  const handleChange = (id, next) => {
    onChangeAutomations(automations.map((r) => (r.id === id ? next : r)));
  };

  const handleToggleEnabled = (id) => {
    onChangeAutomations(
      automations.map((r) =>
        r.id === id
          ? { ...r, enabled: !r.enabled, updatedAt: nowIso() }
          : r
      )
    );
  };

  const handleRemove = (id) => {
    onChangeAutomations(automations.filter((r) => r.id !== id));
  };

  const sorted = useMemo(
    () =>
      automations
        .slice()
        .sort((a, b) => {
          if (a.enabled && !b.enabled) return -1;
          if (!a.enabled && b.enabled) return 1;
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }),
    [automations]
  );

  const enabledCount = sorted.filter((r) => r.enabled).length;

  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70">
            Automations (concept)
          </p>
          <p className="text-[10px] opacity-60">
            Enabled: {enabledCount} / {sorted.length}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] border border-white/70 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
        >
          + Rule
        </button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-[11px] opacity-40">
          Sketch rules like &quot;If cash drops below X, surface Money view&quot; or
          &quot;Ping Health after 2 days of no movement.&quot;
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {sorted.map((rule) => (
            <AutomationRow
              key={rule.id}
              rule={rule}
              onChange={(next) => handleChange(rule.id, next)}
              onToggleEnabled={() => handleToggleEnabled(rule.id)}
              onRemove={() => handleRemove(rule.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NotesAndStorageSection({
  notes,
  lastExport,
  onChangeNotes,
  onSnapshotExport,
}) {
  const [metrics, setMetrics] = useState(null);

  const computeMetrics = () => {
    if (typeof window === "undefined") return;
    try {
      const ls = window.localStorage;
      const keys = [];
      let totalBytes = 0;

      for (let i = 0; i < ls.length; i += 1) {
        const key = ls.key(i);
        if (!key) continue;
        if (!key.startsWith("troupe_os_")) continue;
        const val = ls.getItem(key) || "";
        const bytes = key.length + val.length;
        totalBytes += bytes;
        keys.push({ key, bytes, approxKB: (bytes / 1024).toFixed(1) });
      }

      setMetrics({
        totalBytes,
        approxKB: (totalBytes / 1024).toFixed(1),
        keys,
      });
    } catch (err) {
      console.error("Failed to compute storage metrics", err);
    }
  };

  const clearAll = () => {
    if (typeof window === "undefined") return;
    try {
      const ls = window.localStorage;
      const toRemove = [];
      for (let i = 0; i < ls.length; i += 1) {
        const key = ls.key(i);
        if (key && key.startsWith("troupe_os_")) {
          toRemove.push(key);
        }
      }
      toRemove.forEach((key) => ls.removeItem(key));
      computeMetrics();
    } catch (err) {
      console.error("Failed to clear troupe_os_* keys", err);
    }
  };

  useEffect(() => {
    computeMetrics();
  }, []);

  return (
    <section className="border border-white/22 rounded-md px-3 py-2 text-[11px]">
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1.2fr] gap-3">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
            System Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            className="w-full bg-black/60 border border-white/25 px-2 py-2 rounded-sm outline-none focus:border-white/80 text-[11px] min-h-[80px] resize-vertical mb-1"
            placeholder=""
          />
          <div className="flex items-center justify-between text-[10px] opacity-70">
            <button
              type="button"
              onClick={onSnapshotExport}
              className="border border-white/70 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
            >
              Mark Snapshot
            </button>
            <span>
              Last snapshot:{" "}
              {lastExport
                ? lastExport.slice(0, 16).replace("T", " ")
                : "—"}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase opacity-70 mb-1">
            Local Storage (this browser)
          </p>
          {metrics ? (
            <>
              <p className="text-[10px] opacity-80 mb-1">
                Troupe OS keys: {metrics.keys.length} · Approx:{" "}
                {metrics.approxKB} KB
              </p>
              <div className="max-h-28 overflow-y-auto border border-white/18 rounded-sm px-2 py-1 text-[10px] mb-1">
                {metrics.keys.length === 0 ? (
                  <p className="opacity-50">No troupe_os_* keys found.</p>
                ) : (
                  metrics.keys
                    .slice()
                    .sort((a, b) => b.bytes - a.bytes)
                    .map((k) => (
                      <p key={k.key} className="opacity-75">
                        {k.key}: {k.approxKB} KB
                      </p>
                    ))
                )}
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={computeMetrics}
                  className="border border-white/60 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="border border-red-400/80 text-red-200 px-2 py-1 rounded-sm uppercase tracking-[0.18em]"
                >
                  Clear troupe_os_* only
                </button>
              </div>
            </>
          ) : (
            <p className="text-[10px] opacity-60">Measuring local storage…</p>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryStrip({ environment, flags, automations }) {
  const enabledFlags = flags.filter((f) => f.enabled).length;
  const activeAutomations = automations.filter((r) => r.enabled).length;

  return (
    <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Environment</p>
        <p className="mt-1 opacity-80">
          {environment.label} · {environment.mode}
        </p>
        <p className="opacity-70">
          Threat: {environment.threatLevel} · Geo: {environment.geoTag}
        </p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Flags</p>
        <p className="mt-1 opacity-80">
          Enabled: {enabledFlags} / {flags.length}
        </p>
        <p className="opacity-70">
          Dev/experimental:{" "}
          {flags.filter((f) => f.scope === "dev" || f.scope === "experimental")
            .length}
        </p>
      </div>
      <div className="border border-white/20 rounded-sm px-2 py-1">
        <p className="uppercase tracking-[0.18em] opacity-60">Automations</p>
        <p className="mt-1 opacity-80">
          Active: {activeAutomations} / {automations.length}
        </p>
        <p className="opacity-70">
          Scope: daily / money / health / creative / security
        </p>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function SystemPanel() {
  const [state, setState] = useState(() => defaultState());

  // hydrate
  useEffect(() => {
    const initial = loadInitialState();
    if (initial) {
      setState((prev) => ({
        ...prev,
        ...initial,
        environment: {
          ...defaultState().environment,
          ...(initial.environment || {}),
        },
        featureFlags: Array.isArray(initial.featureFlags)
          ? initial.featureFlags
          : defaultState().featureFlags,
        automations: Array.isArray(initial.automations)
          ? initial.automations
          : [],
      }));
    }
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleChangeEnvironment = (environment) => {
    setState((s) => ({ ...s, environment }));
  };

  const handleChangeFlags = (featureFlags) => {
    setState((s) => ({ ...s, featureFlags }));
  };

  const handleChangeAutomations = (automations) => {
    setState((s) => ({ ...s, automations }));
  };

  const handleChangeNotes = (notes) => {
    setState((s) => ({ ...s, notes }));
  };

  const handleSnapshotExport = () => {
    setState((s) => ({ ...s, lastExport: nowIso() }));
  };

  return (
    <section className="border border-white/20 bg-black/70 px-4 py-3 rounded-md text-white">
      <PanelHeader environment={state.environment} />

      <SummaryStrip
        environment={state.environment}
        flags={state.featureFlags}
        automations={state.automations}
      />

      <EnvironmentSection
        env={state.environment}
        onChange={handleChangeEnvironment}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <FeatureFlagsSection
          flags={state.featureFlags}
          onChangeFlags={handleChangeFlags}
        />
        <AutomationsSection
          automations={state.automations}
          onChangeAutomations={handleChangeAutomations}
        />
      </div>

      <NotesAndStorageSection
        notes={state.notes}
        lastExport={state.lastExport}
        onChangeNotes={handleChangeNotes}
        onSnapshotExport={handleSnapshotExport}
      />
    </section>
  );
}
