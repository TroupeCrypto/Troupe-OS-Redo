// app/page.jsx
"use client";

import { useState } from "react";

import TodayFocusPanel from "../components/TodayFocusPanel";
import ObligationsPanel from "../components/ObligationsPanel";
import ScratchpadPanel from "../components/ScratchpadPanel";
import MoneySnapshotPanel from "../components/MoneySnapshotPanel";
import HistoryViewerPanel from "../components/HistoryViewerPanel";
import CreativeSessionsPanel from "../components/CreativeSessionsPanel";
import DailyMoneyLedgerPanel from "../components/DailyMoneyLedgerPanel";
import HealthEnergyPanel from "../components/HealthEnergyPanel";
import SystemPanel from "../components/SystemPanel";
import AnalyticsPanel from "../components/AnalyticsPanel";
import AuthGatePanel from "../components/AuthGatePanel";
import { useRoleMode, ROLE_MODES } from "../lib/useRoleMode";

export default function HomePage() {
  const [unlocked, setUnlocked] = useState(false);
  const { mode, setMode, roles } = useRoleMode();

  const scrollToSection = (id) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-black text-white">
        <AuthGatePanel onUnlock={() => setUnlocked(true)} />
      </main>
    );
  }

  const showTodayCommand =
    mode === "FOUNDER" ||
    mode === "CREATIVE" ||
    mode === "FINANCE" ||
    mode === "HEALTH";

  const showCreativeSection =
    mode === "FOUNDER" || mode === "CREATIVE" || mode === "PUBLIC";

  const showCreativeSessions = mode === "FOUNDER" || mode === "CREATIVE";

  const showMoneySection = mode === "FOUNDER" || mode === "FINANCE";

  const showHealthSection = mode === "FOUNDER" || mode === "HEALTH";

  const showNotesHistory =
    mode === "FOUNDER" || mode === "CREATIVE" || mode === "HEALTH";

  const showAnalytics = mode === "FOUNDER" || mode === "FINANCE";

  const showSystem = mode === "FOUNDER" || mode === "FINANCE";

  const navItems = [
    { id: "section-today", label: "Today", visible: showTodayCommand },
    { id: "section-money", label: "Money", visible: showMoneySection },
    {
      id: "section-creative",
      label: "Creative Studio",
      visible: showCreativeSection,
    },
    {
      id: "section-health",
      label: "Health & Energy",
      visible: showHealthSection,
    },
    { id: "section-system", label: "System", visible: showSystem },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <header
        id="section-top"
        className="border-b border-white/40 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70">
            Troupe OS · Control Surface
          </p>
          <p className="text-xs opacity-60 mt-1">System Online · v0.1</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-[11px] opacity-60 tracking-[0.25em] uppercase">
            Vercel
          </div>
          <div className="flex flex-wrap justify-end gap-1 text-[10px]">
            {ROLE_MODES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setMode(role)}
                className={
                  "px-2 py-[3px] border rounded-full tracking-[0.18em] uppercase " +
                  (mode === role
                    ? "border-white/90"
                    : "border-white/30 opacity-70")
                }
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Active Workspace / Today (always visible) */}
      <section id="section-today" className="border-b border-white/40">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
            Active Workspace
          </p>
          <h1 className="text-xl sm:text-2xl">Today</h1>
          <p className="text-sm opacity-80 mt-2 max-w-xl">
            Schedule, priorities, and one clear focus.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/40 px-3 py-[3px] text-[11px] tracking-[0.25em] uppercase">
            <span className="opacity-80">System Online</span>
            <span className="opacity-60">
              First Goal: One Reliable Control Screen
            </span>
          </div>
          <p className="mt-2 text-[10px] opacity-60">
            Mode: {mode.toLowerCase()}
          </p>
        </div>
      </section>

      {/* Today / Command Center */}
      {showTodayCommand && (
        <section className="border-b border-white/40">
          <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-baseline justify-between">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
                Today
              </p>
              <h2 className="text-lg sm:text-xl">Command Center</h2>
            </div>
            <p className="text-[10px] opacity-60 tracking-[0.25em] uppercase">
              Live Now
            </p>
          </div>

          <div className="border-t border-white/40">
            <TodayFocusPanel />
          </div>

          <div className="border-t border-white/40">
            <ObligationsPanel />
          </div>
        </section>
      )}

      {/* Creative Studio */}
      {showCreativeSection && (
        <section id="section-creative" className="border-b border-white/40">
          <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-baseline justify-between">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
                ZIG ZAG · Art · Drops
              </p>
              <h2 className="text-lg sm:text-xl">Creative Studio</h2>
            </div>
          </div>

          {/* Intro */}
          <div className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
            <p className="text-sm opacity-80 max-w-2xl">
              Entry point to music, visuals, and releases. This is where
              creative work is captured and pushed toward the world.
            </p>
          </div>

          {/* Sessions (live, daily) – hidden in PUBLIC mode */}
          {showCreativeSessions && <CreativeSessionsPanel />}

          {/* Releases (shell for future state) */}
          <div className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
              Releases
            </h3>
            <p className="text-sm opacity-80 max-w-xl">
              Track songs, art pieces, drops, and which stage they&apos;re in:
              idea, in progress, ready, scheduled, released.
            </p>
          </div>

          {/* Pipelines (shell for future automations) */}
          <div className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
              Pipelines
            </h3>
            <p className="text-sm opacity-80 max-w-xl">
              Later this will connect to distribution, storefronts, campaigns,
              and automations that push work into the world without manual
              overhead.
            </p>
          </div>
        </section>
      )}

      {/* Money Overview */}
      {showMoneySection && (
        <section id="section-money" className="border-b border-white/40">
          <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-baseline justify-between">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
                Money
              </p>
              <h2 className="text-lg sm:text-xl">Money Overview</h2>
            </div>
            <p className="text-[10px] opacity-60 tracking-[0.25em] uppercase">
              Local Only · v0.1
            </p>
          </div>

          <div className="border-t border-white/40 grid grid-cols-1 md:grid-cols-3">
            {/* Cash & Accounts */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b md:border-b-0 md:border-r border-white/20">
              <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
                Cash &amp; Accounts
              </h3>
              <p className="text-[11px] opacity-60 mb-1">
                Manual inputs → later: live sync
              </p>
              <p className="text-sm opacity-80 max-w-xs">
                High-level view of balances, wallets, and accounts. Starts as a
                planning surface before it connects to live data.
              </p>
            </div>

            {/* Upcoming Obligations */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b md:border-b-0 md:border-r border-white/20">
              <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
                Upcoming Obligations
              </h3>
              <p className="text-[11px] opacity-60 mb-1">
                Bills, renewals, non-negotiables
              </p>
              <p className="text-sm opacity-80 max-w-xs">
                This panel will eventually align money with time: what is due,
                when it hits, and how it impacts today&apos;s choices.
              </p>
            </div>

            {/* Opportunities */}
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
                Opportunities
              </h3>
              <p className="text-[11px] opacity-60 mb-1">
                Deals, drops, leverage points
              </p>
              <p className="text-sm opacity-80 max-w-xs">
                A surface for tracking leverage: pending sales, drops, and
                one-off chances to move the needle financially.
              </p>
            </div>
          </div>

          <MoneySnapshotPanel />
          <DailyMoneyLedgerPanel />
        </section>
      )}

      {/* Health & Energy */}
      {showHealthSection && (
        <section id="section-health" className="border-b border-white/40">
          <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-baseline justify-between">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
                Health &amp; Energy
              </p>
              <h2 className="text-lg sm:text-xl">Body · Battery · Mood</h2>
            </div>
            <p className="text-[10px] opacity-60 tracking-[0.25em] uppercase">
              Local Only · v0.1
            </p>
          </div>

          <HealthEnergyPanel />
        </section>
      )}

      {/* Notes & History */}
      {showNotesHistory && (
        <section id="section-notes" className="border-b border-white/40">
          <ScratchpadPanel />
          <HistoryViewerPanel />
        </section>
      )}

      {/* Analytics */}
      {showAnalytics && (
        <section id="section-analytics" className="border-b border-white/40">
          <AnalyticsPanel />
        </section>
      )}

      {/* System */}
      {showSystem && (
        <section id="section-system" className="border-b border-white/40">
          <SystemPanel />
        </section>
      )}

      {/* Bottom Navigation Bar */}
      <footer className="sticky bottom-0 border-t border-white/40 bg-black/95 backdrop-blur px-2 py-2 flex justify-center">
        <nav className="flex gap-1 text-[11px]">
          {navItems
            .filter((item) => item.visible)
            .map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={
                  "px-3 py-1 border rounded-full tracking-[0.18em] uppercase " +
                  (idx === 0
                    ? "border-white/80"
                    : "border-white/40 opacity-70")
                }
              >
                {item.label}
              </button>
            ))}
        </nav>
      </footer>
    </main>
  );
}
