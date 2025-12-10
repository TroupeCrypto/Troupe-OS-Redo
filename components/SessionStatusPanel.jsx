// components/SessionStatusPanel.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

const PROFILE_KEY = "troupe_os_profiles_v1";
const SESSION_KEY = "troupe_os_auth_session_expiry";
const AUDIT_KEY = "troupe_os_audit_log_v1";

function loadProfilesSafe() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (err) {
    console.error("Failed to load profiles for SessionStatusPanel", err);
    return null;
  }
}

function loadAuditSafe() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("Failed to load audit log for SessionStatusPanel", err);
    return [];
  }
}

function formatTs(ts) {
  if (!ts) return "-";
  try {
    return ts.slice(0, 16).replace("T", " ");
  } catch {
    return ts;
  }
}

export default function SessionStatusPanel() {
  const [profileLabel, setProfileLabel] = useState("Unknown");
  const [profileRole, setProfileRole] = useState("FOUNDER");
  const [sessionRemaining, setSessionRemaining] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastAuditEvent, setLastAuditEvent] = useState(null);

  // Load profile + last audit on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Profiles
    const identity = loadProfilesSafe();
    if (identity && identity.profiles) {
      const activeId = identity.activeProfileId || "founder";
      const p = identity.profiles[activeId] || identity.profiles.founder;
      if (p) {
        setProfileLabel(p.label || activeId);
        setProfileRole(p.roleMode || "FOUNDER");
      }
    }

    // Audit
    const audit = loadAuditSafe();
    if (audit.length) {
      const sorted = audit
        .slice()
        .sort(
          (a, b) =>
            new Date(b.ts || 0).getTime() -
            new Date(a.ts || 0).getTime()
        );
      setLastAuditEvent(sorted[0]);
    }
  }, []);

  // Session countdown (live, independent of HomePage)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readAndUpdate = () => {
      try {
        const raw = window.localStorage.getItem(SESSION_KEY);
        if (!raw) {
          setSessionRemaining(null);
          setSessionExpired(true);
          return;
        }
        const expiry = Number(raw);
        if (!Number.isFinite(expiry)) {
          setSessionRemaining(null);
          setSessionExpired(true);
          return;
        }
        const diffMs = expiry - Date.now();
        if (diffMs <= 0) {
          setSessionRemaining(0);
          setSessionExpired(true);
          return;
        }
        const seconds = Math.floor(diffMs / 1000);
        setSessionRemaining(seconds);
        setSessionExpired(false);
      } catch (err) {
        console.error("Failed to read session expiry", err);
      }
    };

    readAndUpdate();
    const id = window.setInterval(readAndUpdate, 1000);
    return () => window.clearInterval(id);
  }, []);

  const sessionSummary = useMemo(() => {
    if (sessionRemaining == null) {
      return "No active session detected.";
    }
    const mins = Math.floor(sessionRemaining / 60);
    const secs = sessionRemaining % 60;
    return `~${mins}m ${secs.toString().padStart(2, "0")}s remaining`;
  }, [sessionRemaining]);

  const statusColor =
    sessionRemaining == null
      ? "border-white/40 text-white/80"
      : sessionExpired
      ? "border-red-400 text-red-200"
      : "border-emerald-300 text-emerald-200";

  const statusLabel =
    sessionRemaining == null
      ? "Unknown"
      : sessionExpired
      ? "Expired"
      : "Active";

  return (
    <section className="border-b border-white/30 bg-black/90 px-4 py-2 sm:px-6 sm:py-2.5 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] tracking-[0.25em] uppercase opacity-70">
            Session
          </span>
          <span
            className={
              "inline-flex items-center gap-1 rounded-full px-2 py-[2px] border " +
              statusColor
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="uppercase tracking-[0.18em] text-[9px]">
              {statusLabel}
            </span>
          </span>
          <span className="opacity-75">{sessionSummary}</span>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-0.5 text-[10px] opacity-80">
          <p>
            Profile: <span className="font-medium">{profileLabel}</span>{" "}
            · Role: <span className="font-medium">{profileRole}</span>
          </p>
          <p className="opacity-70">
            Last event:{" "}
            {lastAuditEvent
              ? `${lastAuditEvent.method || "event"} · ${
                  lastAuditEvent.success ? "OK" : "FAIL"
                } · ${formatTs(lastAuditEvent.ts)}`
              : "No audit entries yet"}
          </p>
        </div>
      </div>
    </section>
  );
}
