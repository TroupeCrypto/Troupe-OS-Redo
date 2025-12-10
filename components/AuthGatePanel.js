// components/AuthGatePanel.js
"use client";

import { useEffect, useState } from "react";

const PROFILE_KEY = "troupe_os_profiles_v1";
const AUDIT_KEY = "troupe_os_audit_log_v1";
const SESSION_KEY = "troupe_os_auth_session_expiry";

const DEFAULT_PROFILES = [
  { id: "founder", label: "Founder", roleMode: "FOUNDER" },
  { id: "creative", label: "Creative", roleMode: "CREATIVE" },
  { id: "finance", label: "Finance", roleMode: "FINANCE" },
  { id: "health", label: "Health", roleMode: "HEALTH" },
  { id: "public", label: "Public", roleMode: "PUBLIC" },
];

// Simple SHA-256 hashing for passcodes (stored as hex)
async function hashPasscode(passcode) {
  const enc = new TextEncoder();
  const data = enc.encode(passcode);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Base64url helpers for WebAuthn
function bufferToBase64url(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = base64 + (pad ? "=".repeat(4 - pad) : "");
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function appendAuditEntry(entry) {
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    const current = raw ? JSON.parse(raw) : [];
    current.push({
      ...entry,
      ts: new Date().toISOString(),
    });
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to append audit entry", err);
  }
}

export default function AuthGatePanel({ onUnlock }) {
  const [identity, setIdentity] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebAuthnAvailable, setIsWebAuthnAvailable] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);

  // Security context / policy knobs
  const [geoTag, setGeoTag] = useState("LOCAL");
  const [allowedGeo, setAllowedGeo] = useState("LOCAL");
  const [windowStart, setWindowStart] = useState("00:00"); // full day by default
  const [windowEnd, setWindowEnd] = useState("23:59");
  const [threatLevel, setThreatLevel] = useState("normal");

  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [error, setError] = useState("");

  // Init: load or create profile set
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setIdentity(parsed);
        setActiveProfileId(parsed.activeProfileId || "founder");
      } else {
        const profilesObj = {};
        DEFAULT_PROFILES.forEach((p) => {
          profilesObj[p.id] = {
            id: p.id,
            label: p.label,
            roleMode: p.roleMode,
            passcodeHash: null,
            webAuthnId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });
        const initial = {
          activeProfileId: "founder",
          profiles: profilesObj,
        };
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(initial));
        setIdentity(initial);
        setActiveProfileId("founder");
      }
    } catch (err) {
      console.error("Failed to load profiles", err);
    } finally {
      setIsLoading(false);
    }

    try {
      const storedSession = window.localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        setSessionExpiresAt(Number(storedSession));
      }
    } catch (err) {
      console.error("Failed to load auth session", err);
    }

    const webAuthnOk =
      typeof window !== "undefined" &&
      !!window.PublicKeyCredential &&
      !!window.navigator.credentials;
    setIsWebAuthnAvailable(webAuthnOk);
  }, []);

  if (isLoading || !identity || !activeProfileId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm opacity-70">Loading access profiles…</p>
      </div>
    );
  }

  const activeProfile = identity.profiles[activeProfileId];

  const saveIdentity = (next) => {
    setIdentity(next);
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error("Failed to save profiles", err);
    }
  };

  // Evaluate security constraints for this request
  const evaluateSessionConstraints = () => {
    const nowMs = Date.now();

    // If a session is already active, allow without re-checking policy.
    if (sessionExpiresAt && nowMs < sessionExpiresAt) {
      return { allowed: true, reason: null };
    }

    // Threat lockdown is hard stop
    if (threatLevel === "lockdown") {
      return { allowed: false, reason: "Threat lockdown active." };
    }

    // Geo-fence: only enforce when both sides are non-empty
    const geo = (geoTag || "").trim();
    const allowed = (allowedGeo || "").trim();
    if (geo && allowed && geo !== allowed) {
      return { allowed: false, reason: "Outside geo-fence." };
    }

    // Time window: only enforce when both times are set
    const startStr = (windowStart || "").trim();
    const endStr = (windowEnd || "").trim();
    if (startStr && endStr) {
      const now = new Date();
      const [startH = 0, startM = 0] = startStr.split(":").map((n) => Number(n) || 0);
      const [endH = 23, endM = 59] = endStr.split(":").map((n) => Number(n) || 0);

      const start = new Date(now);
      start.setHours(startH, startM, 0, 0);
      const end = new Date(now);
      end.setHours(endH, endM, 0, 0);

      let inWindow = false;

      if (end.getTime() === start.getTime()) {
        // Same time -> treat as full day (no restriction)
        inWindow = true;
      } else if (end > start) {
        // Normal same-day window
        inWindow = now >= start && now <= end;
      } else {
        // Overnight window (e.g., 23:00–05:00)
        inWindow = now >= start || now <= end;
      }

      if (!inWindow) {
        return { allowed: false, reason: "Outside access window." };
      }
    }

    return { allowed: true, reason: null };
  };

  const requireSessionAllowed = () => {
    const { allowed, reason } = evaluateSessionConstraints();
    if (!allowed && reason) {
      setError(reason);
    }
    return allowed;
  };

  const markSession = (roleMode) => {
    const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes
    setSessionExpiresAt(expiry);
    try {
      window.localStorage.setItem(SESSION_KEY, `${expiry}`);
    } catch (err) {
      console.error("Failed to persist auth session", err);
    }
    onUnlock({ profileId: activeProfileId, roleMode });
  };

  const updateProfile = (profileId, patch) => {
    const current = identity;
    const existing = current.profiles[profileId];
    if (!existing) return;

    const updatedProfile = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    const next = {
      ...current,
      profiles: {
        ...current.profiles,
        [profileId]: updatedProfile,
      },
    };
    saveIdentity(next);
  };

  const handleProfileChange = (id) => {
    setActiveProfileId(id);
    setPass1("");
    setPass2("");
    setInputPass("");
    setError("");
    const next = { ...identity, activeProfileId: id };
    saveIdentity(next);
  };

  const handleSetPasscode = async (e) => {
    e.preventDefault();
    setError("");
    if (!requireSessionAllowed()) return;

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
      const hash = await hashPasscode(trimmed1);
      updateProfile(activeProfileId, { passcodeHash: hash });
      appendAuditEntry({
        profileId: activeProfileId,
        method: "setup-passcode",
        success: true,
      });
      markSession(activeProfile.roleMode);
    } catch (err) {
      console.error("Failed to store passcode", err);
      setError("Could not save passcode.");
      appendAuditEntry({
        profileId: activeProfileId,
        method: "setup-passcode",
        success: false,
      });
    }
  };

  const handleEnterPasscode = async (e) => {
    e.preventDefault();
    setError("");
    if (!requireSessionAllowed()) return;

    const trimmed = inputPass.trim();
    if (!trimmed) {
      setError("Enter your passcode.");
      return;
    }

    try {
      const hash = await hashPasscode(trimmed);
      if (hash === activeProfile.passcodeHash) {
        appendAuditEntry({
          profileId: activeProfileId,
          method: "unlock-passcode",
          success: true,
        });
        markSession(activeProfile.roleMode);
      } else {
        setError("Incorrect passcode.");
        appendAuditEntry({
          profileId: activeProfileId,
          method: "unlock-passcode",
          success: false,
        });
      }
    } catch (err) {
      console.error("Passcode check failed", err);
      setError("Could not verify passcode.");
      appendAuditEntry({
        profileId: activeProfileId,
        method: "unlock-passcode",
        success: false,
      });
    }
  };

  const handleBiometricUnlock = async () => {
    setError("");
    if (!requireSessionAllowed()) return;
    if (!isWebAuthnAvailable) {
      setError("Device unlock not supported in this browser.");
      return;
    }

    try {
      // First-time: register a credential
      if (!activeProfile.webAuthnId) {
        const challenge = window.crypto.getRandomValues(new Uint8Array(32));
        const publicKey = {
          challenge,
          rp: {
            name: "Troupe OS",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(activeProfile.id),
            name: activeProfile.label,
            displayName: activeProfile.label,
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          timeout: 60000,
          authenticatorSelection: {
            userVerification: "preferred",
          },
        };

        const cred = await window.navigator.credentials.create({
          publicKey,
        });

        if (!cred || !cred.rawId) {
          setError("Could not enable device unlock.");
          appendAuditEntry({
            profileId: activeProfileId,
            method: "setup-webauthn",
            success: false,
          });
          return;
        }

        const credId = bufferToBase64url(cred.rawId);
        updateProfile(activeProfileId, { webAuthnId: credId });
        appendAuditEntry({
          profileId: activeProfileId,
          method: "setup-webauthn",
          success: true,
        });

        // After successful registration, treat as unlocked
        markSession(activeProfile.roleMode);
        return;
      }

      // Existing registration: try authentication
      const challenge = window.crypto.getRandomValues(new Uint8Array(32));
      const publicKey = {
        challenge,
        allowCredentials: [
          {
            id: base64urlToBuffer(activeProfile.webAuthnId),
            type: "public-key",
          },
        ],
        timeout: 60000,
        userVerification: "preferred",
      };

      const assertion = await window.navigator.credentials.get({
        publicKey,
      });

      if (!assertion) {
        setError("Device unlock failed.");
        appendAuditEntry({
          profileId: activeProfileId,
          method: "unlock-webauthn",
          success: false,
        });
        return;
      }

      appendAuditEntry({
        profileId: activeProfileId,
        method: "unlock-webauthn",
        success: true,
      });

      markSession(activeProfile.roleMode);
    } catch (err) {
      console.error("Biometric unlock error", err);
      setError("Device unlock not available or was cancelled.");
      appendAuditEntry({
        profileId: activeProfileId,
        method: "unlock-webauthn",
        success: false,
      });
    }
  };

  const hasPasscode = !!activeProfile.passcodeHash;
  const sessionRemaining = sessionExpiresAt
    ? Math.max(0, Math.floor((sessionExpiresAt - Date.now()) / 1000))
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-sm w-full border border-white/40 bg-black/80 px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-[11px] tracking-[0.25em] uppercase opacity-70 mb-1">
          Troupe OS
        </p>
        <h1 className="text-xl mb-1">Access Console</h1>
        <p className="text-xs opacity-70 mb-3">
          Choose a profile and unlock. Each profile has its own passcode and
          role view.
        </p>

        {/* Profile switcher */}
        <div className="mb-4">
          <label className="block text-[11px] tracking-[0.18em] uppercase opacity-70 mb-1">
            Profile
          </label>
          <select
            value={activeProfileId}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm outline-none focus:border-white/80"
          >
            {Object.values(identity.profiles).map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} · {p.roleMode}
              </option>
            ))}
          </select>
        </div>

        {!hasPasscode ? (
          <>
            <p className="text-[11px] opacity-70 mb-2">
              Set a passcode for{" "}
              <span className="font-semibold">{activeProfile.label}</span>{" "}
              on this device.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
              <label className="flex items-center gap-2">
                Role
                <select
                  value={activeProfile.roleMode}
                  onChange={(e) =>
                    updateProfile(activeProfileId, { roleMode: e.target.value })
                  }
                  className="bg-black/60 border border-white/30 px-2 py-1 text-[11px]"
                >
                  {DEFAULT_PROFILES.map((p) => (
                    <option key={p.roleMode} value={p.roleMode}>
                      {p.roleMode}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                Threat
                <select
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(e.target.value)}
                  className="bg-black/60 border border-white/30 px-2 py-1 text-[11px]"
                >
                  <option value="normal">Normal</option>
                  <option value="elevated">Elevated</option>
                  <option value="lockdown">Lockdown</option>
                </select>
              </label>
            </div>
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
                Passcodes and profile info are stored only on this device.
              </p>
            </form>
          </>
        ) : (
          <>
            <p className="text-[11px] opacity-70 mb-2">
              Unlock{" "}
              <span className="font-semibold">{activeProfile.label}</span> view.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
              <label className="flex items-center gap-2">
                Role
                <select
                  value={activeProfile.roleMode}
                  onChange={(e) =>
                    updateProfile(activeProfileId, { roleMode: e.target.value })
                  }
                  className="bg-black/60 border border-white/30 px-2 py-1 text-[11px]"
                >
                  {DEFAULT_PROFILES.map((p) => (
                    <option key={p.roleMode} value={p.roleMode}>
                      {p.roleMode}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                Threat
                <select
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(e.target.value)}
                  className="bg-black/60 border border-white/30 px-2 py-1 text-[11px]"
                >
                  <option value="normal">Normal</option>
                  <option value="elevated">Elevated</option>
                  <option value="lockdown">Lockdown</option>
                </select>
              </label>
            </div>
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
                className="w-full mt-2 border border-white/80 text-[11px] tracking-[0.18em] uppercase py-2 mb-2"
              >
                Unlock
              </button>

              {isWebAuthnAvailable && (
                <button
                  type="button"
                  onClick={handleBiometricUnlock}
                  className="w-full border border-white/60 text-[11px] tracking-[0.18em] uppercase py-2"
                >
                  {activeProfile.webAuthnId
                    ? "Unlock with Device (Face / Fingerprint)"
                    : "Enable Device Unlock"}
                </button>
              )}

              <p className="mt-2 text-[10px] opacity-60">
                Device unlock uses built-in browser/device authentication where
                available and is stored only on this device.
              </p>
            </form>
            <div className="mt-3 text-[11px] space-y-1">
              <p>
                Geo: {geoTag} (allowed: {allowedGeo})
              </p>
              <div className="flex gap-1">
                <input
                  value={geoTag}
                  onChange={(e) => setGeoTag(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/30 px-2 py-1"
                />
                <input
                  value={allowedGeo}
                  onChange={(e) => setAllowedGeo(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/30 px-2 py-1"
                />
              </div>
              <p>
                Access window: {windowStart} - {windowEnd}
              </p>
              <div className="flex gap-1">
                <input
                  type="time"
                  value={windowStart}
                  onChange={(e) => setWindowStart(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/30 px-2 py-1"
                />
                <input
                  type="time"
                  value={windowEnd}
                  onChange={(e) => setWindowEnd(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/30 px-2 py-1"
                />
              </div>
              {sessionRemaining !== null && (
                <p>Biometric session timer: {sessionRemaining}s</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
