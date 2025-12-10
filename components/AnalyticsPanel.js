"use client";

import { usePersistentState } from "../lib/usePersistentState";

function getSortedDates(obj) {
  if (!obj || typeof obj !== "object") return [];
  return Object.keys(obj).sort();
}

function computeNetForDay(entries) {
  if (!Array.isArray(entries)) return 0;
  return entries.reduce((acc, e) => {
    if (typeof e.amount !== "number") return acc;
    return acc + (e.direction === "IN" ? e.amount : -e.amount);
  }, 0);
}

function computeEnergyForDay(entry) {
  if (!entry || typeof entry !== "object") return null;
  if (typeof entry.energy !== "number") return null;
  return entry.energy;
}

export default function AnalyticsPanel() {
  const [ledgerByDay] = usePersistentState("money_ledger_by_day", {});
  const [healthByDay] = usePersistentState("health_energy_by_day", {});
  const [sessionsByDay] = usePersistentState("creative_sessions_by_day", {});

  const dates = Array.from(
    new Set([
      ...getSortedDates(ledgerByDay),
      ...getSortedDates(healthByDay),
      ...getSortedDates(sessionsByDay),
    ])
  ).sort();

  const lastDates = dates.slice(-7); // last 7 days

  const rows = lastDates.map((date) => {
    const net = computeNetForDay(ledgerByDay?.[date]);
    const energy = computeEnergyForDay(healthByDay?.[date]);
    const sessions = Array.isArray(sessionsByDay?.[date])
      ? sessionsByDay[date].length
      : 0;

    return { date, net, energy, sessions };
  });

  const maxAbsNet = rows.reduce(
    (max, r) => Math.max(max, Math.abs(r.net || 0)),
    0
  );

  const maxSessions = rows.reduce(
    (max, r) => Math.max(max, r.sessions || 0),
    0
  );

  const netScale = maxAbsNet > 0 ? maxAbsNet : 1;
  const sessionScale = maxSessions > 0 ? maxSessions : 1;

  return (
    <section className="border-b border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
            Analytics
          </p>
          <h2 className="text-lg sm:text-xl">Last 7 Days</h2>
        </div>
        <p className="text-[10px] opacity-60 tracking-[0.18em] uppercase">
          Local View Only
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm opacity-70">
          Not enough history yet. As you log days, this area will show money,
          energy, and sessions at a glance.
        </p>
      ) : (
        <div className="mt-3 space-y-2 text-xs">
          {rows.map((row) => {
            const netWidth = Math.min(
              100,
              Math.round((Math.abs(row.net || 0) / netScale) * 100)
            );
            const sessionWidth = Math.min(
              100,
              Math.round(((row.sessions || 0) / sessionScale) * 100)
            );

            return (
              <div key={row.date} className="border border-white/20 p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] tracking-[0.18em] uppercase opacity-70">
                    {row.date}
                  </span>
                  <span className="text-[11px] opacity-70">
                    Energy:{" "}
                    {row.energy != null ? row.energy : "—"} · Sessions:{" "}
                    {row.sessions}
                  </span>
                </div>

                {/* Net money bar */}
                <div className="mb-1">
                  <span className="block text-[10px] uppercase tracking-[0.18em] opacity-60">
                    Net Money
                  </span>
                  <div className="h-3 bg-white/10 overflow-hidden">
                    <div
                      className={
                        "h-full " +
                        (row.net > 0
                          ? "bg-emerald-300"
                          : row.net < 0
                          ? "bg-red-300"
                          : "bg-white")
                      }
                      style={{ width: `${netWidth}%` }}
                    />
                  </div>
                  <span className="text-[10px] opacity-70">
                    {row.net === 0
                      ? "$0.00"
                      : `${row.net > 0 ? "+" : "-"}$${Math.abs(
                          row.net
                        ).toFixed(2)}`}
                  </span>
                </div>

                {/* Sessions bar */}
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.18em] opacity-60">
                    Creative Sessions
                  </span>
                  <div className="h-2 bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-white"
                      style={{ width: `${sessionWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
