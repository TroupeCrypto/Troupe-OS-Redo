// components/AuthGatePanel.js
"use client";

import { useEffect, useState } from "react";

const PASS_KEY = "troupe_os_passcode_v1";

export default function AuthGatePanel({ onUnlock }) {
  const [hasPasscode, setHasPasscode] = useState(null); // null = loading
  const [storedPasscode, setStoredPasscode] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(PASS_KEY);
    if (stored) {
      setHasPasscode(true);
      setStoredPasscode(stored);
    } else {
      setHasPasscode(false);
    }
  }, []);

  const handleSetPasscode = (e) => {
    e.preventDefault();
    setError("");

    const trimmed1 = pass1.trim();
    const trimmed2 = pass2.trim();

    if (!trimmed1 || !trimmed2) {
      setError("Enter and confirm a passcode.");
      return;
    }
    if (trimmed1.length < 4) {
      setError("Use at least 4 characters.");
      return;
    }
    if (trimmed1 !== trimmed2) {
      setError("Passcodes do not match.");
      return;
    }

    try {
      window.localStorage.setItem(PASS_KEY, trimmed1);
      setStoredPasscode(trimmed1);
      setHasPasscode(true);
      onUnlock();
    } catch (err) {
      console.error("Failed to store passcode", err);
      setError("Could not save passcode.");
    }
  };

  const handleEnterPasscode = (e) => {
    e.preventDefault();
    setError("");

    const trimmed = inputPass.trim();
    if (!trimmed) {
      setError("Enter your passcode.");
      return;
    }
    if (trimmed === storedPasscode) {
      onUnlock();
    } else {
      setError("Incorrect passcode.");
    }
  };

  if (hasPasscode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm opacity-70">Loading lock screen…</p>
      </div>
    );
  }

  const isSetup = !hasPasscode;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-sm w-full border border-white/40 bg-black/80 px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
          Troupe OS
        </p>
        <h1 className="text-xl mb-1">
          {isSetup ? "Set Access Passcode" : "Unlock Console"}
        </h1>
        <p className="text-xs opacity-70 mb-4">
          {isSetup
            ? "Create a passcode for this device. It protects Today, money, notes, health, and creative work."
            : "Enter the passcode for this device to access Today, money, notes, health, and creative work."}
        </p>

        {isSetup ? (
          <form onSubmit={handleSetPasscode} className="space-y-3">
            <div>
              <label className="block text-[11px] tracking-[0.18em] uppercase opacity-70 mb-1">
                Passcode
              </label>
              <input
                type="password"
                value={pass1}
                onChange={(e) => setPass1(e.target.value)}
                className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.18em] uppercase opacity-70 mb-1">
                Confirm Passcode
              </label>
              <input
                type="password"
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-300 mt-1">{error}</p>
            )}
            <button
              type="submit"
              className="w-full mt-2 border border-white/80 text-[11px] tracking-[0.18em] uppercase py-2"
            >
              Save Passcode &amp; Enter
            </button>
            <p className="mt-2 text-[10px] opacity-60">
              Passcode is stored only on this device. Do not forget it; there is
              no recovery.
            </p>
          </form>
        ) : (
          <form onSubmit={handleEnterPasscode} className="space-y-3">
            <div>
              <label className="block text-[11px] tracking-[0.18em] uppercase opacity-70 mb-1">
                Passcode
              </label>
              <input
                type="password"
                value={inputPass}
                onChange={(e) => setInputPass(e.target.value)}
                className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-300 mt-1">{error}</p>
            )}
            <button
              type="submit"
              className="w-full mt-2 border border-white/80 text-[11px] tracking-[0.18em] uppercase py-2"
            >
              Unlock
            </button>
            <p className="mt-2 text-[10px] opacity-60">
              This lock covers all Troupe OS panels on this device.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
