import {
  Link2,
  Pause,
  Play,
  RotateCcw,
  Timer,
} from "lucide-react";
import { CardShell } from "./CardShell";
import { usePomodoroTimer } from "../../hooks/usePomodoroTimer";
import { useWeeklyTasks } from "../../hooks/useWeeklyTasks";
import type { CardLayout, GridAxis } from "../../types/dashboard";

const ringRadius = 48;
const ringCircumference = 2 * Math.PI * ringRadius;

type FocusPomodoroCardProps = {
  layout: CardLayout;
  onResize: (axis: GridAxis, delta: number) => void;
};

export function FocusPomodoroCard({
  layout,
  onResize,
}: FocusPomodoroCardProps) {
  const {
    activeTaskId,
    formattedTime,
    isRunning,
    progress,
    resetTimer,
    sessionCount,
    setActiveTaskId,
    toggleRunning,
  } = usePomodoroTimer();
  const { selectedTasks } = useWeeklyTasks();
  const taskOptions = selectedTasks.filter((task) => !task.completed);
  const activeTaskExists = taskOptions.some((task) => task.id === activeTaskId);
  const selectedTaskId = activeTaskExists ? activeTaskId : "";
  const ringOffset = ringCircumference * (1 - progress);

  return (
    <CardShell layout={layout} onResize={onResize}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-accent-600">
              Focus
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-gray-950">
              Pomodoro
            </h2>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-700">
            <Timer size={18} />
          </div>
        </div>

        <div className="mt-4 flex min-h-0 items-center gap-4">
          <div className="relative grid h-28 w-28 shrink-0 place-items-center">
            <svg
              className="-rotate-90"
              height="112"
              role="img"
              viewBox="0 0 112 112"
              width="112"
              aria-label={`Pomodoro timer ${formattedTime}`}
            >
              <circle
                cx="56"
                cy="56"
                fill="none"
                r={ringRadius}
                stroke="#eef2e9"
                strokeWidth="10"
              />
              <circle
                cx="56"
                cy="56"
                fill="none"
                r={ringRadius}
                stroke="#639922"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                strokeWidth="10"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-2xl font-extrabold text-gray-950">
                {formattedTime}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-xs font-bold uppercase text-gray-400">
                Sessions
              </p>
              <p className="mt-1 text-2xl font-extrabold text-gray-950">
                {sessionCount}
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-accent-600 px-3 text-sm font-bold text-white transition hover:bg-accent-700"
                type="button"
                onClick={toggleRunning}
              >
                {isRunning ? <Pause size={15} /> : <Play size={15} />}
                {isRunning ? "Pause" : "Start"}
              </button>
              <button
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-gray-100 text-gray-500 transition hover:border-accent-100 hover:bg-accent-50 hover:text-accent-700"
                type="button"
                aria-label="Reset pomodoro"
                title="Reset pomodoro"
                onClick={resetTimer}
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-gray-500 focus-within:border-accent-100 focus-within:bg-white">
          <Link2 size={15} className="shrink-0" />
          <select
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gray-700 outline-none"
            aria-label="Link active task"
            value={selectedTaskId}
            onChange={(event) => setActiveTaskId(event.currentTarget.value)}
          >
            <option value="">No linked task</option>
            {taskOptions.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </label>
      </div>
    </CardShell>
  );
}
