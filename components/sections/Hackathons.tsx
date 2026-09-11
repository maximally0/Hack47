"use client";

import { ArrowLink, UnderlineLink } from "@/components/ui/ArrowLink";
import { revealFrom, useGsapScope } from "@/hooks/useGsapScope";
import { HACKATHONS, HACKATHON_STATS } from "@/lib/content";

const ROW_GRID = "md:grid-cols-[52px_1.1fr_1fr_1.4fr_132px]";

const STATUS_TONE: Record<string, string> = {
  live: "hk-status hk-status-live",
  default: "hk-status text-ink/62",
  muted: "hk-status text-ink/50",
  open: "hk-status border-dashed text-ink/50",
};

export function Hackathons() {
  const scopeRef = useGsapScope<HTMLElement>((scope) => {
    const list = scope.querySelector("#hackathon-list");
    if (!list) return;
    revealFrom(scope.querySelectorAll("#hackathon-list .hk-row"), {
      trigger: list,
      start: "top 86%",
      from: { y: 18, opacity: 0, duration: 0.6, stagger: 0.07 },
    });
  });

  return (
    <section
      ref={scopeRef}
      id="hackathons"
      className="bg-chalk px-6 py-20 text-ink sm:px-8 lg:py-36"
    >
      <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
        <div>
          <div className="lbl mb-6 text-ink/42">07 — hackathons</div>
          <h2
            className="max-w-[720px] font-medium"
            style={{
              fontSize: "clamp(38px,5.2vw,76px)",
              lineHeight: 0.95,
              letterSpacing: "-.035em",
            }}
          >
            forty-seven hours, in one city at a time
            <span className="text-volt">.</span>
          </h2>
        </div>
        <p className="max-w-[340px] text-sm leading-[1.6] text-ink/66">
          The house takes sixteen. The hackathons are how we meet everybody else —
          short, in person, and run in the cities builders already live in.
        </p>
      </div>

      <p className="mb-14 max-w-[820px] text-[19px] leading-[1.55] text-ink/80">
        Hack47 runs a rolling series of forty-seven hour build weekends across
        India. No pitch decks, no idea stage, no theme for the sake of a theme —
        you arrive with a laptop, leave with something running, and the room is
        judged on what works. Every edition also doubles as a live audition: the
        people who stand out get a direct line into the next residency intake.
      </p>

      <div className="hk-band mb-16 grid grid-cols-2 py-8 md:grid-cols-4">
        {HACKATHON_STATS.map((stat, i) => (
          <div key={stat.label} className={i < 3 ? "pr-6" : ""}>
            <div
              className={`tnum font-medium ${stat.accent === "volt" ? "text-volt" : ""}`}
              style={{
                fontSize: "clamp(34px,3.6vw,50px)",
                lineHeight: 1,
                letterSpacing: "-.03em",
              }}
            >
              {stat.value}
            </div>
            <div className="lbl mt-3 text-ink/50">{stat.label}</div>
          </div>
        ))}
      </div>

      <div
        className="lbl hidden gap-4 border-b border-line-dark pb-4 text-ink/40 md:grid"
        style={{ gridTemplateColumns: "52px 1.1fr 1fr 1.4fr 132px" }}
      >
        <span>ed.</span>
        <span>city</span>
        <span>window</span>
        <span>format</span>
        <span className="text-right">status</span>
      </div>

      <div id="hackathon-list">
        {HACKATHONS.map((edition) => (
          <div key={edition.edition} className="hk-row">
            {/* Desktop / md+ : the original 5-column table row, unchanged. */}
            <div
              className={`hidden items-baseline gap-4 border-b border-ink/14 py-7 md:grid ${ROW_GRID}`}
            >
              <span
                className={`lbl mono tnum ${
                  edition.tone === "open" ? "text-ink/25" : "text-ink/35"
                }`}
              >
                {edition.edition}
              </span>
              <span
                className={`hk-city text-2xl font-medium ${
                  edition.tone === "open" ? "text-ink/42" : ""
                }`}
                style={{ letterSpacing: "-.02em" }}
              >
                {edition.city}
              </span>
              <span
                className={`lbl mono ${
                  edition.tone === "open" ? "text-ink/40" : "text-ink/60"
                }`}
              >
                {edition.window}
              </span>
              <span
                className={`text-sm leading-[1.5] ${
                  edition.tone === "open" ? "text-ink/50" : "text-ink/66"
                }`}
              >
                {edition.format}
              </span>
              <span
                className={`lbl justify-self-start px-3 py-1.5 md:justify-self-end ${STATUS_TONE[edition.tone]}`}
              >
                {edition.status}
              </span>
            </div>

            {/* Mobile ( < md ): grouped card — city is the heading, the
                edition · window · status meta sits on one line above it, and
                the format reads beneath. Stronger top border + more vertical
                space separates one edition from the next. */}
            <div className="border-t-2 border-ink/20 py-8 md:hidden">
              <div className="lbl mono flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  className={`tnum ${
                    edition.tone === "open" ? "text-ink/30" : "text-ink/40"
                  }`}
                >
                  ed. {edition.edition}
                </span>
                <span aria-hidden className="text-ink/25">
                  ·
                </span>
                <span
                  className={edition.tone === "open" ? "text-ink/40" : "text-ink/60"}
                >
                  {edition.window}
                </span>
                <span
                  className={`lbl ml-auto px-3 py-1.5 ${STATUS_TONE[edition.tone]}`}
                >
                  {edition.status}
                </span>
              </div>
              <div
                className={`hk-city mt-3 text-2xl font-medium ${
                  edition.tone === "open" ? "text-ink/42" : ""
                }`}
                style={{ letterSpacing: "-.02em" }}
              >
                {edition.city}
              </div>
              <p
                className={`mt-2 text-sm leading-[1.5] ${
                  edition.tone === "open" ? "text-ink/50" : "text-ink/66"
                }`}
              >
                {edition.format}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap items-center gap-8">
        <ArrowLink
          href="https://hack47-offgrid.devpost.com/"
          variant="ink"
          className="px-8 py-4"
        >
          see the next hackathon
        </ArrowLink>
        <UnderlineLink
          href="mailto:hello@hack47.org?subject=Hosting%20a%20hack47%20edition"
          className="-my-3 inline-flex min-h-[44px] items-center py-3 text-ink/70 sm:my-0 sm:min-h-0 sm:py-0"
        >
          host an edition in your city
        </UnderlineLink>
        <div className="lbl text-ink/42">
          winners get a direct line into the next intake
        </div>
      </div>
    </section>
  );
}
