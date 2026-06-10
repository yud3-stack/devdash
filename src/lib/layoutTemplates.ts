import type { GridSize, LayoutTemplate } from "../types/dashboard";

export const defaultGridSize: GridSize = {
  columns: 4,
  rows: 5,
};

export const layoutTemplates: LayoutTemplate[] = [
  {
    id: "compact",
    name: "Compact",
    grid: { columns: 3, rows: 4 },
  },
  {
    id: "balanced",
    name: "Balanced",
    grid: defaultGridSize,
  },
  {
    id: "wide",
    name: "Wide",
    grid: { columns: 6, rows: 5 },
  },
];
