import { useCallback, useEffect, useMemo, useState } from "react";
import { readProjectBranch } from "../lib/projectShell";
import { loadPreference, savePreference } from "../lib/preferenceStorage";
import type { EditorCommand, ProjectFolder } from "../types/dashboard";

const projectSettingsPreferenceKey = "projects.settings";
const defaultEditorCommand: EditorCommand = "code";

const projectColors = [
  "bg-accent-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
];

type StoredProjectSettings = {
  editorCommand: EditorCommand;
  projectFolders: ProjectFolder[];
};

const defaultProjectSettings: StoredProjectSettings = {
  editorCommand: defaultEditorCommand,
  projectFolders: [],
};

function isEditorCommand(value: unknown): value is EditorCommand {
  return value === "code" || value === "cursor" || value === "windsurf";
}

function normalizeProjectPath(projectPath: string) {
  return projectPath.trim().replace(/^["']+|["']+$/g, "");
}

function getProjectName(projectPath: string) {
  const parts = projectPath.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? projectPath;
}

function createProjectFolder(projectPath: string, index: number): ProjectFolder {
  const normalizedPath = normalizeProjectPath(projectPath);

  return {
    id: normalizedPath.toLowerCase(),
    branch: "main",
    color: projectColors[index % projectColors.length],
    name: getProjectName(normalizedPath),
    path: normalizedPath,
  };
}

function parseProjectFolder(value: unknown, index: number) {
  if (typeof value === "string") {
    const normalizedPath = normalizeProjectPath(value);
    return normalizedPath ? createProjectFolder(normalizedPath, index) : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const folder = value as Partial<ProjectFolder>;
  const normalizedPath =
    typeof folder.path === "string" ? normalizeProjectPath(folder.path) : "";

  if (!normalizedPath) {
    return null;
  }

  return {
    id:
      typeof folder.id === "string" && folder.id.trim()
        ? folder.id
        : normalizedPath.toLowerCase(),
    branch:
      typeof folder.branch === "string" && folder.branch.trim()
        ? folder.branch.trim()
        : "main",
    color:
      typeof folder.color === "string" && folder.color.trim()
        ? folder.color
        : projectColors[index % projectColors.length],
    name:
      typeof folder.name === "string" && folder.name.trim()
        ? folder.name
        : getProjectName(normalizedPath),
    path: normalizedPath,
  };
}

function parseProjectSettings(value: string | null): StoredProjectSettings {
  if (!value) {
    return defaultProjectSettings;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredProjectSettings>;
    const projectFolders = Array.isArray(parsed.projectFolders)
      ? parsed.projectFolders
          .map((projectFolder, index) =>
            parseProjectFolder(projectFolder, index),
          )
          .filter((projectFolder): projectFolder is ProjectFolder =>
            Boolean(projectFolder),
          )
      : [];

    return {
      editorCommand: isEditorCommand(parsed.editorCommand)
        ? parsed.editorCommand
        : defaultEditorCommand,
      projectFolders,
    };
  } catch {
    return defaultProjectSettings;
  }
}

function serializeProjectSettings(settings: StoredProjectSettings) {
  return JSON.stringify(settings);
}

export function useProjectSettings() {
  const [settings, setSettings] = useState<StoredProjectSettings>(
    defaultProjectSettings,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadPreference(projectSettingsPreferenceKey).then((savedSettings) => {
      if (isMounted) {
        setSettings(parseProjectSettings(savedSettings));
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
        projectSettingsPreferenceKey,
        serializeProjectSettings(settings),
      );
    }
  }, [hydrated, settings]);

  const projectPathKey = useMemo(
    () => settings.projectFolders.map((project) => project.path).join("|"),
    [settings.projectFolders],
  );

  useEffect(() => {
    if (!hydrated || !settings.projectFolders.length) {
      return;
    }

    let isMounted = true;

    Promise.all(
      settings.projectFolders.map(async (project) => ({
        ...project,
        branch: await readProjectBranch(project.path, project.branch),
      })),
    ).then((projectFolders) => {
      if (!isMounted) {
        return;
      }

      setSettings((currentSettings) => {
        const hasBranchChanges = projectFolders.some(
          (project, index) =>
            project.branch !== currentSettings.projectFolders[index]?.branch,
        );

        return hasBranchChanges
          ? { ...currentSettings, projectFolders }
          : currentSettings;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [hydrated, projectPathKey, settings.projectFolders]);

  const setEditorCommand = useCallback((editorCommand: EditorCommand) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      editorCommand,
    }));
  }, []);

  const addProjectFolder = useCallback((projectPath: string) => {
    const normalizedPath = normalizeProjectPath(projectPath);

    if (!normalizedPath) {
      return;
    }

    setSettings((currentSettings) => {
      if (
        currentSettings.projectFolders.some(
          (project) =>
            project.path.toLowerCase() === normalizedPath.toLowerCase(),
        )
      ) {
        return currentSettings;
      }

      return {
        ...currentSettings,
        projectFolders: [
          ...currentSettings.projectFolders,
          createProjectFolder(normalizedPath, currentSettings.projectFolders.length),
        ],
      };
    });
  }, []);

  const removeProjectFolder = useCallback((projectId: string) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      projectFolders: currentSettings.projectFolders.filter(
        (project) => project.id !== projectId,
      ),
    }));
  }, []);

  return {
    addProjectFolder,
    editorCommand: settings.editorCommand,
    hydrated,
    projectFolders: settings.projectFolders,
    removeProjectFolder,
    setEditorCommand,
  };
}
