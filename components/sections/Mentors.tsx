"use client";

// NOT RENDERED. app/page.tsx does not import this component, so it is dead code.
// It is the reason the visible section numbering used to skip 03: it carried the
// "03 — who is in the room" label while nothing rendered it. The live sections
// have since been renumbered 01-07 to close that gap.
//
// Before restoring this section: the MENTORS data below is all placeholder
// ("[mentor name]", pravatar.cc portraits), so it cannot ship as-is. Replacing
// it would also require bumping Partners/ThirtyDays/Campus/Hackathons/Apply back
// up one number each, or this section takes 03 and duplicates Partners.

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UnderlineLink } from "@/components/ui/ArrowLink";
import { MENTORS } from "@/lib/content";

const CARD_GAP = 20;

function pad(n: number) {
  return `${n < 10 ? "0" : ""}${n}`;
}

export function Mentors() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(1);
  const [visible, setVisible] = useState(1);

  const step = useCallback(() => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".mentor-card");
    return card ? card.getBoundingClientRect().width + CARD_GAP : 320;
  }, []);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const ratio = max > 0 ? track.scrollLeft / max : 0;
    const perView = Math.max(1, Math.round(track.clientWidth / step()));
    setVisible(perView);
    setProgress(ratio);
    setIndex(Math.min(MENTORS.length, Math.round(track.scrollLeft / step()) + 1));
  }, [step]);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const scrollByStep = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({
      left: direction * step(),
      behavior: "smooth",
    });
  };

  const base = (visible / MENTORS.length) * 100;
  const barWidth = Math.max(12, base + progress * (100 - base));

  return (
    <section id="mentors" className="bg-chalk py-20 text-ink lg:py-36">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-8 px-6 sm:mb-12 sm:px-8">
        <h2
          className="max-w-[640px] font-medium"
          style={{
            fontSize: "clamp(38px,5.2vw,76px)",
            lineHeight: 0.95,
            letterSpacing: "-.035em",
          }}
        >
          the mentors coming into the house
          <span className="text-volt">.</span>
        </h2>
        <div className="max-w-[330px]">
          <div className="lbl mb-3 text-ink/42">03 — who is in the room</div>
          <p className="text-sm leading-[1.6] text-ink/66">
            Operators and researchers who come through the door during the thirty
            days. The roster grows as each one is confirmed.
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-8 px-6 sm:px-8">
        <div className="h-0.5 max-w-[420px] flex-1 bg-ink/14">
          <div
            className="h-0.5 bg-volt transition-[width] duration-200"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="lbl mono tnum mr-2 text-ink/45">
            {pad(index)} / {pad(MENTORS.length)}
          </span>
          <button
            type="button"
            aria-label="Previous mentor"
            className="slider-btn"
            onClick={() => scrollByStep(-1)}
          >
            <ArrowLeft size={17} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            aria-label="Next mentor"
            className="slider-btn"
            onClick={() => scrollByStep(1)}
          >
            <ArrowRight size={17} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={sync}
        className="mentor-track scrollbar-hidden flex gap-4 overflow-x-auto px-6 pb-4 sm:gap-5 sm:px-8"
      >
        {MENTORS.map((mentor) => (
          <article key={mentor.index} className="mentor-card">
            {mentor.open ? (
              <div className="mb-5 flex h-[340px] items-center justify-center border border-dashed border-ink/28">
                <span className="lbl text-ink/35">slot open</span>
              </div>
            ) : (
              <div className="mb-5 h-[340px] overflow-hidden bg-ink/6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mentor.image}
                  alt={`Portrait placeholder for mentor ${mentor.index}`}
                  className="mentor-image h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}

            <div className="mb-3 flex items-center justify-between">
              <span className="lbl mono tnum text-ink/35">{mentor.index}</span>
              {mentor.commitmentTone === "volt" && (
                <span className="lbl bg-volt px-2 py-1 text-chalk">
                  {mentor.commitment}
                </span>
              )}
              {mentor.commitmentTone === "outline" && (
                <span className="lbl border border-ink/24 px-2 py-1 text-ink/50">
                  {mentor.commitment}
                </span>
              )}
            </div>

            <h3
              className={`text-[26px] font-medium ${
                mentor.open ? "text-ink/45" : ""
              }`}
              style={{ letterSpacing: "-.02em" }}
            >
              {mentor.name}
            </h3>
            <div
              className={`lbl mt-1.5 mb-4 ${
                mentor.open ? "text-ink/40" : "text-ink/50"
              }`}
            >
              {mentor.role}
            </div>
            <div className="rule-dark mb-4" />

            {!mentor.open && (
              <div className="lbl mb-2 text-ink/42">come to them for</div>
            )}
            <p
              className={`text-[15px] leading-[1.5] ${
                mentor.open ? "text-ink/60" : "text-ink/78"
              }`}
            >
              {mentor.blurb}
            </p>

            {mentor.open && (
              <UnderlineLink
                href="#"
                glyph="↗"
                className="mt-5 inline-block text-volt"
              >
                suggest a mentor
              </UnderlineLink>
            )}
          </article>
        ))}
        <div className="w-2 shrink-0" />
      </div>

      <div className="mt-10 px-6 sm:px-8">
        <p className="mono text-[13px] text-ink/55">
          Further mentors are announced here as they are confirmed.
        </p>
      </div>
    </section>
  );
}
