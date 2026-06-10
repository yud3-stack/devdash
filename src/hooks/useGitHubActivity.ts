import { useCallback, useEffect, useState } from "react";
import {
  createEmptyGitHubActivity,
  fetchGitHubActivity,
  type GitHubActivity,
} from "../lib/githubActivity";

type GitHubActivityStatus = "idle" | "loading" | "ready" | "error";

export function useGitHubActivity(token: string) {
  const [activity, setActivity] = useState<GitHubActivity>(
    createEmptyGitHubActivity,
  );
  const [error, setError] = useState("");
  const [refreshId, setRefreshId] = useState(0);
  const [status, setStatus] = useState<GitHubActivityStatus>("idle");

  useEffect(() => {
    let isMounted = true;
    const sanitizedToken = token.trim();

    if (!sanitizedToken) {
      setActivity(createEmptyGitHubActivity());
      setError("");
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setError("");

    fetchGitHubActivity(sanitizedToken)
      .then((nextActivity) => {
        if (isMounted) {
          setActivity(nextActivity);
          setStatus("ready");
        }
      })
      .catch((nextError: Error) => {
        if (isMounted) {
          setActivity(createEmptyGitHubActivity());
          setError(nextError.message);
          setStatus("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshId, token]);

  const refresh = useCallback(() => {
    setRefreshId((current) => current + 1);
  }, []);

  return {
    activity,
    error,
    refresh,
    status,
  };
}
