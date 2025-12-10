"use client";

import { useState } from "react";

const APPS = [
  { id: "today", label: "Today", description: "Schedule, priorities, and one clear focus." },
  { id: "money", label: "Money", description: "Cash, accounts, flows, and upcoming obligations." },
  { id: "creative", label: "Creative Studio", description: "Music, art, content, and release pipelines." },
  { id: "health", label: "Health & Energy", description: "Movement, sleep, habits, and recovery." },
  { id: "system", label: "System", description: "Settings, structure, and future upgrades." },
];

export default function Home() {
  const [activeApp, setActiveApp] = useState("today");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* System Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-semibold tracking-wide">Troupe OS</span>
            <span className="text-slate-400">· Control Surface</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">v0.1 · Shell Online</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              <span>Vercel</span>
            </span>
          </div>
        </div>
      </header>

      {/* Desktop Background + Workspace */}
      <main className="flex-1">
        <div className="relative h-full">
          {/* Cosmic gradient background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_55%),radial-gradient(circle_at_bottom,_#06b6d433,_transparent_55%)]"
          />
          <div className="relative mx-auto flex h-full max-w-6xl flex-col px-4 py-6 gap-4">
            {/* Active App + Summary Strip */}
            <section className="rounded-2xl border border-slate-800/70 bg-slate-950/80 px-4 py-3 sm:px-5 sm:py-4 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Active Workspace
                  </p>
                  <p className="text-base sm:text-lg font-semibold">
                    {APPS.find((app) => app.id === activeApp)?.label || "Today"}
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-400 max-w-xl">
                    {APPS.find((app) => app.id === activeApp)?.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    System Online
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-1">
                    First Goal: One Reliable Control Screen
                  </span>
                </div>
              </div>
            </section>

            {/* Main Workspace Grid */}
            <section className="flex-1 grid gap-4 md:grid-cols-[1.6fr,1fr]">
              {/* Left Column */}
              <div className="flex flex-col gap-4">
                {/* Today Panel */}
                <div
                  className={[
                    "flex flex-col rounded-2xl border bg-slate-950/85 p-4 sm:p-5",
                    activeApp === "today"
                      ? "border-emerald-400/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                      : "border-slate-800/80",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm sm:text-base font-semibold">Today / Command Center</h2>
                    <span className="rounded-full bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300">
                      Live now
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400">
                    One place to see what matters today: focus, obligations, and one non-negotiable
                    win.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-800/70 bg-slate-950/80 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        Today&apos;s Focus
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        Define one clear priority for the next block of time.
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        This panel will eventually connect to a task + time-boxing system.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800/70 bg-slate-950/80 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        Obligations
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        Capture immediate things you cannot afford to forget.
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Later this will sync with reminders, money, and commitments.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Creative Studio Panel */}
                <div
                  className={[
                    "flex flex-col rounded-2xl border bg-slate-950/80 p-4 sm:p-5",
                    activeApp === "creative"
                      ? "border-fuchsia-400/60 shadow-[0_0_30px_rgba(232,121,249,0.35)]"
                      : "border-slate-800/80",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm sm:text-base font-semibold">Creative Studio</h2>
                    <span className="rounded-full bg-fuchsia-500/15 px-2 py-1 text-[11px] text-fuchsia-200">
                      ZIG ZAG · Art · Drops
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400">
                    Entry point to music, visuals, and releases. This is where creative work is
                    captured and pushed toward the world.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-800/70 bg-slate-950/80 p-3">
                      <p className="text-[11px] font-medium text-slate-300">Sessions</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Log current ideas, works-in-progress, and what needs recording next.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800/70 bg-slate-950/80 p-3">
                      <p className="text-[11px] font-medium text-slate-300">Releases</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Track songs, art pieces, drops, and which stage they&apos;re in.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800/70 bg-slate-950/80 p-3">
                      <p className="text-[11px] font-medium text-slate-300">Pipelines</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Later this will connect to distribution, storefronts, and campaigns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-4">
                {/* Money Panel */}
                <div
                  className={[
                    "flex flex-col rounded-2xl border bg-slate-950/85 p-4 sm:p-5",
                    activeApp === "money"
                      ? "border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.35)]"
                      : "border-slate-800/80",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm sm:text-base font-semibold">Money Overview</h2>
                    <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-[11px] text-cyan-200">
                      Read-only shell · v0.1
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400">
                    High-level view of accounts, obligations, and upcoming inflows. This starts as a
                    planning surface before it connects to live data.
                  </p>
                  <div className="mt-3 grid gap-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/90 px-3 py-2">
                      <span className="text-slate-300">Cash & Accounts</span>
                      <span className="text-slate-500 text-[11px]">
                        Manual inputs → later: live sync
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/90 px-3 py-2">
                      <span className="text-slate-300">Upcoming Obligations</span>
                      <span className="text-slate-500 text-[11px]">
                        Bills, renewals, non-negotiables
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/90 px-3 py-2">
                      <span className="text-slate-300">Opportunities</span>
                      <span className="text-slate-500 text-[11px]">
                        Deals, drops, leverage points
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes / Scratchpad */}
                <div className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm sm:text-base font-semibold">Scratchpad</h2>
                    <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] text-slate-400">
                      Local · No storage yet
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400">
                    This area is reserved for quick capture: thoughts, plans, numbers, or anything
                    that should not live in your head.
                  </p>
                  <div className="mt-3 rounded-xl border border-slate-800/70 bg-slate-950/90 p-3 text-xs text-slate-500">
                    In a later phase, this will sync to a persistent store and tie into tasks,
                    money, and decisions. For now, it defines the physical space in the OS.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Dock */}
      <footer className="border-t border-slate-800 bg-slate-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-2">
          <nav
            className="flex items-center justify-between gap-3"
            aria-label="Troupe OS Dock"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              {APPS.map((app) => {
                const isActive = app.id === activeApp;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setActiveApp(app.id)}
                    className={[
                      "group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm transition",
                      isActive
                        ? "border-emerald-400/70 bg-emerald-400/10 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-emerald-100"
                        : "border-slate-700 bg-slate-900/90 text-slate-300 hover:border-emerald-400/50 hover:bg-slate-900",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        isActive ? "bg-emerald-400" : "bg-slate-500 group-hover:bg-emerald-300",
                      ].join(" ")}
                    />
                    <span>{app.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
              <span>Shell</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span>v0.1 · Local UI only</span>
            </div>
          </nav>
        </div>
      </footer>
    </div>
  );
}
