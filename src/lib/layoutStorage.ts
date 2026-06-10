import {
  defaultDashboardLayout,
  validateDashboardLayout,
} from "./layoutTemplates";
import type { DashboardLayoutState } from "../types/dashboard";

const layoutStorageKey = "devdash.dashboardLayout";
const databaseUrl = "sqlite:devdash.db";
const preferenceKey = "dashboard.layout";

type PreferenceRow = {
  value: string;
};

function parseLayout(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return validateDashboardLayout(JSON.parse(value));
  } catch {
    return null;
  }
}

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function loadSqlLayout() {
  if (!isTauriRuntime()) {
    return null;
  }

  try {
    const { default: Database } = await import("@tauri-apps/plugin-sql");
    const db = await Database.load(databaseUrl);

    await db.execute(
      "CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
    );

    const rows = await db.select<PreferenceRow[]>(
      "SELECT value FROM preferences WHERE key = $1 LIMIT 1",
      [preferenceKey],
    );

    return parseLayout(rows[0]?.value ?? null);
  } catch {
    return null;
  }
}

async function saveSqlLayout(layout: DashboardLayoutState) {
  if (!isTauriRuntime()) {
    return;
  }

  try {
    const { default: Database } = await import("@tauri-apps/plugin-sql");
    const db = await Database.load(databaseUrl);

    await db.execute(
      "CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
    );
    await db.execute(
      "INSERT INTO preferences (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [preferenceKey, JSON.stringify(layout)],
    );
  } catch {
    // Browser previews and partially configured Tauri environments use localStorage.
  }
}

export async function loadDashboardLayout() {
  const sqlLayout = await loadSqlLayout();

  if (sqlLayout) {
    return sqlLayout;
  }

  return parseLayout(localStorage.getItem(layoutStorageKey)) ?? defaultDashboardLayout;
}

export async function saveDashboardLayout(layout: DashboardLayoutState) {
  localStorage.setItem(layoutStorageKey, JSON.stringify(layout));
  await saveSqlLayout(layout);
}
