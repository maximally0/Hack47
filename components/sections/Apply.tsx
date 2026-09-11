import { ArrowLink } from "@/components/ui/ArrowLink";

export function Apply() {
  return (
    <section
      id="apply"
      className="border-t border-line-dark bg-chalk px-6 py-20 text-ink sm:px-8 lg:py-40"
    >
      <div className="lbl mb-14 text-ink/42">08 — apply</div>
      <h2
        className="max-w-[1000px] font-medium"
        style={{
          fontSize: "clamp(46px,8.4vw,132px)",
          lineHeight: 0.9,
          letterSpacing: "-.045em",
        }}
      >
        sixteen places. one first room.
      </h2>
      <div className="mt-14 flex flex-wrap items-center gap-8">
        <ArrowLink
          href="#apply"
          variant="ink"
          className="px-9 py-5 !text-[11px]"
        >
          apply for a place
        </ArrowLink>
        <div className="lbl text-ink/50">
          batch 01 · delhi · sept 15 — oct 15
        </div>
      </div>
    </section>
  );
}
