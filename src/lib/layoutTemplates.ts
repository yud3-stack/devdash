import type {
  CardLayout,
  DashboardCardId,
  DashboardLayoutState,
  GridAxis,
  GridSize,
  LayoutTemplate,
  LayoutTemplateId,
} from "../types/dashboard";

export const gridLimits = {
  columns: { min: 2, max: 8 },
  rows: { min: 3, max: 10 },
} as const;

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

const templateIds = layoutTemplates.map((template) => template.id);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clampGridSize(grid: GridSize): GridSize {
  return {
    columns: clamp(grid.columns, gridLimits.columns.min, gridLimits.columns.max),
    rows: clamp(grid.rows, gridLimits.rows.min, gridLimits.rows.max),
  };
}

function card(
  id: DashboardCardId,
  colSpan: number,
  rowSpan: number,
  grid: GridSize,
  resizable = true,
): CardLayout {
  return {
    id,
    colSpan: clamp(colSpan, 1, grid.columns),
    rowSpan: clamp(rowSpan, 1, grid.rows),
    resizable,
  };
}

export function isLayoutTemplateId(
  templateId: string,
): templateId is LayoutTemplateId {
  return templateIds.includes(templateId as LayoutTemplateId);
}

export function createLayoutFromTemplate(
  templateId: LayoutTemplateId,
  requestedGrid = layoutTemplates.find((template) => template.id === templateId)
    ?.grid ?? defaultGridSize,
): DashboardLayoutState {
  const grid = clampGridSize(requestedGrid);
  const topBandRows = clamp(2, 1, grid.rows - 1);

  if (templateId === "compact") {
    const profileRows = topBandRows;

    return {
      cards: [
        card("profile", 1, profileRows, grid, false),
        card("githubActivity", grid.columns - 1, grid.rows, grid),
        card("projects", 1, grid.rows - profileRows, grid),
      ],
      grid,
      layoutTemplateId: templateId,
    };
  }

  if (templateId === "wide") {
    return {
      cards: [
        card("profile", 1, topBandRows, grid, false),
        card("githubActivity", grid.columns - 1, topBandRows, grid),
        card("projects", grid.columns, grid.rows - topBandRows, grid),
      ],
      grid,
      layoutTemplateId: templateId,
    };
  }

  return {
    cards: [
      card("profile", 1, topBandRows, grid, false),
      card("projects", grid.columns - 1, topBandRows, grid),
      card("githubActivity", grid.columns, grid.rows - topBandRows, grid),
    ],
    grid,
    layoutTemplateId: "balanced",
  };
}

export const defaultDashboardLayout = createLayoutFromTemplate(
  "balanced",
  defaultGridSize,
);

function getCardArea(cardLayout: CardLayout) {
  return cardLayout.colSpan * cardLayout.rowSpan;
}

function fitSpanToArea(
  targetArea: number,
  grid: GridSize,
  previous: CardLayout,
): Pick<CardLayout, "colSpan" | "rowSpan"> {
  let best = {
    colSpan: 1,
    rowSpan: 1,
    score: Number.POSITIVE_INFINITY,
  };

  for (let colSpan = 1; colSpan <= grid.columns; colSpan += 1) {
    for (let rowSpan = 1; rowSpan <= grid.rows; rowSpan += 1) {
      const area = colSpan * rowSpan;
      if (area > targetArea) {
        continue;
      }

      const areaScore = Math.abs(targetArea - area) * 100;
      const movementScore =
        Math.abs(previous.colSpan - colSpan) +
        Math.abs(previous.rowSpan - rowSpan);
      const score = areaScore + movementScore;

      if (score < best.score) {
        best = { colSpan, rowSpan, score };
      }
    }
  }

  return {
    colSpan: best.colSpan,
    rowSpan: best.rowSpan,
  };
}

export function resizeCardLayout(
  layout: DashboardLayoutState,
  cardId: DashboardCardId,
  axis: GridAxis,
  delta: number,
): DashboardLayoutState {
  const targetCard = layout.cards.find((cardLayout) => cardLayout.id === cardId);

  if (!targetCard?.resizable) {
    return layout;
  }

  const capacity = layout.grid.columns * layout.grid.rows;
  const fixedArea = layout.cards
    .filter((cardLayout) => !cardLayout.resizable)
    .reduce((total, cardLayout) => total + getCardArea(cardLayout), 0);
  const minimumOtherArea = Math.max(
    1,
    layout.cards.filter(
      (cardLayout) => cardLayout.resizable && cardLayout.id !== cardId,
    ).length,
  );

  const resized: CardLayout = {
    ...targetCard,
    colSpan:
      axis === "columns"
        ? clamp(targetCard.colSpan + delta, 1, layout.grid.columns)
        : targetCard.colSpan,
    rowSpan:
      axis === "rows"
        ? clamp(targetCard.rowSpan + delta, 1, layout.grid.rows)
        : targetCard.rowSpan,
  };

  const maxTargetArea = capacity - fixedArea - minimumOtherArea;
  const fittedTarget =
    getCardArea(resized) > maxTargetArea
      ? { ...resized, ...fitSpanToArea(maxTargetArea, layout.grid, resized) }
      : resized;

  const targetArea = getCardArea(fittedTarget);
  const remainingResizableArea = Math.max(1, capacity - fixedArea - targetArea);
  const otherResizableCards = layout.cards.filter(
    (cardLayout) => cardLayout.resizable && cardLayout.id !== cardId,
  );

  return {
    ...layout,
    cards: layout.cards.map((cardLayout) => {
      if (cardLayout.id === cardId) {
        return fittedTarget;
      }

      if (cardLayout.resizable && otherResizableCards.length === 1) {
        return {
          ...cardLayout,
          ...fitSpanToArea(remainingResizableArea, layout.grid, cardLayout),
        };
      }

      return cardLayout;
    }),
  };
}

export function validateDashboardLayout(
  value: unknown,
): DashboardLayoutState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<DashboardLayoutState>;

  if (
    !candidate.grid ||
    typeof candidate.grid.columns !== "number" ||
    typeof candidate.grid.rows !== "number" ||
    !candidate.layoutTemplateId ||
    !isLayoutTemplateId(candidate.layoutTemplateId) ||
    !Array.isArray(candidate.cards)
  ) {
    return null;
  }

  const grid = clampGridSize(candidate.grid);
  const cards = candidate.cards
    .map((cardLayout) => {
      if (
        !cardLayout ||
        typeof cardLayout !== "object" ||
        !("id" in cardLayout) ||
        typeof cardLayout.id !== "string" ||
        !["profile", "githubActivity", "projects"].includes(cardLayout.id)
      ) {
        return null;
      }

      return card(
        cardLayout.id as DashboardCardId,
        Number(cardLayout.colSpan) || 1,
        Number(cardLayout.rowSpan) || 1,
        grid,
        cardLayout.id !== "profile",
      );
    })
    .filter((cardLayout): cardLayout is CardLayout => Boolean(cardLayout));

  const hasEveryCard = ["profile", "githubActivity", "projects"].every(
    (cardId) => cards.some((cardLayout) => cardLayout.id === cardId),
  );

  if (!hasEveryCard) {
    return null;
  }

  return {
    cards,
    grid,
    layoutTemplateId: candidate.layoutTemplateId,
  };
}
