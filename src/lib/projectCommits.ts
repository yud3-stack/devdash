import type { ProjectCommit } from "../types/commits";
import type { ProjectFolder } from "../types/dashboard";
import { isTauriRuntime } from "./tauriRuntime";

const commitFieldSeparator = "\x1f";
const commitRecordSeparator = "\x1e";

type RawCommit = {
  authorName: string;
  hash: string;
  message: string;
  relativeDate: string;
  shortHash: string;
};

function parseCommitLog(stdout: string): RawCommit[] {
  return stdout
    .split(commitRecordSeparator)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, shortHash, authorName, relativeDate, ...messageParts] =
        record.split(commitFieldSeparator);

      return {
        authorName: authorName?.trim() || "Unknown",
        hash: hash?.trim() || shortHash?.trim() || "",
        message: messageParts.join(commitFieldSeparator).trim() || "No message",
        relativeDate: relativeDate?.trim() || "recently",
        shortHash: shortHash?.trim() || hash?.slice(0, 7) || "",
      };
    })
    .filter((commit) => commit.hash && commit.shortHash);
}

async function readProjectLog(project: ProjectFolder): Promise<ProjectCommit[]> {
  const { Command } = await import("@tauri-apps/plugin-shell");
  const output = await Command.create("git-recent-commits", [
    "-C",
    project.path,
    "log",
    "-n",
    "6",
    "--date=relative",
    "--pretty=format:%H%x1f%h%x1f%an%x1f%ar%x1f%s%x1e",
  ]).execute();

  if (output.code !== 0) {
    return [];
  }

  return parseCommitLog(output.stdout).map((commit) => ({
    ...commit,
    projectColor: project.color,
    projectId: project.id,
    projectName: project.name,
    projectPath: project.path,
  }));
}

export async function readRecentProjectCommits(projects: ProjectFolder[]) {
  if (!projects.length) {
    return [];
  }

  if (!isTauriRuntime()) {
    throw new Error("Commit history is available in the desktop app.");
  }

  const commitsByProject = await Promise.all(
    projects.map(async (project) => {
      try {
        return await readProjectLog(project);
      } catch {
        return [];
      }
    }),
  );

  return commitsByProject.flat();
}
