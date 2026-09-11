import type { CSSProperties } from "react";

type ApertureGridProps = {
  /** number of cells — the sixteen places motif */
  count?: number;
  columns: number;
  cellWidth: number;
  rowHeight: number;
  gap: number;
  /** `glow` animates a gradient (hero), `fill` flips to solid volt (premise) */
  variant?: "glow" | "fill" | "static";
  className?: string;
  id?: string;
};

export function ApertureGrid({
  count = 16,
  columns,
  cellWidth,
  rowHeight,
  gap,
  variant = "glow",
  className = "",
  id,
}: ApertureGridProps) {
  const style: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, ${cellWidth}px)`,
    gridAutoRows: `${rowHeight}px`,
    gap: `${gap}px`,
  };

  return (
    <div id={id} className={`grid ${className}`} style={style} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aperture">
          {variant !== "static" && (
            <div
              className={variant === "glow" ? "aperture-glow" : "aperture-fill"}
            />
          )}
        </div>
      ))}
    </div>
  );
}
