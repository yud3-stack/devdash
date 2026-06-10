import {
  AtSign,
  Columns3,
  FolderGit2,
  GitGraph,
  Minus,
  Plus,
  RotateCcw,
  Rows3,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { LayoutTemplateSelector } from "./LayoutTemplateSelector";
import { gridLimits } from "../../lib/layoutTemplates";
import type {
  DashboardLayoutState,
  EditorCommand,
  GridSize,
  LayoutTemplateId,
  ProjectFolder,
} from "../../types/dashboard";

type SettingsPanelProps = {
  editorCommand: EditorCommand;
  githubToken: string;
  layout: DashboardLayoutState;
  onAddProjectFolder: (projectPath: string) => void;
  onEditorCommandChange: (editorCommand: EditorCommand) => void;
  onGitHubTokenChange: (token: string) => void;
  onClose: () => void;
  onGridChange: (grid: GridSize) => void;
  onRemoveProjectFolder: (projectId: string) => void;
  onResetLayout: () => void;
  onTemplateSelect: (templateId: LayoutTemplateId) => void;
  onXBearerTokenChange: (token: string) => void;
  open: boolean;
  projectFolders: ProjectFolder[];
  xBearerToken: string;
};

const editorOptions: { label: string; value: EditorCommand }[] = [
  { label: "code", value: "code" },
  { label: "cursor", value: "cursor" },
  { label: "windsurf", value: "windsurf" },
];

export function SettingsPanel({
  editorCommand,
  githubToken,
  layout,
  onAddProjectFolder,
  onClose,
  onEditorCommandChange,
  onGridChange,
  onGitHubTokenChange,
  onRemoveProjectFolder,
  onResetLayout,
  onTemplateSelect,
  onXBearerTokenChange,
  open,
  projectFolders,
  xBearerToken,
}: SettingsPanelProps) {
  const [projectPath, setProjectPath] = useState("");

  if (!open) {
    return null;
  }

  function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPath = projectPath.trim();

    if (!normalizedPath) {
      return;
    }

    onAddProjectFolder(normalizedPath);
    setProjectPath("");
  }

  return (
    <div className="fixed inset-0 z-20 bg-gray-950/10">
      <aside className="absolute right-4 top-10 flex max-h-[calc(100vh-4rem)] w-[390px] flex-col gap-6 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-950">Settings</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-gray-100 text-gray-500 transition hover:border-accent-100 hover:text-accent-700"
            type="button"
            aria-label="Close settings"
            title="Close settings"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-accent-600">
            Layout Template
          </h3>
          <LayoutTemplateSelector
            selectedId={layout.layoutTemplateId}
            onSelect={onTemplateSelect}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-accent-600">
            Grid Size
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <GridStepper
              icon={<Columns3 size={16} />}
              label="Columns"
              max={gridLimits.columns.max}
              min={gridLimits.columns.min}
              value={layout.grid.columns}
              onChange={(columns) =>
                onGridChange({ ...layout.grid, columns })
              }
            />
            <GridStepper
              icon={<Rows3 size={16} />}
              label="Rows"
              max={gridLimits.rows.max}
              min={gridLimits.rows.min}
              value={layout.grid.rows}
              onChange={(rows) => onGridChange({ ...layout.grid, rows })}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-accent-600">
            Default Editor
          </h3>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-gray-100 bg-gray-50 p-1">
            {editorOptions.map((editorOption) => {
              const selected = editorOption.value === editorCommand;

              return (
                <button
                  className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition ${
                    selected
                      ? "bg-white text-accent-700 shadow-sm"
                      : "text-gray-500 hover:bg-white hover:text-gray-800"
                  }`}
                  key={editorOption.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onEditorCommandChange(editorOption.value)}
                >
                  <Terminal size={14} />
                  {editorOption.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-accent-600">
            Project Folders
          </h3>
          <form className="flex gap-2" onSubmit={handleProjectSubmit}>
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-gray-500 focus-within:border-accent-100 focus-within:bg-white">
              <FolderGit2 size={16} className="shrink-0" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
                type="text"
                aria-label="Project folder path"
                spellCheck={false}
                value={projectPath}
                placeholder="C:\\path\\to\\project"
                onChange={(event) => setProjectPath(event.currentTarget.value)}
              />
            </label>
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gray-100 text-gray-500 transition hover:border-accent-100 hover:bg-accent-50 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
              type="submit"
              aria-label="Add project folder"
              title="Add project folder"
              disabled={!projectPath.trim()}
            >
              <Plus size={16} />
            </button>
          </form>
          <div className="space-y-2">
            {projectFolders.length ? (
              projectFolders.map((project) => (
                <div
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                  key={project.id}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${project.color}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {project.name}
                    </p>
                    <p className="truncate text-xs font-medium text-gray-500">
                      {project.path}
                    </p>
                  </div>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 transition hover:border-rose-100 hover:text-rose-600"
                    type="button"
                    aria-label={`Remove ${project.name}`}
                    title={`Remove ${project.name}`}
                    onClick={() => onRemoveProjectFolder(project.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 px-3 py-3 text-sm font-medium text-gray-400">
                No project folders yet.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-accent-600">
            GitHub Token
          </h3>
          <label className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-gray-500 focus-within:border-accent-100 focus-within:bg-white">
            <GitGraph size={16} className="shrink-0" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
              type="password"
              aria-label="GitHub Token"
              autoComplete="off"
              spellCheck={false}
              value={githubToken}
              placeholder="ghp_..."
              onChange={(event) => onGitHubTokenChange(event.currentTarget.value)}
            />
          </label>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-accent-600">
            X Bearer Token
          </h3>
          <label className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-gray-500 focus-within:border-accent-100 focus-within:bg-white">
            <AtSign size={16} className="shrink-0" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
              type="password"
              aria-label="X Bearer Token"
              autoComplete="off"
              spellCheck={false}
              value={xBearerToken}
              placeholder="Bearer token"
              onChange={(event) =>
                onXBearerTokenChange(event.currentTarget.value)
              }
            />
          </label>
        </section>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-100 text-sm font-semibold text-gray-600 transition hover:border-accent-100 hover:bg-accent-50 hover:text-accent-700"
          type="button"
          onClick={onResetLayout}
        >
          <RotateCcw size={15} />
          Reset Layout
        </button>
      </aside>
    </div>
  );
}

type GridStepperProps = {
  icon: ReactNode;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
};

function GridStepper({
  icon,
  label,
  max,
  min,
  onChange,
  value,
}: GridStepperProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          className="grid h-8 w-8 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 transition hover:border-accent-100 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          title={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus size={14} />
        </button>
        <strong className="text-xl font-extrabold text-gray-950">{value}</strong>
        <button
          className="grid h-8 w-8 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 transition hover:border-accent-100 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          title={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
