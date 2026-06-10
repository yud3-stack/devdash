import type { CSSProperties, ReactNode } from "react";

type BentoGridProps = {
  children: ReactNode;
  columns: number;
  rows: number;
};

export function BentoGrid({ children, columns, rows }: BentoGridProps) {
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    gridAutoFlow: "dense",
  };

  return (
    <section
      className="grid h-[calc(100vh-2rem)] min-h-0 gap-4 px-6 pb-6 pt-2"
      style={gridStyle}
      data-grid-size={`${columns}x${rows}`}
    >
      {children}
    </section>
  );
}
