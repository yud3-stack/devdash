export type LayoutTemplateId = "compact" | "balanced" | "wide";

export type GridSize = {
  columns: number;
  rows: number;
};

export type LayoutTemplate = {
  id: LayoutTemplateId;
  name: string;
  grid: GridSize;
};

export type AppSettings = {
  editorCommand: "code" | "cursor" | "windsurf" | string;
  githubToken: string;
  grid: GridSize;
  layoutTemplateId: LayoutTemplateId;
  projectFolders: string[];
  xBearerToken: string;
};
