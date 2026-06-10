import { useEffect, useState } from "react";
import { loadPreference, savePreference } from "../lib/preferenceStorage";

const xBearerTokenPreferenceKey = "x.bearerToken";

export function useXBearerToken() {
  const [hydrated, setHydrated] = useState(false);
  const [xBearerToken, setXBearerToken] = useState("");

  useEffect(() => {
    let isMounted = true;

    loadPreference(xBearerTokenPreferenceKey).then((savedToken) => {
      if (isMounted) {
        setXBearerToken(savedToken ?? "");
        setHydrated(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      void savePreference(xBearerTokenPreferenceKey, xBearerToken.trim());
    }
  }, [hydrated, xBearerToken]);

  return {
    setXBearerToken,
    xBearerToken,
  };
}
