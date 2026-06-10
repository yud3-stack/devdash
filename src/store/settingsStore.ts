import { defaultGridSize } from "../lib/layoutTemplates";
import type { AppSettings } from "../types/dashboard";

export const initialSettings: AppSettings = {
  editorCommand: "code",
  githubToken: "",
  grid: defaultGridSize,
  layoutTemplateId: "balanced",
  projectFolders: [],
  xBearerToken: "",
};
