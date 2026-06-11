import type { CSSProperties, ReactNode } from "react";
import { Columns3, Minus, Plus, Rows3 } from "lucide-react";
import type { CardLayout, GridAxis } from "../../types/dashboard";

type CardShellProps = {
  children: ReactNode;
  className?: string;
  layout: CardLayout;
  onResize?: (axis: GridAxis, delta: number) => void;
};

export function CardShell({
  children,
  className = "",
  layout,
  onResize,
}: CardShellProps) {
  const cardStyle: CSSProperties = {
    gridColumn: `span ${layout.colSpan} / span ${layout.colSpan}`,
    gridRow: `span ${layout.rowSpan} / span ${layout.rowSpan}`,
  };
  const showResizeControls = layout.resizable && onResize;

  return (
    <article
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${
        showResizeControls ? "pb-16" : ""
      } ${className}`}
      style={cardStyle}
      data-card-id={layout.id}
    >
      <div className="min-h-0 flex-1">{children}</div>
      {showResizeControls ? (
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full border border-gray-100 bg-white p-1 text-gray-400 shadow-sm"
          aria-label="Resize card"
        >
          <ResizeButton
            label="Decrease columns"
            onClick={() => onResize("columns", -1)}
          >
            <Minus size={13} />
          </ResizeButton>
          <Columns3 size={14} aria-hidden="true" />
          <ResizeButton
            label="Increase columns"
            onClick={() => onResize("columns", 1)}
          >
            <Plus size={13} />
          </ResizeButton>
          <span className="mx-1 h-4 w-px bg-gray-100" />
          <ResizeButton
            label="Decrease rows"
            onClick={() => onResize("rows", -1)}
          >
            <Minus size={13} />
          </ResizeButton>
          <Rows3 size={14} aria-hidden="true" />
          <ResizeButton
            label="Increase rows"
            onClick={() => onResize("rows", 1)}
          >
            <Plus size={13} />
          </ResizeButton>
        </div>
      ) : null}
    </article>
  );
}

type ResizeButtonProps = {
  children: ReactNode;
  label: string;
  onClick: () => void;
};

function ResizeButton({ children, label, onClick }: ResizeButtonProps) {
  return (
    <button
      className="grid h-6 w-6 place-items-center rounded-full transition hover:bg-accent-50 hover:text-accent-700"
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
