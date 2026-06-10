import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createWeeklyTask,
  loadTasksForWeek,
  saveTask,
  updateTaskCompletion,
} from "../lib/taskStorage";
import type { WeeklyTask } from "../types/tasks";

const dayFormatter = new Intl.DateTimeFormat("en", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
});

function startOfWeek(date: Date) {
  const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = nextDate.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  nextDate.setDate(nextDate.getDate() + difference);
  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function compareTasks(firstTask: WeeklyTask, secondTask: WeeklyTask) {
  return firstTask.createdAt.localeCompare(secondTask.createdAt);
}

export function useWeeklyTasks() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const dateKey = toDateKey(date);

        return {
          date,
          dateKey,
          dayLabel: dayFormatter.format(date),
          label: monthFormatter.format(date),
        };
      }),
    [weekStart],
  );

  const weekEnd = weekDays[6]?.dateKey ?? toDateKey(weekStart);
  const weekStartKey = weekDays[0]?.dateKey ?? toDateKey(weekStart);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    loadTasksForWeek(weekStartKey, weekEnd).then((loadedTasks) => {
      if (isMounted) {
        setTasks([...loadedTasks].sort(compareTasks));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [weekEnd, weekStartKey]);

  const tasksByDate = useMemo(
    () =>
      tasks.reduce<Record<string, WeeklyTask[]>>((groupedTasks, task) => {
        const existingTasks = groupedTasks[task.date] ?? [];

        return {
          ...groupedTasks,
          [task.date]: [...existingTasks, task].sort(compareTasks),
        };
      }, {}),
    [tasks],
  );

  const addTask = useCallback(
    async (title: string) => {
      const trimmedTitle = title.trim();

      if (!trimmedTitle) {
        return;
      }

      const task = createWeeklyTask(selectedDate, trimmedTitle);
      setTasks((currentTasks) => [...currentTasks, task].sort(compareTasks));
      await saveTask(task);
    },
    [selectedDate],
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((currentTask) => currentTask.id === taskId);

      if (!task) {
        return;
      }

      const nextCompleted = !task.completed;

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) => {
          if (currentTask.id !== taskId) {
            return currentTask;
          }

          return {
            ...currentTask,
            completed: nextCompleted,
          };
        }),
      );

      await updateTaskCompletion(taskId, nextCompleted);
    },
    [tasks],
  );

  const shiftWeek = useCallback(
    (days: number) => {
      const nextWeekStart = addDays(weekStart, days);

      setWeekStart(nextWeekStart);
      setSelectedDate(toDateKey(nextWeekStart));
    },
    [weekStart],
  );

  const resetToCurrentWeek = useCallback(() => {
    const today = new Date();
    setWeekStart(startOfWeek(today));
    setSelectedDate(toDateKey(today));
  }, []);

  const selectedTasks = tasksByDate[selectedDate] ?? [];
  const completedCount = tasks.filter((task) => task.completed).length;

  return {
    addTask,
    completedCount,
    loading,
    resetToCurrentWeek,
    selectedDate,
    selectedTasks,
    setSelectedDate,
    shiftWeek,
    tasks,
    tasksByDate,
    toggleTask,
    weekDays,
  };
}
