// lib/sync.js

import { collectOsState } from "./osState";

export async function syncStateToCloud() {
  if (typeof window === "undefined") {
    return { ok: false, reason: "server-environment" };
  }

  const endpoint =
    process.env.NEXT_PUBLIC_TROUPE_OS_SYNC_ENDPOINT ||
    process.env.NEXT_PUBLIC_TROUPE_OS_SYNC_URL;

  if (!endpoint) {
    console.warn("No cloud sync endpoint configured.");
    return { ok: false, reason: "no-endpoint" };
  }

  const state = collectOsState();
  if (!state) {
    return { ok: false, reason: "no-state" };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });

    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error("Cloud sync failed", err);
    return { ok: false, reason: "network-error" };
  }
}
