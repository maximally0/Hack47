"use client";

import { ApertureGrid } from "@/components/ui/ApertureGrid";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { revealFrom, useGsapScope } from "@/hooks/useGsapScope";
import { gsap } from "@/lib/gsap";

export function Premise() {
  const scopeRef = useGsapScope<HTMLElement>((scope) => {
    const grid = scope.querySelector(".premise-grid");
    if (grid) {
      gsap.to(".premise-grid .aperture-fill", {
        scrollTrigger: { trigger: grid, start: "top 80%", once: true },
        opacity: 1,
        duration: 0.45,
        stagger: 0.06,
        ease: "none",
      });
    }

    scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      revealFrom(el, {
        trigger: el,
        start: "top 86%",
        from: { y: 26, opacity: 0, duration: 0.85 },
      });
    });
  });

  return (
    <section ref={scopeRef} className="bg-coal px-6 py-20 sm:px-8 lg:py-36">
      <SectionLabel className="mb-16">02 — the premise</SectionLabel>

      <div className="grid items-start gap-14 lg:grid-cols-[auto_1fr] lg:gap-24">
        {/* Mobile: a single horizontal row of the sixteen-aperture motif so
            it reads as intentional identity, not a stranded vertical ladder. */}
        <ApertureGrid
          id="premise-grid"
          columns={16}
          cellWidth={14}
          rowHeight={22}
          gap={5}
          variant="fill"
          className="premise-grid shrink-0 sm:hidden"
        />
        {/* Desktop: unchanged 2-column vertical grid. */}
        <ApertureGrid
          columns={2}
          cellWidth={20}
          rowHeight={44}
          gap={7}
          variant="fill"
          className="premise-grid hidden shrink-0 sm:grid"
        />

        <div className="max-w-[720px]">
          <h2
            className="mb-10 text-[34px] font-medium lg:text-[58px]"
            style={{ lineHeight: 1.02, letterSpacing: "-.03em" }}
          >
            a room changes the pace of the work.
          </h2>
          <p
            data-reveal
            className="text-[19px] leading-[1.55] text-chalk/76"
          >
            The first Hack47 room is not a conference, a course, or a content
            calendar. It is thirty days in a Delhi villa with people who arrived
            to make the work more real. Build in the open. Ask better questions
            at dinner. Leave with something that exists.
          </p>
          <p
            data-reveal
            className="mt-7 text-[19px] leading-[1.55] text-chalk/50"
          >
            Not a lecture series. Not a demo-day factory. Pilot 01 stays small
            because proximity is the product.
          </p>
        </div>
      </div>
    </section>
  );
}
