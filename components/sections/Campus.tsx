"use client";

import { ArrowUpRight, PencilLine } from "lucide-react";
import { UnderlineLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useGsapScope } from "@/hooks/useGsapScope";
import { gsap } from "@/lib/gsap";
import { CAMPUS_STAGES } from "@/lib/content";

const MARKER_CLASS: Record<string, string> = {
  filled: "bg-volt",
  outline: "border border-chalk/60",
  faint: "border border-chalk/28",
};

export function Campus() {
  const scopeRef = useGsapScope<HTMLElement>((scope) => {
    gsap.to("#campus-line", {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: scope,
        start: "top 62%",
        end: "bottom 85%",
        scrub: 0.8,
      },
    });
  });

  return (
    <section
      ref={scopeRef}
      id="campus"
      className="bg-soot px-6 py-20 sm:px-8 lg:py-36"
    >
      <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
        <h2
          className="max-w-[700px] font-medium"
          style={{
            fontSize: "clamp(32px,4.2vw,60px)",
            lineHeight: 1,
            letterSpacing: "-.03em",
          }}
        >
          the house is a rehearsal for a campus.
        </h2>
        <SectionLabel>06 — what comes after</SectionLabel>
      </div>

      <div className="grid items-start gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <figure className="m-0">
          <div
            className="relative flex items-center justify-center border border-dashed border-chalk/34 bg-chalk/3"
            style={{ aspectRatio: "16 / 10" }}
          >
            <span className="absolute left-3.5 top-3.5 h-[22px] w-[22px] border-l border-t border-volt" />
            <span className="absolute right-3.5 top-3.5 h-[22px] w-[22px] border-r border-t border-volt" />
            <span className="absolute bottom-3.5 left-3.5 h-[22px] w-[22px] border-b border-l border-volt" />
            <span className="absolute bottom-3.5 right-3.5 h-[22px] w-[22px] border-b border-r border-volt" />
            <div className="px-8 text-center">
              <PencilLine
                size={30}
                strokeWidth={1.4}
                className="mx-auto mb-4 text-chalk/34"
                aria-hidden
              />
              <div className="lbl mb-2 text-chalk/60">sketch — the campus</div>
              <p className="mono mx-auto max-w-[280px] text-[12px] leading-[1.7] text-chalk/34">
                drawing goes here / 16:10 / delhi site plan
              </p>
            </div>
          </div>
          <figcaption className="lbl mt-4 flex flex-wrap justify-between gap-4 text-chalk/42">
            <span>fig. 01 — founder campus, delhi</span>
            <span>concept · not yet built</span>
          </figcaption>
        </figure>

        <div>
          <p className="text-[19px] leading-[1.55] text-chalk/82">
            Pilot 01 is thirty days in a rented villa. What we are actually
            building is permanent: a founder campus in Delhi where people live on
            site, cohorts overlap, and the door does not close at the end of a
            month.
          </p>
          <p className="mt-6 text-[17px] leading-[1.6] text-chalk/55">
            One address. Residencies running back to back, a workshop and a
            studio floor, mentors who keep desks there, and a community that
            compounds because nobody has to leave to stay in it. India has plenty
            of programmes and almost no places. We are building the place.
          </p>

          <div className="relative mt-12 pt-[30px]">
            <div className="absolute inset-x-0 top-11 h-px bg-line" />
            <div
              id="campus-line"
              className="absolute left-0 top-11 h-px w-0 bg-volt"
            />
            <div className="grid grid-cols-3 gap-6">
              {CAMPUS_STAGES.map((stage) => (
                <div key={stage.title}>
                  <div
                    className={`mb-5 h-[13px] w-[13px] ${MARKER_CLASS[stage.marker]}`}
                  />
                  <div
                    className={`text-[19px] font-medium ${
                      stage.marker === "faint" ? "text-chalk/50" : ""
                    }`}
                    style={{ letterSpacing: "-.02em" }}
                  >
                    {stage.title}
                  </div>
                  <div
                    className={`lbl mt-2 ${
                      stage.marker === "filled"
                        ? "text-volt"
                        : stage.marker === "outline"
                          ? "text-chalk/45"
                          : "text-chalk/30"
                    }`}
                  >
                    {stage.status}
                  </div>
                  <p
                    className={`mt-3 text-[13px] leading-[1.55] ${
                      stage.marker === "filled"
                        ? "text-chalk/50"
                        : stage.marker === "outline"
                          ? "text-chalk/42"
                          : "text-chalk/34"
                    }`}
                  >
                    {stage.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <UnderlineLink
            href="mailto:hello@hack47.org?subject=The%20hack47%20campus"
            className="mt-12 inline-flex items-center gap-1 text-volt"
          >
            help us build the campus
            <ArrowUpRight size={12} strokeWidth={2} aria-hidden />
          </UnderlineLink>
        </div>
      </div>
    </section>
  );
}
