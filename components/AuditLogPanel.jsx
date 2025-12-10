// components/AuditLogPanel.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

const AUDIT_KEY = "troupe_os_audit_log_v1";

function loadAudit() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("Failed to load audit log", err);
    return [];
  }
}

function formatTs(ts) {
  if (!ts) return "-";
  try {
    return ts.slice(0, 19).replace("T", " ");
  } catch {
    return ts;
  }
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

export default function AuditLogPanel() {
  const [entries, setEntries] = useState([]);
  const [filterProfile, setFilterProfile] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterSuccess, setFilterSuccess] = useState("all");
  const [filterWindow, setFilterWindow] = useState("7"); // days
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const data = loadAudit();
    // newest first
    data.sort((a, b) => {
      const ta = new Date(a.ts || 0).getTime();
      const tb = new Date(b.ts || 0).getTime();
      return tb - ta;
    });
    setEntries(data);
  }, []);

  const now = useMemo(() => new Date(), []);

  const profileOptions = useMemo(
    () => uniqueSorted(entries.map((e) => e.profileId || "unknown")),
    [entries]
  );

  const methodOptions = useMemo(
    () => uniqueSorted(entries.map((e) => e.method || "unknown")),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    if (!entries.length) return [];

    const days = parseInt(filterWindow || "7", 10) || 7;
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() - days + 1);

    return entries.filter((e) => {
      const ts = e.ts ? new Date(e.ts) : null;

      if (ts && ts < windowStart) return false;

      if (filterProfile !== "all") {
        const p = e.profileId || "unknown";
        if (p !== filterProfile) return false;
      }

      if (filterMethod !== "all") {
        const m = e.method || "unknown";
        if (m !== filterMethod) return false;
      }

      if (filterSuccess !== "all") {
        const ok = !!e.success;
        if (filterSuccess === "success" && !ok) return false;
        if (filterSuccess === "failure" && ok) return false;
      }

      return true;
    });
  }, [
    entries,
    filterProfile,
    filterMethod,
    filterSuccess,
    filterWindow,
    now,
  ]);

  const successCount = filteredEntries.filter((e) => e.success).length;
  const failureCount = filteredEntries.length - successCount;

  return (
    <section className="border-t border-white/30 bg-black px-4 py-3 sm:px-6 sm:py-4 text-white">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70">
            Audit Trail
          </p>
          <p className="text-[11px] opacity-60">
            Auth &amp; system events on this device (local only).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] border border-white/60 px-2 py-1 rounded-full uppercase tracking-[0.18em]"
        >
          {expanded ? "Hide Log" : "Show Log"}
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] mb-3">
        <div className="border border-white/25 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Entries
          </p>
          <p className="text-[13px] font-semibold">
            {filteredEntries.length} / {entries.length}
          </p>
          <p className="opacity-70">
            Window: last {filterWindow} day
            {parseInt(filterWindow || "7", 10) === 1 ? "" : "s"}
          </p>
        </div>
        <div className="border border-white/25 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Outcomes
          </p>
          <p className="text-[13px] font-semibold">
            {successCount} ok · {failureCount} fail
          </p>
          <p className="opacity-70">
            Success types: passcode, WebAuthn, setup, etc.
          </p>
        </div>
        <div className="border border-white/25 rounded-sm px-2 py-1">
          <p className="uppercase tracking-[0.18em] opacity-60 mb-0.5">
            Filters
          </p>
          <p className="opacity-75">
            Profile: {filterProfile === "all" ? "Any" : filterProfile}
          </p>
          <p className="opacity-75">
            Method: {filterMethod === "all" ? "Any" : filterMethod}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[10px] mb-3">
        <div>
          <label className="block uppercase tracking-[0.18em] opacity-60 mb-1">
            Profile
          </label>
          <select
            value={filterProfile}
            onChange={(e) => setFilterProfile(e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          >
            <option value="all">All</option>
            {profileOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block uppercase tracking-[0.18em] opacity-60 mb-1">
            Method
          </label>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          >
            <option value="all">All</option>
            {methodOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block uppercase tracking-[0.18em] opacity-60 mb-1">
            Outcome
          </label>
          <select
            value={filterSuccess}
            onChange={(e) => setFilterSuccess(e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          >
            <option value="all">All</option>
            <option value="success">Success only</option>
            <option value="failure">Failures only</option>
          </select>
        </div>
        <div>
          <label className="block uppercase tracking-[0.18em] opacity-60 mb-1">
            Window (days)
          </label>
          <select
            value={filterWindow}
            onChange={(e) => setFilterWindow(e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-2 py-1 rounded-sm outline-none focus:border-white/80"
          >
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">365 days</option>
          </select>
        </div>
      </div>

      {expanded && (
        <div className="border border-white/25 rounded-md max-h-64 overflow-y-auto text-[10px]">
          <table className="w-full border-collapse">
            <thead className="bg-white/5 sticky top-0">
              <tr className="border-b border-white/20">
                <th className="text-left px-2 py-1 font-normal uppercase tracking-[0.18em]">
                  Time
                </th>
                <th className="text-left px-2 py-1 font-normal uppercase tracking-[0.18em]">
                  Profile
                </th>
                <th className="text-left px-2 py-1 font-normal uppercase tracking-[0.18em]">
                  Method
                </th>
                <th className="text-left px-2 py-1 font-normal uppercase tracking-[0.18em]">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-2 py-2 text-center opacity-60"
                  >
                    No matching entries in this window.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e, idx) => (
                  <tr
                    key={`${e.ts || "no-ts"}_${idx}`}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="px-2 py-1 whitespace-nowrap">
                      {formatTs(e.ts)}
                    </td>
                    <td className="px-2 py-1">
                      {(e.profileId || "unknown").toString()}
                    </td>
                    <td className="px-2 py-1">
                      {(e.method || "unknown").toString()}
                    </td>
                    <td className="px-2 py-1">
                      <span
                        className={
                          "px-1.5 py-[1px] rounded-full border " +
                          (e.success
                            ? "border-emerald-300 text-emerald-200"
                            : "border-red-400 text-red-200")
                        }
                      >
                        {e.success ? "OK" : "FAIL"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-2 text-[9px] opacity-60">
        This log lives only in this browser under{" "}
        <span className="font-mono">{AUDIT_KEY}</span>. Clearing local storage
        will erase it.
      </p>
    </section>
  );
}
