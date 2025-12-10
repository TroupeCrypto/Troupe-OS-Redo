// components/AuditLogPanel.jsx
"use client";
/* eslint-disable react-hooks/set-state-in-effect -- hydrate audit events from localStorage on mount */

import { useEffect, useState } from "react";

const AUDIT_KEY = "troupe_os_audit_log_v1";

const METHOD_LABELS = {
  "setup-passcode": "Setup Passcode",
  "unlock-passcode": "Unlock (Passcode)",
  "setup-webauthn": "Enable Device Unlock",
  "unlock-webauthn": "Unlock (Device)",
};

const METHOD_ORDER = [
  "setup-passcode",
  "unlock-passcode",
  "setup-webauthn",
  "unlock-webauthn",
];

export default function AuditLogPanel() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(AUDIT_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const sorted = Array.isArray(parsed)
        ? [...parsed].sort((a, b) => {
            const ta = new Date(a.ts || 0).getTime();
            const tb = new Date(b.ts || 0).getTime();
            return tb - ta;
          })
        : [];
      setEntries(sorted);

      const counts = {};
      sorted.forEach((e) => {
        const key = e.method || "unknown";
        if (!counts[key]) {
          counts[key] = { total: 0, success: 0, failure: 0 };
        }
        counts[key].total += 1;
        if (e.success) counts[key].success += 1;
        else counts[key].failure += 1;
      });
      setSummary(counts);
    } catch (err) {
      console.error("Failed to read audit log", err);
      setEntries([]);
      setSummary({});
    }
  }, []);

  const hasEntries = entries.length > 0;

  return (
    <section className="border-t border-white/40">
      {/* Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-baseline justify-between">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
            Security
          </p>
          <h2 className="text-lg sm:text-xl">Access Audit Log</h2>
        </div>
        <p className="text-[10px] opacity-60 tracking-[0.25em] uppercase">
          Local Only · v0.1
        </p>
      </div>

      {/* Summary */}
      <div className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
        <p className="text-sm opacity-80 mb-2">
          Local record of profile unlocks and security changes on this device.
        </p>
        {!hasEntries && (
          <p className="text-[11px] opacity-60">
            No activity recorded yet. Unlocking profiles and enabling device
            unlock will populate this log.
          </p>
        )}

        {hasEntries && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {METHOD_ORDER.filter((m) => summary[m]).map((method) => {
              const s = summary[method];
              const label = METHOD_LABELS[method] || method;
              return (
                <div
                  key={method}
                  className="border border-white/25 rounded-md px-3 py-2"
                >
                  <p className="text-[10px] tracking-[0.18em] uppercase opacity-70 mb-1">
                    {label}
                  </p>
                  <p className="text-sm">
                    {s.total} events
                    <span className="text-[11px] opacity-60 ml-1">
                      ({s.success} ok / {s.failure} fail)
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed list */}
      {hasEntries && (
        <div className="border-t border-white/40 max-h-[320px] overflow-y-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 bg-black/95 backdrop-blur border-b border-white/20">
              <tr>
                <th className="px-4 sm:px-6 py-2 font-normal opacity-70 tracking-[0.18em] uppercase">
                  Time
                </th>
                <th className="px-2 py-2 font-normal opacity-70 tracking-[0.18em] uppercase">
                  Profile
                </th>
                <th className="px-2 py-2 font-normal opacity-70 tracking-[0.18em] uppercase">
                  Event
                </th>
                <th className="px-2 py-2 font-normal opacity-70 tracking-[0.18em] uppercase">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const label = METHOD_LABELS[entry.method] || entry.method;
                const ts = entry.ts
                  ? new Date(entry.ts)
                  : new Date(0); // fallback
                const tsStr = isNaN(ts.getTime())
                  ? "Unknown"
                  : ts.toLocaleString(undefined, {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                return (
                  <tr
                    key={`${entry.ts || "t"}-${idx}`}
                    className="border-b border-white/10"
                  >
                    <td className="px-4 sm:px-6 py-2 align-top whitespace-nowrap">
                      {tsStr}
                    </td>
                    <td className="px-2 py-2 align-top whitespace-nowrap">
                      {entry.profileId || "unknown"}
                    </td>
                    <td className="px-2 py-2 align-top">
                      {label || "unknown"}
                    </td>
                    <td className="px-2 py-2 align-top whitespace-nowrap">
                      {entry.success ? (
                        <span className="text-[11px] text-emerald-300">
                          Success
                        </span>
                      ) : (
                        <span className="text-[11px] text-red-300">
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
