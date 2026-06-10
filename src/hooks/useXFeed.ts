import { useCallback, useEffect, useState } from "react";
import {
  createEmptyXFeed,
  fetchXFeed,
  type XFeed,
} from "../lib/xFeed";

type XFeedStatus = "idle" | "loading" | "ready" | "error";

export function useXFeed(token: string) {
  const [error, setError] = useState("");
  const [feed, setFeed] = useState<XFeed>(createEmptyXFeed);
  const [refreshId, setRefreshId] = useState(0);
  const [status, setStatus] = useState<XFeedStatus>("idle");

  useEffect(() => {
    let isMounted = true;
    const sanitizedToken = token.trim();

    if (!sanitizedToken) {
      setError("");
      setFeed(createEmptyXFeed());
      setStatus("idle");
      return;
    }

    setError("");
    setStatus("loading");

    fetchXFeed(sanitizedToken)
      .then((nextFeed) => {
        if (isMounted) {
          setFeed(nextFeed);
          setStatus("ready");
        }
      })
      .catch((nextError: Error) => {
        if (isMounted) {
          setError(nextError.message);
          setFeed(createEmptyXFeed());
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
    error,
    feed,
    refresh,
    status,
  };
}
