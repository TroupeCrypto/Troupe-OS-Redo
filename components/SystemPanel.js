"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "../lib/usePersistentState";
import { collectOsState, restoreOsState } from "../lib/osState";
import { encryptJson } from "../lib/secureStorage";
import { syncStateToCloud } from "../lib/sync";

const DAY_KEYS = [
  "today_focus_by_day",
  "today_obligations_by_day",
  "creative_sessions_by_day",
  "money_ledger_by_day",
  "health_energy_by_day",
];

const SINGLE_KEYS = ["money_snapshot", "scratchpad"];
const SUBTABS = ["Security", "Backups", "APIs", "Processes", "Permissions"];

export default function SystemPanel() {
  const [focusByDay] = usePersistentState("today_focus_by_day", {});
  const [obligationsByDay] = usePersistentState(
    "today_obligations_by_day",
    {}
  );
  const [sessionsByDay] = usePersistentState(
    "creative_sessions_by_day",
    {}
  );
  const [ledgerByDay] = usePersistentState("money_ledger_by_day", {});
  const [healthByDay] = usePersistentState("health_energy_by_day", {});
  const [snapshot] = usePersistentState("money_snapshot", {
    cashOnHand: "",
    checking: "",
    savings: "",
    notes: "",
  });
  const [scratchpad] = usePersistentState("scratchpad", "");
  const [securityEvents, setSecurityEvents] = usePersistentState(
    "system_security_events",
    []
  );
  const [apiVault, setApiVault] = usePersistentState("api_vault", []);
  const [failures, setFailures] = usePersistentState("system_failures", []);
  const [permissions, setPermissions] = usePersistentState(
    "system_permissions",
    {
      admin: ["backups", "keys", "logs"],
      finance: ["ledger"],
      creative: ["sessions"],
    }
  );

  const [activeTab, setActiveTab] = useState("Security");
  const [apiLabel, setApiLabel] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [apiPass, setApiPass] = useState("");
  const [failureText, setFailureText] = useState("");
  const [nextBackup, setNextBackup] = useState(
    () => window?.localStorage?.getItem("system_next_backup") || ""
  );

  const dayCounts = useMemo(
    () => ({
      focus: Object.keys(focusByDay || {}).length,
      obligations: Object.keys(obligationsByDay || {}).length,
      sessions: Object.keys(sessionsByDay || {}).length,
      ledger: Object.keys(ledgerByDay || {}).length,
      health: Object.keys(healthByDay || {}).length,
    }),
    [focusByDay, obligationsByDay, sessionsByDay, ledgerByDay, healthByDay]
  );

  const handleResetAll = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm(
      "This will clear all local Troupe OS data on this device (focus, obligations, sessions, money, health, scratchpad). This cannot be undone. Continue?"
    );
    if (!confirmed) return;

    try {
      for (const key of DAY_KEYS.concat(SINGLE_KEYS)) {
        window.localStorage.removeItem(key);
      }
      window.localStorage.removeItem("troupe_os_encrypted_backup_v1");
      window.localStorage.removeItem("system_security_events");
      window.localStorage.removeItem("api_vault");
      window.localStorage.removeItem("system_failures");
      window.location.reload();
    } catch (err) {
      console.error("Failed to reset local data", err);
    }
  };

  const handleDownloadBackup = useCallback(() => {
    if (typeof window === "undefined") return;
    const state = collectOsState();
    if (!state) return;

    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `troupe-os-backup-${state.exportedAt}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleUploadBackup = (event) => {
    if (typeof window === "undefined") return;
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        const parsed = JSON.parse(text);
        const confirmed = window.confirm(
          "Restore this backup into local storage? This will overwrite current Troupe OS data on this device."
        );
        if (!confirmed) return;
        restoreOsState(parsed);
      window.location.reload();
    } catch (err) {
      console.error("Failed to parse backup file", err);
      window.alert("Invalid backup file.");
    }
  };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleEncryptedSnapshot = async () => {
    if (typeof window === "undefined") return;
    const passphrase = window.prompt(
      "Enter a passphrase to encrypt this snapshot (do NOT forget it)."
    );
    if (!passphrase) return;

    try {
      const state = collectOsState();
      if (!state) return;
      const bundle = await encryptJson(state, passphrase);
      window.localStorage.setItem(
        "troupe_os_encrypted_backup_v1",
        JSON.stringify({
          createdAt: new Date().toISOString(),
          bundle,
        })
      );
      window.alert("Encrypted local snapshot stored.");
    } catch (err) {
      console.error("Failed to create encrypted snapshot", err);
      window.alert("Could not create encrypted snapshot.");
    }
  };

  const handleApiVaultSave = async () => {
    if (!apiLabel.trim() || !apiSecret.trim() || !apiPass.trim()) {
      window.alert("Label, secret, and passphrase required.");
      return;
    }
    try {
      const bundle = await encryptJson(
        { label: apiLabel.trim(), secret: apiSecret.trim() },
        apiPass
      );
      setApiVault((curr) => [...(curr || []), bundle]);
      setApiLabel("");
      setApiSecret("");
      setApiPass("");
      window.alert("API key encrypted and stored locally.");
    } catch (err) {
      console.error("Failed to store api key", err);
    }
  };

  const handleLogFailure = () => {
    if (!failureText.trim()) return;
    const entry = {
      id: Date.now(),
      ts: new Date().toISOString(),
      text: failureText.trim(),
    };
    setFailures((curr) => [...(curr || []), entry]);
    setFailureText("");
  };

  const scheduleBackup = () => {
    const next = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);
    setNextBackup(next);
    window.localStorage.setItem("system_next_backup", next);
  };

  const handleCloudSync = async () => {
    const result = await syncStateToCloud();
    if (result.ok) {
      window.alert("Cloud sync request sent.");
    } else {
      window.alert(
        `Cloud sync not completed (${result.reason || result.status || "unknown"})`
      );
    }
  };

  const renderPermission = (perm) => {
    const roles = Object.keys(permissions || {}).filter((role) =>
      permissions?.[role]?.includes(perm)
    );
    return (
      <div className="border border-white/25 px-3 py-2">
        <p className="text-sm capitalize">{perm}</p>
        <p className="text-[11px] opacity-60">
          Roles: {roles.join(", ") || "none"}
        </p>
      </div>
    );
  };

  const overviewCards = useMemo(
    () => [
      { label: "Days Tracked · Focus", value: dayCounts.focus },
      { label: "Days Tracked · Obligations", value: dayCounts.obligations },
      { label: "Days Tracked · Sessions", value: dayCounts.sessions },
      { label: "Days Tracked · Ledger", value: dayCounts.ledger },
      { label: "Days Tracked · Health", value: dayCounts.health },
      {
        label: "Scratchpad Length",
        value: typeof scratchpad === "string" ? scratchpad.length : 0,
      },
    ],
    [dayCounts, scratchpad]
  );

  // Security simulator
  useEffect(() => {
    const timer = window.setInterval(() => {
      const event = {
        id: Date.now(),
        ts: new Date().toISOString(),
        status: Math.random() > 0.8 ? "alert" : "ok",
        detail:
          Math.random() > 0.8
            ? "Suspicious token usage detected"
            : "All subsystems nominal",
      };
      setSecurityEvents((curr) => {
        const list = Array.isArray(curr) ? curr : [];
        return [...list.slice(-20), event];
      });
    }, 8000);
    return () => window.clearInterval(timer);
  }, [setSecurityEvents]);

  // Backup scheduler tick
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!nextBackup) return;
      const due = new Date(nextBackup).getTime();
      if (Date.now() >= due) {
        handleDownloadBackup();
        const next = new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16);
        setNextBackup(next);
        window.localStorage.setItem("system_next_backup", next);
      }
    }, 60000);
    return () => window.clearInterval(timer);
  }, [nextBackup, handleDownloadBackup]);

  return (
    <div className="px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
            System
          </p>
          <h2 className="text-lg sm:text-xl">Diagnostics &amp; Data</h2>
        </div>
        <p className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          Local Storage Status
        </p>
      </div>

      <p className="text-sm opacity-80 mb-4 max-w-2xl">
        Overview of what this browser is currently storing for Troupe OS. All
        data lives only on this device until a backend or sync endpoint is
        configured.
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
                : "border-white/30 opacity-70")
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
        {overviewCards.map((card) => (
          <div key={card.label} className="border border-white/30 px-3 py-3">
            <p className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-1">
              {card.label}
            </p>
            <p className="text-lg">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Raw snapshot preview */}
      <details className="mb-4">
        <summary className="text-[11px] tracking-[0.18em] uppercase opacity-70 cursor-pointer">
          View Raw Snapshot (Money &amp; Scratchpad)
        </summary>
        <div className="mt-2 text-xs bg-black/60 border border-white/20 px-3 py-2 overflow-x-auto whitespace-pre-wrap">
          <p className="opacity-70 mb-1">money_snapshot</p>
          <pre className="mb-2">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
          <p className="opacity-70 mb-1">scratchpad (truncated)</p>
          <pre>
            {typeof scratchpad === "string"
              ? scratchpad.slice(0, 400)
              : ""}
            {typeof scratchpad === "string" && scratchpad.length > 400
              ? "…"
              : ""}
          </pre>
        </div>
      </details>

      {activeTab === "Security" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm">Live security monitor (local sim)</p>
            <button
              type="button"
              onClick={() =>
                setSecurityEvents((curr) => [
                  ...(curr || []),
                  {
                    id: Date.now(),
                    ts: new Date().toISOString(),
                    status: "alert",
                    detail: "Manual event injected",
                  },
                ])
              }
              className="text-[11px] border border-white/60 px-2 py-1 uppercase tracking-[0.18em]"
            >
              Inject Event
            </button>
          </div>
          <ul className="space-y-1 text-sm max-h-48 overflow-y-auto border border-white/20 p-2">
            {(securityEvents || []).slice(-10).reverse().map((evt) => (
              <li key={evt.id} className="flex justify-between gap-2">
                <span
                  className={
                    evt.status === "alert"
                      ? "text-amber-300"
                      : "text-emerald-200"
                  }
                >
                  {evt.status}
                </span>
                <span className="flex-1 text-right opacity-80">
                  {evt.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "Backups" && (
        <div className="mb-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleEncryptedSnapshot}
              className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
            >
              Encrypted Snapshot
            </button>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
            >
              Download Backup
            </button>
            <label className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase cursor-pointer">
              Upload Backup
              <input
                type="file"
                accept="application/json"
                onChange={handleUploadBackup}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={scheduleBackup}
              className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
            >
              Schedule Backup
            </button>
          </div>
          <p className="text-sm opacity-70">
            Next scheduled backup: {nextBackup || "not scheduled"}
          </p>
        </div>
      )}

      {activeTab === "APIs" && (
        <div className="mb-4 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              value={apiLabel}
              onChange={(e) => setApiLabel(e.target.value)}
              placeholder="Key label"
              className="bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
            <input
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="API secret"
              className="bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
            <input
              type="password"
              value={apiPass}
              onChange={(e) => setApiPass(e.target.value)}
              placeholder="Passphrase"
              className="bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
            />
          </div>
          <button
            type="button"
            onClick={handleApiVaultSave}
            className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
          >
            Store Encrypted Key
          </button>
          <p className="text-[11px] opacity-70">
            Keys stored: {apiVault?.length || 0}. Encryption uses browser
            crypto; passphrase required to decrypt later.
          </p>
        </div>
      )}

      {activeTab === "Processes" && (
        <div className="mb-4 space-y-2">
          <textarea
            value={failureText}
            onChange={(e) => setFailureText(e.target.value)}
            placeholder="Log a failure or system incident"
            className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[80px]"
          />
          <button
            type="button"
            onClick={handleLogFailure}
            className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
          >
            Log Failure
          </button>
          <ul className="space-y-1 text-sm">
            {(failures || []).slice(-5).reverse().map((f) => (
              <li key={f.id} className="border border-white/20 px-2 py-1">
                {f.ts}: {f.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "Permissions" && (
        <div className="mb-4">
          <p className="text-sm opacity-80 mb-2">
            Permission hierarchy (local only).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {renderPermission("backups")}
            {renderPermission("ledger")}
            {renderPermission("sessions")}
            {renderPermission("keys")}
            {renderPermission("logs")}
          </div>
          <button
            type="button"
            onClick={handleResetAll}
            className="mt-3 text-xs border border-white/80 px-3 py-2 tracking-[0.18em] uppercase"
          >
            Reset Local Data
          </button>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleCloudSync}
          className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
        >
          Cloud Sync (stub)
        </button>
      </div>
    </div>
  );
}
