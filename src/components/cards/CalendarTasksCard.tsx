import { useState, type FormEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  LoaderCircle,
  Plus,
} from "lucide-react";
import { CardShell } from "./CardShell";
import { useWeeklyTasks } from "../../hooks/useWeeklyTasks";
import type { CardLayout, GridAxis } from "../../types/dashboard";

type CalendarTasksCardProps = {
  layout: CardLayout;
  onResize: (axis: GridAxis, delta: number) => void;
};

export function CalendarTasksCard({
  layout,
  onResize,
}: CalendarTasksCardProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const {
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
  } = useWeeklyTasks();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!taskTitle.trim()) {
      return;
    }

    void addTask(taskTitle);
    setTaskTitle("");
  }

  return (
    <CardShell layout={layout} onResize={onResize}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-accent-600">
              Calendar
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-gray-950">
              Tasks
            </h2>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-700">
            {loading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <CalendarDays size={18} />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <WeekButton label="Previous week" onClick={() => shiftWeek(-7)}>
              <ChevronLeft size={15} />
            </WeekButton>
            <WeekButton label="Next week" onClick={() => shiftWeek(7)}>
              <ChevronRight size={15} />
            </WeekButton>
          </div>
          <button
            className="h-8 rounded-full border border-gray-100 px-3 text-xs font-bold text-gray-500 transition hover:border-accent-100 hover:bg-accent-50 hover:text-accent-700"
            type="button"
            onClick={resetToCurrentWeek}
          >
            Today
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const dayTasks = tasksByDate[day.dateKey] ?? [];
            const selected = day.dateKey === selectedDate;
            const completedTasks = dayTasks.filter((task) => task.completed);

            return (
              <button
                className={`min-w-0 rounded-xl border px-1.5 py-2 text-left transition ${
                  selected
                    ? "border-accent-200 bg-accent-50 text-accent-800"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-accent-100 hover:bg-white"
                }`}
                key={day.dateKey}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedDate(day.dateKey)}
              >
                <span className="block truncate text-[11px] font-extrabold uppercase">
                  {day.dayLabel}
                </span>
                <span className="mt-1 block truncate text-xs font-semibold">
                  {day.label}
                </span>
                <span className="mt-2 flex h-1.5 gap-1">
                  {dayTasks.length ? (
                    <>
                      <span className="h-1.5 flex-1 rounded-full bg-accent-500" />
                      <span className="h-1.5 flex-1 rounded-full bg-gray-200">
                        <span
                          className="block h-full rounded-full bg-accent-300"
                          style={{
                            width: `${Math.round(
                              (completedTasks.length / dayTasks.length) * 100,
                            )}%`,
                          }}
                        />
                      </span>
                    </>
                  ) : (
                    <span className="h-1.5 w-full rounded-full bg-gray-200" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
          <input
            className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-50 px-3 text-sm font-medium text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-accent-100 focus:bg-white"
            type="text"
            aria-label="New task"
            value={taskTitle}
            placeholder="New task"
            onChange={(event) => setTaskTitle(event.currentTarget.value)}
          />
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gray-100 text-gray-500 transition hover:border-accent-100 hover:bg-accent-50 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
            type="submit"
            aria-label="Add task"
            title="Add task"
            disabled={!taskTitle.trim()}
          >
            <Plus size={16} />
          </button>
        </form>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          {selectedTasks.length ? (
            <ul className="space-y-2">
              {selectedTasks.map((task) => (
                <li key={task.id}>
                  <button
                    className="task-row grid w-full grid-cols-[auto_1fr] items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-left transition hover:border-accent-100 hover:bg-white"
                    type="button"
                    aria-label={`Toggle ${task.title}`}
                    aria-pressed={task.completed}
                    onClick={() => void toggleTask(task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle2
                        size={17}
                        className="text-accent-600"
                      />
                    ) : (
                      <Circle size={17} className="text-gray-300" />
                    )}
                    <span
                      className={`min-w-0 truncate text-sm font-semibold ${
                        task.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid h-full min-h-20 place-items-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center text-sm font-semibold text-gray-400">
              No tasks for this day.
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-500">
          <span>{tasks.length} this week</span>
          <span className="text-accent-700">
            {completedCount}/{tasks.length || 0} done
          </span>
        </div>
      </div>
    </CardShell>
  );
}

type WeekButtonProps = {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
};

function WeekButton({ children, label, onClick }: WeekButtonProps) {
  return (
    <button
      className="grid h-8 w-8 place-items-center rounded-full border border-gray-100 text-gray-500 transition hover:border-accent-100 hover:bg-accent-50 hover:text-accent-700"
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
