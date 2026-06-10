import type { EditorCommand } from "../types/dashboard";
import { isTauriRuntime } from "./tauriRuntime";

const editorShellCommands: Record<EditorCommand, string> = {
  code: "open-code",
  cursor: "open-cursor",
  windsurf: "open-windsurf",
};

export async function openProjectInEditor(
  editorCommand: EditorCommand,
  projectPath: string,
) {
  if (!isTauriRuntime()) {
    throw new Error("Project opening is available in the desktop app.");
  }

  const { Command } = await import("@tauri-apps/plugin-shell");
  await Command.create(editorShellCommands[editorCommand], [projectPath]).spawn();
}

export async function readProjectBranch(projectPath: string, fallback: string) {
  if (!isTauriRuntime()) {
    return fallback;
  }

  try {
    const { Command } = await import("@tauri-apps/plugin-shell");
    const output = await Command.create("git-current-branch", [
      projectPath,
    ]).execute();

    if (output.code !== 0) {
      return fallback;
    }

    return output.stdout.trim() || fallback;
  } catch {
    return fallback;
  }
}
