import { useCallback, useEffect, useMemo, useState } from "react";
import { loadPreference, savePreference } from "../lib/preferenceStorage";

const pomodoroPreferenceKey = "pomodoro.state";
const focusDurationSeconds = 25 * 60;

type StoredPomodoroState = {
  activeTaskId: string;
  sessionCount: number;
};

function parsePomodoroState(value: string | null): StoredPomodoroState {
  if (!value) {
    return {
      activeTaskId: "",
      sessionCount: 0,
    };
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredPomodoroState>;

    return {
      activeTaskId:
        typeof parsed.activeTaskId === "string" ? parsed.activeTaskId : "",
      sessionCount:
        typeof parsed.sessionCount === "number" &&
        Number.isFinite(parsed.sessionCount)
          ? Math.max(0, Math.floor(parsed.sessionCount))
          : 0,
    };
  } catch {
    return {
      activeTaskId: "",
      sessionCount: 0,
    };
  }
}

function serializePomodoroState(state: StoredPomodoroState) {
  return JSON.stringify(state);
}

export function usePomodoroTimer() {
  const [activeTaskId, setActiveTaskId] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] =
    useState(focusDurationSeconds);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    loadPreference(pomodoroPreferenceKey).then((savedState) => {
      if (isMounted) {
        const parsedState = parsePomodoroState(savedState);
        setActiveTaskId(parsedState.activeTaskId);
        setSessionCount(parsedState.sessionCount);
        setHydrated(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      void savePreference(
        pomodoroPreferenceKey,
        serializePomodoroState({ activeTaskId, sessionCount }),
      );
    }
  }, [activeTaskId, hydrated, sessionCount]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          setIsRunning(false);
          setSessionCount((currentCount) => currentCount + 1);
          return focusDurationSeconds;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  const progress = useMemo(
    () => 1 - remainingSeconds / focusDurationSeconds,
    [remainingSeconds],
  );

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  const toggleRunning = useCallback(() => {
    setIsRunning((currentIsRunning) => !currentIsRunning);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setRemainingSeconds(focusDurationSeconds);
  }, []);

  return {
    activeTaskId,
    formattedTime,
    isRunning,
    progress,
    remainingSeconds,
    resetTimer,
    sessionCount,
    setActiveTaskId,
    toggleRunning,
  };
}
