// lib/osState.js

export function collectOsState() {
  if (typeof window === "undefined") return null;

  const readJson = (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`Failed to parse localStorage key "${key}"`, err);
      return fallback;
    }
  };

  return {
    version: "v0.1",
    exportedAt: new Date().toISOString(),
    today_focus_by_day: readJson("today_focus_by_day", {}),
    today_obligations_by_day: readJson("today_obligations_by_day", {}),
    creative_sessions_by_day: readJson("creative_sessions_by_day", {}),
    money_ledger_by_day: readJson("money_ledger_by_day", {}),
    health_energy_by_day: readJson("health_energy_by_day", {}),
    money_snapshot: readJson("money_snapshot", null),
    scratchpad: readJson("scratchpad", ""),
  };
}

export function restoreOsState(snapshot) {
  if (typeof window === "undefined" || !snapshot || typeof snapshot !== "object") {
    return;
  }

  const writeJson = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to write localStorage key "${key}"`, err);
    }
  };

  if ("today_focus_by_day" in snapshot) {
    writeJson("today_focus_by_day", snapshot.today_focus_by_day);
  }
  if ("today_obligations_by_day" in snapshot) {
    writeJson("today_obligations_by_day", snapshot.today_obligations_by_day);
  }
  if ("creative_sessions_by_day" in snapshot) {
    writeJson("creative_sessions_by_day", snapshot.creative_sessions_by_day);
  }
  if ("money_ledger_by_day" in snapshot) {
    writeJson("money_ledger_by_day", snapshot.money_ledger_by_day);
  }
  if ("health_energy_by_day" in snapshot) {
    writeJson("health_energy_by_day", snapshot.health_energy_by_day);
  }
  if ("money_snapshot" in snapshot) {
    writeJson("money_snapshot", snapshot.money_snapshot);
  }
  if ("scratchpad" in snapshot) {
    writeJson("scratchpad", snapshot.scratchpad);
  }
}
