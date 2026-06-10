import type { WeeklyTask } from "../types/tasks";
import { isTauriRuntime } from "./tauriRuntime";

const databaseUrl = "sqlite:devdash.db";
const localStorageKey = "devdash.tasks";

type TaskRow = {
  completed: number;
  created_at: string;
  date: string;
  id: string;
  title: string;
};

function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function parseLocalTasks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(localStorageKey) ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isWeeklyTask);
  } catch {
    return [];
  }
}

function saveLocalTasks(tasks: WeeklyTask[]) {
  localStorage.setItem(localStorageKey, JSON.stringify(tasks));
}

function isWeeklyTask(value: unknown): value is WeeklyTask {
  if (!value || typeof value !== "object") {
    return false;
  }

  const task = value as Partial<WeeklyTask>;

  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.date === "string" &&
    typeof task.createdAt === "string" &&
    typeof task.completed === "boolean"
  );
}

function mapTaskRow(row: TaskRow): WeeklyTask {
  return {
    id: row.id,
    completed: row.completed === 1,
    createdAt: row.created_at,
    date: row.date,
    title: row.title,
  };
}

async function loadTaskDatabase() {
  const { default: Database } = await import("@tauri-apps/plugin-sql");
  const db = await Database.load(databaseUrl);

  await db.execute(
    "CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, date TEXT NOT NULL, title TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)",
  );

  return db;
}

async function loadSqlTasksForWeek(startDate: string, endDate: string) {
  if (!isTauriRuntime()) {
    return null;
  }

  try {
    const db = await loadTaskDatabase();
    const rows = await db.select<TaskRow[]>(
      "SELECT id, date, title, completed, created_at FROM tasks WHERE date >= $1 AND date <= $2 ORDER BY date ASC, created_at ASC",
      [startDate, endDate],
    );

    return rows.map(mapTaskRow);
  } catch {
    return null;
  }
}

async function saveSqlTask(task: WeeklyTask) {
  if (!isTauriRuntime()) {
    return;
  }

  try {
    const db = await loadTaskDatabase();

    await db.execute(
      "INSERT INTO tasks (id, date, title, completed, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT(id) DO UPDATE SET date = excluded.date, title = excluded.title, completed = excluded.completed",
      [task.id, task.date, task.title, task.completed ? 1 : 0, task.createdAt],
    );
  } catch {
    // Browser previews and partially configured Tauri environments use localStorage.
  }
}

async function updateSqlTaskCompletion(taskId: string, completed: boolean) {
  if (!isTauriRuntime()) {
    return;
  }

  try {
    const db = await loadTaskDatabase();

    await db.execute("UPDATE tasks SET completed = $1 WHERE id = $2", [
      completed ? 1 : 0,
      taskId,
    ]);
  } catch {
    // Browser previews and partially configured Tauri environments use localStorage.
  }
}

export function createWeeklyTask(date: string, title: string): WeeklyTask {
  return {
    id: createTaskId(),
    completed: false,
    createdAt: new Date().toISOString(),
    date,
    title: title.trim(),
  };
}

export async function loadTasksForWeek(startDate: string, endDate: string) {
  const sqlTasks = await loadSqlTasksForWeek(startDate, endDate);

  if (sqlTasks) {
    return sqlTasks;
  }

  return parseLocalTasks().filter(
    (task) => task.date >= startDate && task.date <= endDate,
  );
}

export async function saveTask(task: WeeklyTask) {
  const localTasks = parseLocalTasks().filter(
    (currentTask) => currentTask.id !== task.id,
  );

  saveLocalTasks([...localTasks, task]);
  await saveSqlTask(task);
}

export async function updateTaskCompletion(
  taskId: string,
  completed: boolean,
) {
  saveLocalTasks(
    parseLocalTasks().map((task) =>
      task.id === taskId ? { ...task, completed } : task,
    ),
  );
  await updateSqlTaskCompletion(taskId, completed);
}
