import {
  AlertCircle,
  FolderGit2,
  GitCommitHorizontal,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { CardShell } from "./CardShell";
import { useProjectCommits } from "../../hooks/useProjectCommits";
import type { ProjectCommit } from "../../types/commits";
import type {
  CardLayout,
  GridAxis,
  ProjectFolder,
} from "../../types/dashboard";

type CommitHistoryCardProps = {
  layout: CardLayout;
  onResize: (axis: GridAxis, delta: number) => void;
  projects: ProjectFolder[];
};

export function CommitHistoryCard({
  layout,
  onResize,
  projects,
}: CommitHistoryCardProps) {
  const { commits, error, refresh, status } = useProjectCommits(projects);
  const hasProjects = projects.length > 0;
  const isLoading = status === "loading";

  return (
    <CardShell layout={layout} onResize={onResize}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-accent-600">
              Commits
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-gray-950">
              Recent
            </h2>
          </div>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-700 transition hover:border-accent-100 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            aria-label="Refresh commits"
            title="Refresh commits"
            disabled={!hasProjects || isLoading}
            onClick={refresh}
          >
            {isLoading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Metric label="projects" value={projects.length} />
          <Metric label="commits" value={commits.length} />
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          {status === "error" ? (
            <StatusMessage icon={<AlertCircle size={15} />} text={error} />
          ) : null}

          {!hasProjects ? (
            <StatusMessage
              icon={<FolderGit2 size={15} />}
              text="Add project folders in settings."
            />
          ) : null}

          {hasProjects && status !== "error" && !commits.length ? (
            <StatusMessage
              icon={<GitCommitHorizontal size={15} />}
              text={isLoading ? "Loading commits" : "No commits found."}
            />
          ) : null}

          {commits.length ? (
            <ul className="space-y-2">
              {commits.map((commit) => (
                <li key={`${commit.projectId}-${commit.hash}`}>
                  <CommitRow commit={commit} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </CardShell>
  );
}

type MetricProps = {
  label: string;
  value: number;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-lg font-extrabold text-gray-950">{value}</p>
      <p className="text-[11px] font-bold uppercase text-gray-400">{label}</p>
    </div>
  );
}

type CommitRowProps = {
  commit: ProjectCommit;
};

function CommitRow({ commit }: CommitRowProps) {
  return (
    <div
      className="grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
      title={`${commit.projectName} - ${commit.message}`}
    >
      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${commit.projectColor}`} />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-bold text-gray-900">
            {commit.message}
          </span>
        </div>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-gray-500">
          <GitCommitHorizontal size={12} className="shrink-0 text-accent-600" />
          <span className="truncate">{commit.projectName}</span>
          <span className="text-gray-300">/</span>
          <span className="font-mono text-gray-600">{commit.shortHash}</span>
          <span className="text-gray-300">/</span>
          <span className="truncate">{commit.relativeDate}</span>
        </p>
        <p className="mt-1 truncate text-[11px] font-semibold text-gray-400">
          {commit.authorName}
        </p>
      </div>
    </div>
  );
}

type StatusMessageProps = {
  icon: React.ReactNode;
  text: string;
};

function StatusMessage({ icon, text }: StatusMessageProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-400">
      <span className="shrink-0 text-accent-600">{icon}</span>
      <span className="min-w-0 truncate">{text}</span>
    </div>
  );
}
