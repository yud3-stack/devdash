export type LayoutTemplateId = "compact" | "balanced" | "wide";

export type GridSize = {
  columns: number;
  rows: number;
};

export type DashboardCardId = "profile" | "githubActivity" | "projects";

export type GridAxis = "columns" | "rows";

export type EditorCommand = "code" | "cursor" | "windsurf";

export type ProjectFolder = {
  id: string;
  branch: string;
  color: string;
  name: string;
  path: string;
};

export type CardLayout = {
  id: DashboardCardId;
  colSpan: number;
  rowSpan: number;
  resizable: boolean;
};

export type LayoutTemplate = {
  id: LayoutTemplateId;
  name: string;
  grid: GridSize;
};

export type DashboardLayoutState = {
  cards: CardLayout[];
  grid: GridSize;
  layoutTemplateId: LayoutTemplateId;
};

export type AppSettings = {
  editorCommand: EditorCommand;
  githubToken: string;
  grid: GridSize;
  layout: DashboardLayoutState;
  layoutTemplateId: LayoutTemplateId;
  projectFolders: ProjectFolder[];
  xBearerToken: string;
};
