"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AuditLogPanel from "../../components/AuditLogPanel";
import AuthGatePanel from "../../components/AuthGatePanel";
import DailyMoneyLedgerPanel from "../../components/DailyMoneyLedgerPanel";
import MoneySnapshotPanel from "../../components/MoneySnapshotPanel";
import SessionStatusPanel from "../../components/SessionStatusPanel";
import TroupeCompanyAtlasPanel from "../../components/TroupeCompanyAtlasPanel";
import { useRoleMode } from "../../lib/useRoleMode";

const SESSION_KEY = "troupe_os_family_business_state_v1";

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

export default function FamilyBusinessPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [lastUnlock, setLastUnlock] = useState(null);
  const [unlockError, setUnlockError] = useState("");
  const { mode, setMode } = useRoleMode();
  const isFounder = mode === "FOUNDER";

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

  const handleUnlock = ({ roleMode, profileId } = {}) => {
    if (roleMode && roleMode !== "FOUNDER") {
      setUnlockError("Family Business is restricted to the Founder profile.");
      setUnlocked(false);
      return;
    }
    if (profileId && profileId !== "founder") {
      setUnlockError("Family Business is restricted to the Founder profile.");
      setUnlocked(false);
      return;
    }
    setUnlockError("");
    setUnlocked(true);
    setLastUnlock(new Date().toISOString());
    setMode("FOUNDER");
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen text-white/90">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {unlockError ? (
            <div className="mb-4 rounded border border-red-400/60 bg-red-900/30 px-3 py-2 text-sm text-red-100">
              {unlockError}
            </div>
          ) : null}
          <AuthGatePanel onUnlock={handleUnlock} />
        </div>
      </main>
    );
  }

  if (!isFounder) {
    return (
      <main className="min-h-screen text-white/90">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="border border-white/40 bg-black/70 px-5 py-6 melty-panel">
            <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-2">
              Restricted
            </p>
            <h1 className="text-xl mb-2">Founder Mode Required</h1>
            <p className="text-sm opacity-80">
              Family Business is only available to the Founder profile. Switch
              back to Founder to continue.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode("FOUNDER")}
                className="px-3 py-2 border border-white/70 rounded-full text-[11px] uppercase tracking-[0.2em]"
              >
                Switch to Founder
              </button>
              <Link
                href="/"
                className="px-3 py-2 border border-white/40 rounded-full text-[11px] uppercase tracking-[0.2em] hover:border-white/70"
              >
                Back to Control Surface
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white/90">
      <header className="glow-header border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70">
            <span className="twitchy-text">Troupe OS · Family Business</span>
          </p>
          <h1 className="text-2xl sm:text-3xl mt-1">Family Business Desk</h1>
          <p className="text-sm opacity-80 mt-2 max-w-2xl">
            Sensitive control room reserved for the founder. Family capital,
            private ledger, and the operating atlas live here.
          </p>
          {lastUnlock && (
            <p className="text-[11px] opacity-60 mt-2">
              Last unlock:{" "}
              {new Date(lastUnlock).toLocaleString(undefined, {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link
            href="/"
            className="px-3 py-2 border border-white/50 rounded-full text-[11px] uppercase tracking-[0.2em] hover:border-white/80"
          >
            Back to Home
          </Link>
          <div className="text-[11px] opacity-60 tracking-[0.25em] uppercase">
            Founder Only
          </div>
        </div>
      </header>

      <SessionStatusPanel />

      <section className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel">
        <div className="px-2 sm:px-3">
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
            Family Capital
          </p>
          <h2 className="text-lg sm:text-xl">Snapshot</h2>
          <p className="text-sm opacity-80 mt-2 max-w-xl">
            Consolidated view of family positions and flows. Keep eyes on cash,
            obligations, and the safety window.
          </p>
        </div>
        <div className="mt-4">
          <MoneySnapshotPanel />
        </div>
      </section>

      <section className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel">
        <div className="px-2 sm:px-3 mb-3">
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
            Ledger
          </p>
          <h2 className="text-lg sm:text-xl">Family Daily Ledger</h2>
          <p className="text-sm opacity-80 mt-2 max-w-xl">
            Private line-by-line log of every inflow, outflow, and note tied to
            family business activity.
          </p>
        </div>
        <DailyMoneyLedgerPanel />
      </section>

      <section className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel">
        <div className="px-2 sm:px-3 mb-3">
          <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
            Atlas
          </p>
          <h2 className="text-lg sm:text-xl">Family Operating Map</h2>
          <p className="text-sm opacity-80 mt-2 max-w-xl">
            Entities, regions, and core systems tied to family operations. Use
            this to audit dependencies and critical paths.
          </p>
        </div>
        <TroupeCompanyAtlasPanel />
      </section>

      <section className="border-b border-white/40 px-4 py-4 sm:px-6 sm:py-5 melty-panel">
        <div className="px-2 sm:px-3 mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
              Audit
            </p>
            <h2 className="text-lg sm:text-xl">Sensitive Access Log</h2>
            <p className="text-sm opacity-80 mt-2 max-w-xl">
              Track unlocks, device enrollment, and any high-sensitivity actions
              taken in the family workspace.
            </p>
          </div>
          <Link
            href="/"
            className="hidden sm:inline-flex px-3 py-2 border border-white/40 rounded-full text-[11px] uppercase tracking-[0.2em] hover:border-white/70"
          >
            Return to Landing
          </Link>
        </div>
        <AuditLogPanel />
      </section>
    </main>
  );
}
