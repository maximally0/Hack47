"use client";

import { ArrowLink, UnderlineLink } from "@/components/ui/ArrowLink";
import { revealFrom, useGsapScope } from "@/hooks/useGsapScope";
import { gsap } from "@/lib/gsap";
import {
  FOOTER_COLUMNS,
  LEGAL_LINKS,
  SITE,
  TEAM,
} from "@/lib/content";

export function SiteFooter() {
  const scopeRef = useGsapScope<HTMLElement>((scope) => {
    const grid = scope.querySelector("#footer-grid");
    if (grid) {
      gsap.to("#footer-grid .footer-mark", {
        scrollTrigger: { trigger: grid, start: "top 92%", once: true },
        backgroundColor: "#285AF7",
        duration: 0.4,
        stagger: { amount: 0.8, from: "random" },
        ease: "none",
      });
    }

    const team = scope.querySelector("#team-grid");
    if (team) {
      revealFrom(scope.querySelectorAll("#team-grid .team-member"), {
        trigger: team,
        start: "top 92%",
        from: { y: 14, opacity: 0, duration: 0.5, stagger: 0.07 },
      });
    }

    gsap.to("#footer-dot", {
      opacity: 0.25,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  return (
    <footer ref={scopeRef} className="bg-coal safe-bottom safe-x">
      {/* status strip */}
      <div className="lbl flex flex-wrap items-center justify-between gap-4 bg-volt px-6 py-4 text-chalk sm:px-8">
        <div className="flex items-center gap-3">
          <span
            id="footer-dot"
            className="inline-block h-[7px] w-[7px] rounded-full bg-chalk"
            aria-hidden
          />
          applications open · {SITE.cohort}
        </div>
        <div className="text-chalk/80">
          {SITE.window} · {SITE.days} days · delhi
        </div>
        <div className="tnum">{SITE.places} places</div>
      </div>

      <div className="px-6 pt-16 sm:px-8 sm:pt-20">
        <div className="grid items-start gap-12 border-b border-line pb-16 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div>
            <div className="lbl mb-6 text-chalk/38">still deciding</div>
            <h3
              className="max-w-[620px] font-medium"
              style={{
                fontSize: "clamp(28px,3.4vw,48px)",
                lineHeight: 1.02,
                letterSpacing: "-.03em",
              }}
            >
              the room fills once. after that it is a waitlist.
            </h3>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <ArrowLink href="#apply" className="px-7 py-4">
                apply for a place
              </ArrowLink>
              <UnderlineLink
                href={`mailto:${SITE.email}`}
                className="-my-3 inline-flex min-h-[44px] items-center py-3 text-chalk/70 sm:my-0 sm:min-h-0 sm:py-0"
              >
                or just email us
              </UnderlineLink>
            </div>
          </div>

          <div className="flex lg:justify-end">
            <div>
              <div
                id="footer-grid"
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(4, 16px)",
                  gridAutoRows: "34px",
                  gap: "6px",
                }}
                aria-hidden
              >
                {Array.from({ length: SITE.places }, (_, i) => (
                  <div key={i} className="footer-mark" />
                ))}
              </div>
              <div className="lbl mt-4 text-chalk/30">sixteen lights</div>
            </div>
          </div>
        </div>

        {/* team */}
        <div id="team" className="scroll-mt-20 border-b border-line py-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="lbl text-chalk/38">the team behind this</div>
            <div className="lbl text-chalk/28">delhi, india</div>
          </div>
          <div
            id="team-grid"
            className="grid grid-cols-1 gap-8 sm:grid-cols-2"
          >
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="team-member flex items-center gap-4"
              >
                {member.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={member.avatar}
                    alt={`${member.name} — ${member.remit} at hack47`}
                    className="team-image h-[52px] w-[52px] shrink-0 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center bg-chalk/10 text-[15px] font-medium text-chalk/70">
                    {member.initials}
                  </div>
                )}
                <div>
                  <div
                    className="text-[15px] font-medium"
                    style={{ letterSpacing: "-.01em" }}
                  >
                    {member.name}
                  </div>
                  <div className="lbl mt-1.5 text-chalk/42">{member.remit}</div>
                  <div className="mt-2 flex gap-3">
                    {member.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lbl -my-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center py-3 text-chalk/45 transition-colors hover:text-volt sm:my-0 sm:min-h-0 sm:min-w-0 sm:justify-start sm:py-0"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <UnderlineLink href={`mailto:${SITE.email}`} className="-my-3 inline-flex min-h-[44px] items-center py-3 text-volt sm:my-0 sm:min-h-0 sm:py-0">
              work on hack47 with us
            </UnderlineLink>
          </div>
        </div>

        {/* sitemap */}
        <div className="grid gap-10 py-16 md:grid-cols-4">
          <div>
            <div className="mb-4 text-[19px] font-semibold tracking-tight">
              {SITE.wordmark}
            </div>
            <p className="max-w-[230px] text-[13px] leading-[1.6] text-chalk/50">
              A thirty-day builder residency in a Delhi villa, and the first step
              toward a permanent founder campus.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <div className="lbl mb-5 text-chalk/38">{column.title}</div>
              <ul className="list-none space-y-2.5 p-0 text-sm">
                {column.links.map((link) => {
                  const external = link.href.startsWith("http");
                  return (
                    <li key={`${column.title}-${link.label}`}>
                      <a
                        href={link.href}
                        className="footer-link -my-2 inline-flex min-h-[44px] items-center py-2 sm:my-0 sm:min-h-0 sm:py-0"
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
              {column.title === "elsewhere" && (
                <div className="lbl mt-6 text-chalk/30">delhi, india</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* oversized wordmark */}
      <div className="overflow-hidden border-t border-line px-6 sm:px-8">
        <div
          className="pb-1.5 pt-[26px] font-semibold select-none sm:pb-0"
          style={{
            fontSize: "clamp(76px,20.5vw,300px)",
            lineHeight: 0.86,
            letterSpacing: "-.05em",
            color: "transparent",
            WebkitTextStroke: "1px rgba(242,239,232,.2)",
          }}
          aria-hidden
        >
          {SITE.wordmark}
        </div>
      </div>

      <div className="lbl flex flex-wrap justify-between gap-4 border-t border-line px-6 py-8 text-chalk/34 sm:px-8">
        <div className="-my-3 inline-flex min-h-[44px] items-center py-3 sm:my-0 sm:min-h-0 sm:py-0">
          © 2026 hack47 · built in delhi
        </div>
        <div className="flex flex-wrap gap-6">
          {LEGAL_LINKS.map((link) => {
            const external = link.href.startsWith("http");
            return (
              <a
                key={link.label}
                href={link.href}
                className="-my-3 inline-flex min-h-[44px] items-center py-3 text-inherit no-underline transition-colors hover:text-chalk sm:my-0 sm:min-h-0 sm:py-0"
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
