import type { ReactNode } from "react";

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "volt" | "ink" | "chalk";
  glyph?: "→" | "↗";
  className?: string;
};

const VARIANT_CLASS: Record<NonNullable<ArrowLinkProps["variant"]>, string> = {
  volt: "btn-volt",
  ink: "btn-ink",
  chalk: "btn-chalk",
};

/** Links that leave the site open in a new tab with safe rel attributes. */
function externalProps(href: string) {
  return href.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

export function ArrowLink({
  href,
  children,
  variant = "volt",
  glyph = "→",
  className = "",
}: ArrowLinkProps) {
  return (
    <a
      href={href}
      {...externalProps(href)}
      className={`${VARIANT_CLASS[variant]} lbl ${className}`}
    >
      {children}
      <span className="arrow ml-2" aria-hidden>
        {glyph}
      </span>
    </a>
  );
}

type UnderlineLinkProps = {
  href: string;
  children: ReactNode;
  glyph?: "→" | "↗" | null;
  className?: string;
};

export function UnderlineLink({
  href,
  children,
  glyph = null,
  className = "",
}: UnderlineLinkProps) {
  return (
    <a
      href={href}
      {...externalProps(href)}
      className={`link-underline lbl ${className}`}
    >
      {children}
      {glyph && (
        <span className="arrow ml-1" aria-hidden>
          {glyph}
        </span>
      )}
    </a>
  );
}
