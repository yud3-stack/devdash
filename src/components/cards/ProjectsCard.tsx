import { ExternalLink, FolderGit2, GitBranch } from "lucide-react";
import { CardShell } from "./CardShell";
import type { CardLayout, GridAxis } from "../../types/dashboard";

const projects = [
  { name: "devdash", branch: "main", color: "bg-accent-500" },
  { name: "api-starter", branch: "feat/auth", color: "bg-sky-500" },
  { name: "design-kit", branch: "release", color: "bg-violet-500" },
];

type ProjectsCardProps = {
  layout: CardLayout;
  onResize: (axis: GridAxis, delta: number) => void;
};

export function ProjectsCard({ layout, onResize }: ProjectsCardProps) {
  return (
    <CardShell layout={layout} onResize={onResize}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-accent-600">
              Projects
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Workspaces</h2>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-700">
            <FolderGit2 size={18} />
          </div>
        </div>

        <div
          className="mt-4 grid min-h-0 gap-2 overflow-hidden"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          {projects.map((project) => (
            <div
              className="project-row grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
              key={project.name}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${project.color}`} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {project.name}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                  <GitBranch size={12} />
                  {project.branch}
                </p>
              </div>
              <button
                className="grid h-8 w-8 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm transition hover:border-accent-100 hover:text-accent-600"
                type="button"
                aria-label={`Open ${project.name}`}
              >
                <ExternalLink size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
