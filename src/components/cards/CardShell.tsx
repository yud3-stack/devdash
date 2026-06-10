import type { CSSProperties, ReactNode } from "react";
import { Grip } from "lucide-react";

type CardShellProps = {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  resizable?: boolean;
};

export function CardShell({
  children,
  className = "",
  colSpan = 1,
  rowSpan = 1,
  resizable = true,
}: CardShellProps) {
  const cardStyle: CSSProperties = {
    gridColumn: `span ${colSpan} / span ${colSpan}`,
    gridRow: `span ${rowSpan} / span ${rowSpan}`,
  };

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}
      style={cardStyle}
    >
      {children}
      {resizable ? (
        <button
          className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full border border-gray-100 bg-white text-gray-400 shadow-sm transition hover:border-accent-100 hover:text-accent-600"
          type="button"
          aria-label="Resize card"
        >
          <Grip size={15} strokeWidth={2.1} />
        </button>
      ) : null}
    </article>
  );
}
