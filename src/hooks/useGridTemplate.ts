import { useMemo } from "react";
import { defaultGridSize } from "../lib/layoutTemplates";
import type { GridSize } from "../types/dashboard";

export function useGridTemplate(gridSize: GridSize = defaultGridSize) {
  return useMemo(
    () => ({
      columns: gridSize.columns,
      rows: gridSize.rows,
    }),
    [gridSize.columns, gridSize.rows],
  );
}
