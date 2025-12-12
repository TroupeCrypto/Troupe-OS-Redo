// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
import AuditLogPanel from "../components/AuditLogPanel";
import SessionStatusPanel from "../components/SessionStatusPanel";
import TroupeCompanyAtlasPanel from "../components/TroupeCompanyAtlasPanel";
import { useRoleMode, ROLE_MODES } from "../lib/useRoleMode";

// Publishing panels (additive imports)
import PublicationPlannerPanel from "../components/PublicationPlannerPanel";
import ArticleEditorPanel from "../components/ArticleEditorPanel";
import ArticleReaderPanel from "../components/ArticleReaderPanel";
import PublishingSummaryPanel from "../components/PublishingSummaryPanel";

const SESSION_KEY = "troupe_os_auth_state_v1";

function loadInitialSessionState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSessionState(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function HomePage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [lastUnlock, setLastUnlock] = useState(null);
  const { mode, setMode } = useRoleMode();

  useEffect(() => {
    const initial = loadInitialSessionState();
    if (initial?.unlocked) {
      setUnlocked(true);
      setLastUnlock(initial.lastUnlock ?? null);
    }
  }, []);

  useEffect(() => {
    const payload = {
      unlocked,
      lastUnlock,
    };
    saveSessionState(payload);
  }, [unlocked, lastUnlock]);

  const handleUnlock = ({ profileId, roleMode } = {}) => {
    setUnlocked(true);
    setLastUnlock(new Date().toISOString());
    if (roleMode) {
      setMode(roleMode);
    }
  };

  const scrollToSection = (id) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen text-white/90">
        <AuthGatePanel onUnlock={handleUnlock} />
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

  const showMoneySection =
    mode === "FOUNDER" ||
    mode === "FINANCE" ||
    mode === "HEALTH" ||
    mode === "PUBLIC";

  const showHealthSection =
    mode === "FOUNDER" ||
    mode === "HEALTH" ||
    mode === "PUBLIC" ||
    mode === "FINANCE";

  const showNotesHistory =
    mode === "FOUNDER" ||
    mode === "CREATIVE" ||
    mode === "PUBLIC" ||
    mode === "HEALTH";

  const showAnalytics =
    mode === "FOUNDER" ||
    mode === "FINANCE" ||
    mode === "PUBLIC" ||
    mode === "CREATIVE";

  const showSystem = mode === "FOUNDER" || mode === "PUBLIC";

  const navItems = [
    { id: "section-top", label: "Top", visible: true },
    {
      id: "section-today",
      label: "Today",
      visible: true,
    },
    {
      id: "section-command",
      label: "Command",
      visible: showTodayCommand,
    },
    {
      id: "section-creative",
      label: "Creative",
      visible: showCreativeSection,
    },
    {
      id: "section-money",
      label: "Money",
      visible: showMoneySection,
    },
    {
      id: "section-health",
      label: "Health",
      visible: showHealthSection,
    },
    { id: "section-notes", label: "Notes", visible: showNotesHistory },
    {
      id: "section-analytics",
      label: "Analytics",
      visible: showAnalytics,
    },
    { id: "section-system", label: "System", visible: showSystem },
    {
      id: "family-business",
      label: "Family Business",
      visible: mode === "FOUNDER",
      href: "/family-business",
    },
  ];

  const handleNavClick = (item) => {
    if (item.href) {
      router.push(item.href);
      return;
    }
    if (item.id) {
      scrollToSection(item.id);
    }
  };

  return (
    <main className="min-h-screen text-white/90">
      {/* Top Bar */}
      <header
        id="section-top"
        className="glow-header border-b border-white/40 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70">
            <span className="twitchy-text">Troupe OS · Control Surface</span>
          </p>
          <p className="text-xs opacity-60 mt-1">
            <span className="twitchy-text">System Online · v0.1</span>
          </p>
          <p className="mt-1 text-[10px] opacity-60">
            Mode: {mode.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-[11px] opacity-60 tracking-[0.25em] uppercase">
            Vercel
          </div>
          <div className="flex flex-wrap justify-end gap-1 text-[10px]">
            {Object.entries(ROLE_MODES).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`px-2.5 py-[3px] border rounded-full tracking-[0.18em] uppercase ${
                  mode === key
                    ? "border-white/80 bg-white/10"
                    : "border-white/30 opacity-80 hover:opacity-100"
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>
          {lastUnlock && (
            <div className="text-[10px] opacity-60">
              Last unlock:{" "}
              {new Date(lastUnlock).toLocaleString(undefined, {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </header>

      {/* Session status strip */}
      <SessionStatusPanel />

      {/* Active Workspace / Today (always visible) */}
      <section
        id="section-today"
        className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel"
      >
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
        </div>
      </section>

      {/* Today / Command Center */}
      {showTodayCommand && (
        <section
          id="section-command"
          className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel"
        >
          <div className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
                Command Center
              </p>
              <h2 className="text-lg sm:text-xl">Daily Control Stack</h2>
              <p className="text-sm opacity-80 mt-2 max-w-xl">
                Focus, obligations, and scratchpad are the three most
                important surfaces for everyday control.
              </p>
            </div>
            <div className="text-[11px] opacity-70">
              <p className="tracking-[0.25em] uppercase mb-1">Today</p>
              <p>
                {new Date().toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel">
            <TodayFocusPanel />
          </div>

          <div className="border-t border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel">
            <ObligationsPanel />
          </div>
        </section>
      )}

      {/* Creative Studio */}
      {showCreativeSection && (
        <section
          id="section-creative"
          className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel"
        >
          <div className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col md:flex-row gap-4 md:items-start md:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
                Creative Studio
              </p>
              <h2 className="text-lg sm:text-xl">Music · Art · Drops</h2>
              <p className="text-sm opacity-80 mt-2 max-w-xl">
                Sessions, releases, publishing, and pipelines for anything that
                needs creative energy.
              </p>
            </div>
            <div className="text-[11px] opacity-70">
              <p className="tracking-[0.25em] uppercase mb-1">State</p>
              <p>Local Only · v0.1</p>
            </div>
          </div>

          {/* Creative Sessions */}
          {showCreativeSection && <CreativeSessionsPanel />}

          {/* Publishing Workspace (Planner + Editor) */}
          <div className="border-t border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel">
            <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
              Publishing Workspace
            </h3>
            <p className="text-sm opacity-80 max-w-xl mb-3">
              Plan publications and issues on the left, and draft or edit
              articles on the right. This powers digital and future physical
              editions for music, art, crypto, cannabis, and collectibles.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <PublicationPlannerPanel />
              <ArticleEditorPanel />
            </div>
          </div>

          {/* Reading View (digital + future print layout preview) */}
          <div className="border-t border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel">
            <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
              Reading View
            </h3>
            <p className="text-sm opacity-80 max-w-xl mb-3">
              A clean reading layout for the currently selected article. This is
              the digital canvas that can later map to a print layout for the
              Troupe Inc. physical publication.
            </p>
            <ArticleReaderPanel />
          </div>

          {/* Releases */}
          <div className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
              Releases
            </h3>
            <p className="text-sm opacity-80 max-w-xl">
              Track songs, art pieces, drops, and which stage they&apos;re in:
              idea, in progress, ready, scheduled, released.
            </p>
          </div>

          {/* Pipelines */}
          <div className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="text-xs tracking-[0.25em] uppercase mb-2">
              Pipelines
            </h3>
            <p className="text-sm opacity-80 max-w-xl">
              A view we can later wire to automation jobs: posting, metadata,
              NFTs, or cross-posting to different platforms.
            </p>
          </div>
        </section>
      )}

      {/* Money */}
      {showMoneySection && (
        <section
          id="section-money"
          className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel"
        >
          <div className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
                Money
              </p>
              <h2 className="text-lg sm:text-xl">Snapshot & Daily Flow</h2>
              <p className="text-sm opacity-80 mt-2 max-w-xl">
                High-level positions plus a line-by-line ledger of where every
                dollar is going.
              </p>
            </div>
            <div className="text-[11px] opacity-70">
              <p className="tracking-[0.25em] uppercase mb-1">Status</p>
              <p>Local Only · v0.1</p>
            </div>
          </div>

          <MoneySnapshotPanel />
          <DailyMoneyLedgerPanel />
        </section>
      )}

      {/* Health & Energy */}
      {showHealthSection && (
        <section
          id="section-health"
          className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel"
        >
          <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-baseline justify-between">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
                Health & Energy
              </p>
              <h2 className="text-lg sm:text-xl">Body · Mood · Energy</h2>
              <p className="text-sm opacity-80 mt-2 max-w-xl">
                Track the basics that impact everything else: sleep, movement,
                mood, and subjective energy.
              </p>
            </div>
            <div className="text-[11px] opacity-70">
              <p className="tracking-[0.25em] uppercase mb-1">Status</p>
              <p>Local Only · v0.1</p>
            </div>
          </div>

          <HealthEnergyPanel />
        </section>
      )}

      {/* Notes & History */}
      {showNotesHistory && (
        <section
          id="section-notes"
          className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel"
        >
          <ScratchpadPanel />
          <HistoryViewerPanel />
        </section>
      )}

      {/* Analytics */}
      {showAnalytics && (
        <section
          id="section-analytics"
          className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel"
        >
          <AnalyticsPanel />
          <div className="mt-4">
            <PublishingSummaryPanel />
          </div>
        </section>
      )}

      {/* System */}
      {showSystem && (
        <section
          id="section-system"
          className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel"
        >
          <TroupeCompanyAtlasPanel />
          <div className="mt-4">
            <SystemPanel />
          </div>
          <div className="mt-4">
            <AuditLogPanel />
          </div>
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
                onClick={() => handleNavClick(item)}
                className={
                  "px-3 py-1 border rounded-full tracking-[0.18em] uppercase neon-button " +
                  (idx === 0
                    ? "border-white/80"
                    : "border-white/40 opacity-70")
                }
              >
                <span className="twitchy-nav">{item.label}</span>
              </button>
            ))}
        </nav>
      </footer>
    </main>
  );
}
