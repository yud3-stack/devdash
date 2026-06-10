import {
  AlertCircle,
  GitCommitHorizontal,
  GitGraph,
  RefreshCw,
} from "lucide-react";
import { CardShell } from "./CardShell";
import { useGitHubActivity } from "../../hooks/useGitHubActivity";
import type { CardLayout, GridAxis } from "../../types/dashboard";

const levelClassNames = [
  "bg-gray-100",
  "bg-[#dcecc9]",
  "bg-[#bedb9e]",
  "bg-[#8dbd55]",
  "bg-accent-500",
];

type GitHubActivityCardProps = {
  githubToken: string;
  layout: CardLayout;
  onResize: (axis: GridAxis, delta: number) => void;
};

export function GitHubActivityCard({
  githubToken,
  layout,
  onResize,
}: GitHubActivityCardProps) {
  const { activity, error, refresh, status } = useGitHubActivity(githubToken);
  const hasToken = Boolean(githubToken.trim());
  const isLoading = status === "loading";

  return (
    <CardShell layout={layout} onResize={onResize}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-accent-600">
              GitHub
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">
              Activity
            </h2>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-700 transition hover:border-accent-100 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            aria-label="Refresh GitHub activity"
            title="Refresh GitHub activity"
            disabled={!hasToken || isLoading}
            onClick={refresh}
          >
            {isLoading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <GitGraph size={18} />
            )}
          </button>
        </div>

        <div className="mt-5 grid grid-flow-col grid-rows-7 gap-1 self-start overflow-hidden">
          {activity.contributions.map((day) => (
            <span
              className={`contribution-cell rounded-[3px] ${
                levelClassNames[day.level]
              }`}
              key={day.date}
              title={`${day.date}: ${day.count} commits`}
            />
          ))}
        </div>

        <div className="mt-5 grid min-h-0 grid-cols-[auto_1fr] gap-x-4 gap-y-3">
          <div>
            <p className="text-2xl font-extrabold text-gray-950">
              {activity.streak}
            </p>
            <p className="text-xs font-semibold text-gray-500">day streak</p>
            <p className="mt-2 text-xs font-semibold text-gray-400">
              {activity.totalCommits} commits
            </p>
          </div>
          <div className="min-w-0">
            {status === "error" ? (
              <StatusMessage icon={<AlertCircle size={14} />} text={error} />
            ) : null}
            {!hasToken ? (
              <StatusMessage icon={<AlertCircle size={14} />} text="GitHub token required" />
            ) : null}
            {hasToken && status !== "error" && activity.recentCommits.length === 0 ? (
              <StatusMessage
                icon={<GitCommitHorizontal size={14} />}
                text={isLoading ? "Loading commits" : "No recent commits"}
              />
            ) : null}
            <ul className="space-y-2">
              {activity.recentCommits.map((commit) => (
                <li
                  className="flex min-w-0 items-center gap-2 text-sm font-medium text-gray-600"
                  key={commit.url}
                  title={`${commit.repository} - ${commit.message}`}
                >
                  <GitCommitHorizontal size={14} className="shrink-0 text-accent-600" />
                  <span className="min-w-0 truncate">
                    <span className="font-semibold text-gray-800">
                      {commit.repository.split("/").pop()}
                    </span>
                    <span className="text-gray-400"> / </span>
                    {commit.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

type StatusMessageProps = {
  icon: React.ReactNode;
  text: string;
};

function StatusMessage({ icon, text }: StatusMessageProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-500">
      <span className="shrink-0 text-accent-600">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}
