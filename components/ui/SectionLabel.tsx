import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
};

/** The mono index marks that head every section ("02 — the premise"). */
export function SectionLabel({
  children,
  tone = "light",
  className = "",
}: SectionLabelProps) {
  const color = tone === "light" ? "text-chalk/42" : "text-ink/42";
  return <div className={`lbl ${color} ${className}`}>{children}</div>;
}
