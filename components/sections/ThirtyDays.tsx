"use client";

import { revealFrom, useGsapScope } from "@/hooks/useGsapScope";
import { Collapsible } from "@/components/ui/Collapsible";
import { RHYTHM } from "@/lib/content";

const MARKED_DAYS = [1, 15, 30];
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

function tickHeight(day: number) {
  if (MARKED_DAYS.includes(day)) return "100%";
  return day % 5 === 0 ? "62%" : "38%";
}

export function ThirtyDays() {
  const scopeRef = useGsapScope<HTMLElement>((scope) => {
    const ticks = scope.querySelector("#day-ticks");
    if (!ticks) return;
    revealFrom(scope.querySelectorAll("#day-ticks .tick"), {
      trigger: ticks,
      start: "top 88%",
      from: {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 0.5,
        stagger: 0.022,
      },
    });
  });

  return (
    <section ref={scopeRef} id="house" className="bg-volt text-chalk">
      <div className="flex flex-wrap items-end justify-between gap-6 px-6 pt-16 pb-8 sm:px-8 sm:pt-20 sm:pb-10">
        <h2
          className="max-w-[640px] font-medium"
          style={{
            fontSize: "clamp(34px,4.4vw,62px)",
            lineHeight: 0.98,
            letterSpacing: "-.03em",
          }}
        >
          thirty days, and how they are spent.
        </h2>
        <div className="lbl text-chalk/72">04 — the operating rhythm</div>
      </div>

      <div className="px-6 pb-3 sm:px-8">
        <div
          id="day-ticks"
          className="flex h-[34px] items-end gap-[3px]"
          aria-hidden
        >
          {DAYS.map((day) => (
            <div
              key={day}
              className={`tick ${MARKED_DAYS.includes(day) ? "tick-on" : ""}`}
              style={{ height: tickHeight(day) }}
            />
          ))}
        </div>
        <div className="lbl mt-3 flex justify-between text-chalk/60">
          <span>
            <span className="sm:hidden">01 · arrival</span>
            <span className="hidden sm:inline">day 01 · arrival</span>
          </span>
          <span>
            <span className="sm:hidden">15 · the cut</span>
            <span className="hidden sm:inline">day 15 · the cut</span>
          </span>
          <span>
            <span className="sm:hidden">30 · ship</span>
            <span className="hidden sm:inline">day 30 · ship</span>
          </span>
        </div>
      </div>

      <div className="border-t border-chalk/30">
        <Collapsible
          label="the 30-day rhythm"
          meta={`${RHYTHM.length} entries`}
          buttonClassName="px-6 text-chalk sm:px-8"
        >
          {RHYTHM.map((entry, i) => (
            <div
              key={entry.title}
              className={`clock-row grid items-baseline gap-2 px-6 py-7 sm:gap-3 sm:px-8 sm:py-8 lg:grid-cols-[132px_248px_1fr] lg:gap-10 ${
                i === 0 ? "border-t border-chalk/22" : ""
              } ${
                i < RHYTHM.length - 1 ? "border-b border-chalk/22" : ""
              }`}
            >
              <div className="lbl mono tnum text-chalk/68">{entry.when}</div>
              <div
                className="clock-key mono font-medium text-chalk/90"
                style={{
                  fontSize: "clamp(21px,2.2vw,29px)",
                  letterSpacing: "-.02em",
                }}
              >
                {entry.title}
              </div>
              <p className="max-w-[680px] text-[17px] leading-[1.5] text-chalk/88">
                {entry.body}
              </p>
            </div>
          ))}
        </Collapsible>
      </div>
    </section>
  );
}
