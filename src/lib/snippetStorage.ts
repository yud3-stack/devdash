import type { Snippet } from "../types/snippets";
import { isTauriRuntime } from "./tauriRuntime";

const databaseUrl = "sqlite:devdash.db";
const localStorageKey = "devdash.snippets";

type SnippetRow = {
  code: string;
  copied_at: string | null;
  created_at: string;
  id: string;
  title: string;
};

function createSnippetId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isSnippet(value: unknown): value is Snippet {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snippet = value as Partial<Snippet>;

  return (
    typeof snippet.id === "string" &&
    typeof snippet.title === "string" &&
    typeof snippet.code === "string" &&
    typeof snippet.createdAt === "string" &&
    (snippet.copiedAt === undefined || typeof snippet.copiedAt === "string")
  );
}

function parseLocalSnippets() {
  try {
    const parsed = JSON.parse(localStorage.getItem(localStorageKey) ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSnippet);
  } catch {
    return [];
  }
}

function saveLocalSnippets(snippets: Snippet[]) {
  localStorage.setItem(localStorageKey, JSON.stringify(snippets));
}

function compareSnippets(firstSnippet: Snippet, secondSnippet: Snippet) {
  return secondSnippet.createdAt.localeCompare(firstSnippet.createdAt);
}

function mapSnippetRow(row: SnippetRow): Snippet {
  return {
    code: row.code,
    copiedAt: row.copied_at ?? undefined,
    createdAt: row.created_at,
    id: row.id,
    title: row.title,
  };
}

async function loadSnippetDatabase() {
  const { default: Database } = await import("@tauri-apps/plugin-sql");
  const db = await Database.load(databaseUrl);

  await db.execute(
    "CREATE TABLE IF NOT EXISTS snippets (id TEXT PRIMARY KEY, title TEXT NOT NULL, code TEXT NOT NULL, created_at TEXT NOT NULL, copied_at TEXT)",
  );

  return db;
}

async function loadSqlSnippets() {
  if (!isTauriRuntime()) {
    return null;
  }

  try {
    const db = await loadSnippetDatabase();
    const rows = await db.select<SnippetRow[]>(
      "SELECT id, title, code, created_at, copied_at FROM snippets ORDER BY created_at DESC",
    );

    return rows.map(mapSnippetRow);
  } catch {
    return null;
  }
}

async function saveSqlSnippet(snippet: Snippet) {
  if (!isTauriRuntime()) {
    return;
  }

  try {
    const db = await loadSnippetDatabase();

    await db.execute(
      "INSERT INTO snippets (id, title, code, created_at, copied_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT(id) DO UPDATE SET title = excluded.title, code = excluded.code, copied_at = excluded.copied_at",
      [
        snippet.id,
        snippet.title,
        snippet.code,
        snippet.createdAt,
        snippet.copiedAt ?? null,
      ],
    );
  } catch {
    // Browser previews and partially configured Tauri environments use localStorage.
  }
}

async function updateSqlSnippetCopy(snippetId: string, copiedAt: string) {
  if (!isTauriRuntime()) {
    return;
  }

  try {
    const db = await loadSnippetDatabase();

    await db.execute("UPDATE snippets SET copied_at = $1 WHERE id = $2", [
      copiedAt,
      snippetId,
    ]);
  } catch {
    // Browser previews and partially configured Tauri environments use localStorage.
  }
}

export function createSnippet(title: string, code: string): Snippet {
  return {
    code: code.trim(),
    createdAt: new Date().toISOString(),
    id: createSnippetId(),
    title: title.trim(),
  };
}

export async function loadSnippets() {
  const sqlSnippets = await loadSqlSnippets();

  if (sqlSnippets) {
    return sqlSnippets;
  }

  return parseLocalSnippets().sort(compareSnippets);
}

export async function saveSnippet(snippet: Snippet) {
  const localSnippets = parseLocalSnippets().filter(
    (currentSnippet) => currentSnippet.id !== snippet.id,
  );

  saveLocalSnippets([snippet, ...localSnippets].sort(compareSnippets));
  await saveSqlSnippet(snippet);
}

export async function markSnippetCopied(snippetId: string, copiedAt: string) {
  saveLocalSnippets(
    parseLocalSnippets().map((snippet) =>
      snippet.id === snippetId ? { ...snippet, copiedAt } : snippet,
    ),
  );
  await updateSqlSnippetCopy(snippetId, copiedAt);
}
