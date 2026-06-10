import { useEffect, useState } from "react";
import { loadPreference, savePreference } from "../lib/preferenceStorage";

const githubTokenPreferenceKey = "github.token";

export function useGitHubToken() {
  const [githubToken, setGitHubToken] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadPreference(githubTokenPreferenceKey).then((savedToken) => {
      if (isMounted) {
        setGitHubToken(savedToken ?? "");
        setHydrated(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      void savePreference(githubTokenPreferenceKey, githubToken.trim());
    }
  }, [githubToken, hydrated]);

  return {
    githubToken,
    setGitHubToken,
  };
}
