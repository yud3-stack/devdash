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
  rows: { min: 4, max: 10 },
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
const dashboardCardIds: DashboardCardId[] = [
  "profile",
  "githubActivity",
  "projects",
  "calendarTasks",
  "xFeed",
  "focusPomodoro",
  "snippets",
];

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
  const topBandRows = grid.rows >= 5 ? 2 : 1;
  const bottomBandRows = grid.rows - topBandRows;

  if (grid.columns === 2) {
    const remainingRows = grid.columns * grid.rows - 4;
    const snippetRows = Math.ceil(remainingRows / 3);
    const activityRows = Math.ceil((remainingRows - snippetRows) / 2);
    const taskRows = remainingRows - snippetRows - activityRows;

    return {
      cards: [
        card("profile", 1, 1, grid, false),
        card("focusPomodoro", 1, 1, grid),
        card("projects", 1, 1, grid),
        card("xFeed", 1, 1, grid),
        card("snippets", 1, snippetRows, grid),
        card("githubActivity", 1, activityRows, grid),
        card("calendarTasks", 1, taskRows, grid),
      ],
      grid,
      layoutTemplateId: templateId,
    };
  }

  if (grid.columns === 3) {
    const remainingRows = grid.columns * grid.rows - 3;
    const projectRows = Math.ceil(remainingRows / 4);
    const activityRows = Math.ceil((remainingRows - projectRows) / 3);
    const taskRows = Math.ceil(
      (remainingRows - projectRows - activityRows) / 2,
    );
    const snippetRows =
      remainingRows - projectRows - activityRows - taskRows;

    return {
      cards: [
        card("profile", 1, 1, grid, false),
        card("focusPomodoro", 1, 1, grid),
        card("xFeed", 1, 1, grid),
        card("projects", 1, projectRows, grid),
        card("githubActivity", 1, activityRows, grid),
        card("calendarTasks", 1, taskRows, grid),
        card("snippets", 1, snippetRows, grid),
      ],
      grid,
      layoutTemplateId: templateId,
    };
  }

  if (templateId === "compact") {
    const profileRows = topBandRows;

    return {
      cards: [
        card("profile", 1, profileRows, grid, false),
        card("focusPomodoro", 1, profileRows, grid),
        card("xFeed", grid.columns - 2, profileRows, grid),
        card("projects", 1, bottomBandRows, grid),
        card("githubActivity", 1, bottomBandRows, grid),
        card("calendarTasks", grid.columns - 3, bottomBandRows, grid),
        card("snippets", 1, bottomBandRows, grid),
      ],
      grid,
      layoutTemplateId: templateId,
    };
  }

  if (templateId === "wide") {
    const projectSpan = grid.columns >= 5 ? 2 : 1;
    const xFeedTopSpan = grid.columns - projectSpan - 2;
    const bottomActivitySpan = Math.ceil((grid.columns - 1) / 2);
    const bottomTaskSpan = grid.columns - 1 - bottomActivitySpan;

    return {
      cards: [
        card("profile", 1, topBandRows, grid, false),
        card("projects", projectSpan, topBandRows, grid),
        card("focusPomodoro", 1, topBandRows, grid),
        card("xFeed", xFeedTopSpan, topBandRows, grid),
        card("githubActivity", bottomActivitySpan, bottomBandRows, grid),
        card("calendarTasks", bottomTaskSpan, bottomBandRows, grid),
        card("snippets", 1, bottomBandRows, grid),
      ],
      grid,
      layoutTemplateId: templateId,
    };
  }

  const projectSpan = grid.columns >= 6 ? 2 : 1;
  const xFeedTopSpan = grid.columns - projectSpan - 2;
  const bottomActivitySpan = Math.ceil((grid.columns - 1) / 2);
  const bottomTaskSpan = grid.columns - 1 - bottomActivitySpan;

  return {
    cards: [
      card("profile", 1, topBandRows, grid, false),
      card("focusPomodoro", 1, topBandRows, grid),
      card("projects", projectSpan, topBandRows, grid),
      card("xFeed", xFeedTopSpan, topBandRows, grid),
      card("githubActivity", bottomActivitySpan, bottomBandRows, grid),
      card("calendarTasks", bottomTaskSpan, bottomBandRows, grid),
      card("snippets", 1, bottomBandRows, grid),
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
  const fittedOtherCards = new Map<DashboardCardId, CardLayout>();
  let remainingArea = remainingResizableArea;

  otherResizableCards.forEach((cardLayout, index) => {
    const remainingCardCount = otherResizableCards.length - index - 1;
    const maxCardArea = Math.max(1, remainingArea - remainingCardCount);
    const targetCardArea =
      remainingCardCount === 0
        ? remainingArea
        : Math.min(getCardArea(cardLayout), maxCardArea);
    const fittedCard = {
      ...cardLayout,
      ...fitSpanToArea(targetCardArea, layout.grid, cardLayout),
    };

    fittedOtherCards.set(cardLayout.id, fittedCard);
    remainingArea = Math.max(0, remainingArea - getCardArea(fittedCard));
  });

  return {
    ...layout,
    cards: layout.cards.map((cardLayout) => {
      if (cardLayout.id === cardId) {
        return fittedTarget;
      }

      if (cardLayout.resizable) {
        return fittedOtherCards.get(cardLayout.id) ?? cardLayout;
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
      if (!cardLayout || typeof cardLayout !== "object") {
        return null;
      }

      const id = "id" in cardLayout ? cardLayout.id : null;

      if (
        typeof id !== "string" ||
        !dashboardCardIds.includes(id as DashboardCardId)
      ) {
        return null;
      }

      return card(
        id as DashboardCardId,
        Number(cardLayout.colSpan) || 1,
        Number(cardLayout.rowSpan) || 1,
        grid,
        id !== "profile",
      );
    })
    .filter((cardLayout): cardLayout is CardLayout => Boolean(cardLayout));

  const hasEveryCard = dashboardCardIds.every(
    (cardId) => cards.some((cardLayout) => cardLayout.id === cardId),
  );
  const hasUniqueCards =
    new Set(cards.map((cardLayout) => cardLayout.id)).size ===
    dashboardCardIds.length;
  const capacity = grid.columns * grid.rows;
  const totalArea = cards.reduce(
    (sum, cardLayout) => sum + getCardArea(cardLayout),
    0,
  );

  if (!hasEveryCard || !hasUniqueCards || totalArea > capacity) {
    return null;
  }

  return {
    cards,
    grid,
    layoutTemplateId: candidate.layoutTemplateId,
  };
}
