import { useState } from "react";
import {
  ExternalLink,
  FolderGit2,
  GitBranch,
  LoaderCircle,
} from "lucide-react";
import { CardShell } from "./CardShell";
import { openProjectInEditor } from "../../lib/projectShell";
import type {
  CardLayout,
  EditorCommand,
  GridAxis,
  ProjectFolder,
} from "../../types/dashboard";

type ProjectsCardProps = {
  editorCommand: EditorCommand;
  layout: CardLayout;
  onResize: (axis: GridAxis, delta: number) => void;
  projects: ProjectFolder[];
};

export function ProjectsCard({
  editorCommand,
  layout,
  onResize,
  projects,
}: ProjectsCardProps) {
  const [feedback, setFeedback] = useState("");
  const [openingProjectId, setOpeningProjectId] = useState<string | null>(null);

  async function handleOpenProject(project: ProjectFolder) {
    setFeedback("");
    setOpeningProjectId(project.id);

    try {
      await openProjectInEditor(editorCommand, project.path);
      setFeedback(`${project.name} opened in ${editorCommand}.`);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Project could not be opened.",
      );
    } finally {
      setOpeningProjectId(null);
    }
  }

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

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {projects.length ? (
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
              data-project-count={projects.length}
            >
              {projects.map((project) => {
                const isOpening = openingProjectId === project.id;

                return (
                  <div
                    className="project-row grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                    key={project.id}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${project.color}`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {project.name}
                      </p>
                      <p className="mt-0.5 inline-flex max-w-full items-center gap-1 text-xs font-medium text-gray-500">
                        <GitBranch size={12} className="shrink-0" />
                        <span className="truncate">
                          {project.branch || "main"}
                        </span>
                      </p>
                    </div>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm transition hover:border-accent-100 hover:text-accent-600 disabled:cursor-wait disabled:opacity-60"
                      type="button"
                      aria-label={`Open ${project.name}`}
                      title={`Open ${project.name}`}
                      disabled={isOpening}
                      onClick={() => void handleOpenProject(project)}
                    >
                      {isOpening ? (
                        <LoaderCircle size={14} className="animate-spin" />
                      ) : (
                        <ExternalLink size={14} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid h-full min-h-28 place-items-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center text-sm font-semibold text-gray-400">
              Add a project folder in settings.
            </div>
          )}
        </div>
        {feedback ? (
          <p className="mt-3 truncate text-xs font-semibold text-gray-500">
            {feedback}
          </p>
        ) : null}
      </div>
    </CardShell>
  );
}
