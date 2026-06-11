import { useCallback, useEffect, useMemo, useState } from "react";
import { readRecentProjectCommits } from "../lib/projectCommits";
import type { ProjectCommit } from "../types/commits";
import type { ProjectFolder } from "../types/dashboard";

type CommitStatus = "idle" | "loading" | "ready" | "error";

export function useProjectCommits(projects: ProjectFolder[]) {
  const [commits, setCommits] = useState<ProjectCommit[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<CommitStatus>("idle");
  const projectPathKey = useMemo(
    () => projects.map((project) => project.path).join("|"),
    [projects],
  );

  const refresh = useCallback(() => {
    if (!projects.length) {
      setCommits([]);
      setError("");
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setError("");

    readRecentProjectCommits(projects)
      .then((recentCommits) => {
        setCommits(recentCommits);
        setStatus("ready");
      })
      .catch((caughtError) => {
        setCommits([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Commit history could not be loaded.",
        );
        setStatus("error");
      });
  }, [projects]);

  useEffect(() => {
    refresh();
  }, [projectPathKey, refresh]);

  return {
    commits,
    error,
    refresh,
    status,
  };
}
