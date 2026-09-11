"use client";

import { Fragment } from "react";
import { ArrowUpRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { revealFrom, useGsapScope } from "@/hooks/useGsapScope";
import { PARTNERS, PARTNER_MODES } from "@/lib/content";

// Split the 24 marks into three rows of eight. Each row is a self-contained
// marquee: the eight cells are rendered twice (the second copy aria-hidden) so
// a -50% translate loops seamlessly. Row speed + direction alternate so the
// three tracks never read as one moving block.
const ROWS = [
  PARTNERS.slice(0, 8),
  PARTNERS.slice(8, 16),
  PARTNERS.slice(16, 24),
];

export function Partners() {
  const scopeRef = useGsapScope<HTMLElement>((scope) => {
    const wall = scope.querySelector("#logo-wall");
    if (!wall) return;
    // Only the vertical offset is animated — the cells keep their CSS resting
    // opacity (0.5, brightening on hover) so they can never be stranded blank.
    // The reveal targets the row viewports, not individual cells, because the
    // cells scroll horizontally under the marquee animation.
    revealFrom(scope.querySelectorAll("#logo-wall .marquee-row-viewport"), {
      trigger: wall,
      start: "top 84%",
      from: { y: 14, duration: 0.5, stagger: 0.06 },
    });
  });

  return (
    <section
      ref={scopeRef}
      id="partners"
      className="bg-coal px-6 py-20 sm:px-8 lg:py-32"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-8">
        <h2
          className="max-w-[680px] font-medium"
          style={{
            fontSize: "clamp(32px,4.2vw,58px)",
            lineHeight: 0.98,
            letterSpacing: "-.03em",
          }}
        >
          working with the people building it
          <span className="text-volt">.</span>
        </h2>
        <SectionLabel>03 — partners &amp; support</SectionLabel>
      </div>

      <p className="mb-14 max-w-[560px] text-[15px] leading-[1.6] text-chalk/50">
        Credits, compute, tooling and first-cheque conversations for the sixteen.
        The stack the house runs on.
      </p>

      {/* Three sliding rows. Because there are too many partners for a static
          grid, each row loops horizontally so every mark comes into view.
          Motion is pure CSS (@keyframes + translate3d); it pauses on hover and
          is fully stopped under prefers-reduced-motion, where the rows fall
          back to a static, non-animated horizontally-scrollable strip. */}
      <div id="logo-wall" className="marquee-wall">
        {ROWS.map((row, i) => (
          <div
            key={i}
            className="marquee-row-viewport"
            data-row={i}
          >
            <div className="marquee-row" data-dir={i % 2 === 0 ? "ltr" : "rtl"}>
              {row.map((partner) => (
                <div key={partner.name} className="logo-cell">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={partner.logo} alt="" aria-hidden loading="lazy" />
                  <span>{partner.name}</span>
                </div>
              ))}
              {/* Seamless-loop duplicate — hidden from the accessibility tree so
                  a screen reader announces each partner once, not twice. */}
              {row.map((partner) => (
                <div key={`dup-${partner.name}`} className="logo-cell" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={partner.logo} alt="" aria-hidden loading="lazy" />
                  <span>{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rule my-16" />

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <h3
            className="mb-5 font-medium"
            style={{
              fontSize: "clamp(26px,2.6vw,36px)",
              letterSpacing: "-.025em",
            }}
          >
            Looking to partner?
          </h3>
          <p className="max-w-[760px] text-[18px] leading-[1.55] text-chalk/72">
            Hack47 puts sixteen of India&rsquo;s sharpest builders in one Delhi
            house for thirty days. Partners show up as credits, compute, tooling,
            teaching time, or a first cheque — and get a month inside the work
            rather than a logo on a banner.
          </p>
          <div className="lbl mt-7 flex flex-wrap gap-x-8 gap-y-3 text-chalk/45">
            {PARTNER_MODES.map((mode, i) => (
              <Fragment key={mode}>
                {i > 0 && <span aria-hidden>·</span>}
                <span>{mode}</span>
              </Fragment>
            ))}
          </div>
          <a
            href="mailto:hello@hack47.org?subject=Partnering%20with%20hack47"
            className="btn-chalk lbl mt-9 gap-2 px-7 py-4"
          >
            partner with us
            <ArrowUpRight size={13} strokeWidth={2} aria-hidden />
          </a>
        </div>
        <p className="mono max-w-[250px] text-[12px] leading-[1.7] text-chalk/32">
          Marks shown are the tools the house builds on. Formal partnerships are
          listed by name once each one clears it.
        </p>
      </div>
    </section>
  );
}
