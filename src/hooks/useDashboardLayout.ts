import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clampGridSize,
  createLayoutFromTemplate,
  defaultDashboardLayout,
  resizeCardLayout,
} from "../lib/layoutTemplates";
import {
  loadDashboardLayout,
  saveDashboardLayout,
} from "../lib/layoutStorage";
import type {
  DashboardCardId,
  DashboardLayoutState,
  GridAxis,
  GridSize,
  LayoutTemplateId,
} from "../types/dashboard";

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayoutState>(
    defaultDashboardLayout,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadDashboardLayout().then((savedLayout) => {
      if (isMounted) {
        setLayout(savedLayout);
        setHydrated(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      void saveDashboardLayout(layout);
    }
  }, [hydrated, layout]);

  const cardLayouts = useMemo(
    () =>
      Object.fromEntries(
        layout.cards.map((cardLayout) => [cardLayout.id, cardLayout]),
      ) as Record<DashboardCardId, DashboardLayoutState["cards"][number]>,
    [layout.cards],
  );

  const selectTemplate = useCallback((templateId: LayoutTemplateId) => {
    setLayout(createLayoutFromTemplate(templateId));
  }, []);

  const updateGridSize = useCallback((gridSize: GridSize) => {
    setLayout((currentLayout) =>
      createLayoutFromTemplate(
        currentLayout.layoutTemplateId,
        clampGridSize(gridSize),
      ),
    );
  }, []);

  const resizeCard = useCallback(
    (cardId: DashboardCardId, axis: GridAxis, delta: number) => {
      setLayout((currentLayout) =>
        resizeCardLayout(currentLayout, cardId, axis, delta),
      );
    },
    [],
  );

  const resetLayout = useCallback(() => {
    setLayout((currentLayout) =>
      createLayoutFromTemplate(
        currentLayout.layoutTemplateId,
        currentLayout.grid,
      ),
    );
  }, []);

  return {
    cardLayouts,
    hydrated,
    layout,
    resetLayout,
    resizeCard,
    selectTemplate,
    updateGridSize,
  };
}
