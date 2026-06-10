import { GitCommitHorizontal, GitGraph } from "lucide-react";
import { CardShell } from "./CardShell";
import type { CardLayout, GridAxis } from "../../types/dashboard";

const contributionLevels = [
  0, 1, 2, 1, 0, 3, 2, 0, 1, 4, 2, 1, 0, 2, 3, 4, 1, 0, 2, 2, 3, 0, 1, 2, 4,
  3, 0, 1, 2, 3, 2, 1, 0, 4, 3, 2, 1, 0, 1, 2, 3, 4, 2, 0, 1, 2, 1, 3, 4,
  0, 2, 3, 1, 0, 1, 4, 3, 2, 1, 0, 2, 3, 4, 1, 0, 2, 3, 1, 2, 0, 4, 3, 2,
  1, 0, 2, 3, 4, 2, 1, 0, 3, 2,
];

const levelClassNames = [
  "bg-gray-100",
  "bg-[#dcecc9]",
  "bg-[#bedb9e]",
  "bg-[#8dbd55]",
  "bg-accent-500",
];

const recentCommits = [
  "Initial dashboard shell",
  "Add local project model",
  "Sketch settings presets",
];

type GitHubActivityCardProps = {
  layout: CardLayout;
  onResize: (axis: GridAxis, delta: number) => void;
};

export function GitHubActivityCard({
  layout,
  onResize,
}: GitHubActivityCardProps) {
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
          <div className="grid h-10 w-10 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-700">
            <GitGraph size={18} />
          </div>
        </div>

        <div className="mt-5 grid grid-flow-col grid-rows-7 gap-1 self-start overflow-hidden">
          {contributionLevels.map((level, index) => (
            <span
              className={`contribution-cell rounded-[3px] ${levelClassNames[level]}`}
              key={`${level}-${index}`}
            />
          ))}
        </div>

        <div className="mt-5 grid min-h-0 grid-cols-[auto_1fr] gap-x-4 gap-y-3">
          <div>
            <p className="text-2xl font-extrabold text-gray-950">12</p>
            <p className="text-xs font-semibold text-gray-500">week streak</p>
          </div>
          <ul className="space-y-2">
            {recentCommits.map((commit) => (
              <li
                className="flex items-center gap-2 text-sm font-medium text-gray-600"
                key={commit}
              >
                <GitCommitHorizontal size={14} className="text-accent-600" />
                <span className="truncate">{commit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CardShell>
  );
}
