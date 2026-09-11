"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { NAV_LINKS, SITE } from "@/lib/content";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape-to-close, focus trap, and inert on the rest of the page while open.
  useEffect(() => {
    if (!open) return;

    const menu = menuRef.current;
    const body = document.body;

    // Mark every top-level child of <body> inert except the header, so the
    // page behind the overlay is neither focusable nor read by AT.
    const header = toggleRef.current?.closest("header");
    const siblings: HTMLElement[] = [];
    Array.from(body.children).forEach((child) => {
      if (child instanceof HTMLElement && child !== header) {
        siblings.push(child);
        child.setAttribute("inert", "");
        child.setAttribute("aria-hidden", "true");
      }
    });

    // Move focus into the menu.
    const focusables = () =>
      menu
        ? Array.from(
            menu.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];
    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      siblings.forEach((child) => {
        child.removeAttribute("inert");
        child.removeAttribute("aria-hidden");
      });
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 safe-top safe-x transition-colors duration-300 ${
        scrolled || open ? "bg-ink" : "bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-6 sm:px-8">
        <a
          href="#pilot"
          className="relative z-50 -mx-2 flex h-11 items-center px-2 text-[19px] font-semibold tracking-tight text-chalk no-underline"
          onClick={() => setOpen(false)}
        >
          {SITE.wordmark}
        </a>

        <nav
          aria-label="Sections"
          className="lbl hidden items-center gap-8 text-chalk/62 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-inherit no-underline transition-colors hover:text-chalk"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop / tablet apply CTA */}
          <ArrowLink
            href="#apply"
            className="hidden px-5 py-2.5 sm:inline-flex"
          >
            apply
          </ArrowLink>

          {/* Compact mobile apply CTA — the primary conversion path on a
              phone, where the CTA above is display:none. 44px tall. */}
          <ArrowLink
            href="#apply"
            className="inline-flex h-11 items-center px-4 sm:hidden"
          >
            apply
          </ArrowLink>

          {/* Mobile menu toggle */}
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-11 w-11 items-center justify-center text-chalk lg:hidden"
          >
            {open ? (
              <X size={22} strokeWidth={1.6} />
            ) : (
              <Menu size={22} strokeWidth={1.6} />
            )}
          </button>
        </div>
      </div>

      <div
        className={`rule transition-opacity duration-300 ${
          scrolled || open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Mobile overlay menu */}
      <div
        ref={menuRef}
        id="site-menu"
        className={`fixed inset-0 top-16 z-40 safe-bottom safe-x bg-ink transition-[opacity,transform] duration-300 lg:hidden ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav
          aria-label="Sections"
          className="flex h-full flex-col gap-1 overflow-y-auto px-6 py-8"
        >
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-baseline justify-between border-b border-line py-5 text-[28px] font-medium tracking-tight text-chalk no-underline"
              style={{ letterSpacing: "-.02em" }}
            >
              {link.label}
              <span className="lbl text-chalk/35">
                {`0${i + 1}`.slice(-2)}
              </span>
            </a>
          ))}
          <ArrowLink href="#apply" className="mt-8 justify-center py-4">
            apply for a place
          </ArrowLink>
          <div className="lbl mt-8 text-chalk/40">
            {SITE.window} · {SITE.days} days · delhi
          </div>
        </nav>
      </div>
    </header>
  );
}
