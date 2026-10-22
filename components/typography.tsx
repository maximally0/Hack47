import React from "react";
import { cn } from "@/lib/utils";

export const TypographyH1 = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h1 className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}>
    {children}
  </h1>
);

export const TypographyH2 = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", className)}>
    {children}
  </h2>
);

export const TypographyP = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
    {children}
  </p>
);

export const TypographyBlockquote = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>
    {children}
  </blockquote>
);

export const TypographyInlineCode = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)}>
    {children}
  </code>
);
