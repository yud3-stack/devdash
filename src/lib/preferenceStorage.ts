const databaseUrl = "sqlite:devdash.db";
const localStoragePrefix = "devdash.preference.";

type PreferenceRow = {
  value: string;
};

function getLocalStorageKey(key: string) {
  return `${localStoragePrefix}${key}`;
}

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function loadSqlPreference(key: string) {
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
      [key],
    );

    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

async function saveSqlPreference(key: string, value: string) {
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
      [key, value],
    );
  } catch {
    // Browser previews and partially configured Tauri environments use localStorage.
  }
}

export async function loadPreference(key: string) {
  const sqlValue = await loadSqlPreference(key);

  if (sqlValue !== null) {
    return sqlValue;
  }

  return localStorage.getItem(getLocalStorageKey(key));
}

export async function savePreference(key: string, value: string) {
  localStorage.setItem(getLocalStorageKey(key), value);
  await saveSqlPreference(key, value);
}
