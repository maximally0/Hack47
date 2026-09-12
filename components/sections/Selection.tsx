"use client";

import { SelectionFunnel } from "@/components/sections/SelectionFunnel";
import { UnderlineLink } from "@/components/ui/ArrowLink";
import { useGsapScope } from "@/hooks/useGsapScope";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SELECTION_STATS } from "@/lib/content";

export function Selection() {
  const scopeRef = useGsapScope<HTMLElement>((scope) => {
    const counter = scope.querySelector<HTMLElement>("[data-selection-count]");
    if (!counter) return;

    const state = { value: 40000 };
    ScrollTrigger.create({
      trigger: counter,
      start: "top 82%",
      once: true,
      onEnter: () => {
        gsap.to(state, {
          value: 16,
          duration: 2.4,
          ease: "expo.inOut",
          onUpdate: () => {
            counter.textContent = Math.round(state.value).toLocaleString(
              "en-US",
            );
          },
          onComplete: () => {
            counter.textContent = "16";
          },
        });
      },
    });
  });

  return (
    <section ref={scopeRef} id="selection" className="bg-volt text-chalk">
      <div className="grid lg:grid-cols-[1.62fr_1fr]">
        <div className="hidden flex-col px-6 py-16 sm:min-h-[700px] sm:px-8 sm:py-20 lg:flex lg:py-24">
          <div className="flex items-baseline justify-between gap-6">
            <div className="lbl text-chalk/70">01 — selection</div>
            <div className="lbl text-chalk/55">live intake · funnel</div>
          </div>

          <SelectionFunnel />

          <div className="flex flex-wrap items-end gap-x-14 gap-y-6">
            <div>
              <div className="lbl mb-3 text-chalk/70">applications narrow to</div>
              <div
                data-selection-count
                className="tnum font-semibold"
                style={{
                  fontSize: "clamp(72px,9.4vw,140px)",
                  lineHeight: 0.8,
                  letterSpacing: "-.05em",
                }}
              >
                40,000
              </div>
            </div>
            <p
              className="max-w-[330px] text-[19px] leading-[1.4] text-chalk/92"
              style={{ letterSpacing: "-.01em" }}
            >
              Sixteen places, and no way to widen the door. Proximity is the
              whole product.
            </p>
          </div>
        </div>

        <div className="bg-ink text-center text-chalk sm:text-left">
          {SELECTION_STATS.map((stat) => (
            <div key={stat.label} className="border-b border-line px-6 py-7 sm:px-8 sm:py-9">
              <div className="lbl mb-3 text-chalk/45">{stat.label}</div>
              <div
                className={`tnum text-center font-medium sm:text-right ${
                  stat.accent === "volt" ? "text-volt" : ""
                }`}
                style={{
                  fontSize: "clamp(46px,5vw,68px)",
                  lineHeight: 1,
                  letterSpacing: "-.03em",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <p className="mx-auto max-w-[340px] text-sm leading-[1.6] text-chalk/62 sm:mx-0">
              Outreach reached more than forty thousand builders across India.
              Sixteen of them will live and work in the Delhi house.
            </p>
            <UnderlineLink
              href="#apply"
              glyph="→"
              className="tap-link mt-6 inline-block text-volt"
            >
              apply for one
            </UnderlineLink>
          </div>
        </div>
      </div>
    </section>
  );
}
