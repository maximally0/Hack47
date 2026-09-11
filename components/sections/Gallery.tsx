"use client";

import { useGsapScope } from "@/hooks/useGsapScope";
import { gsap } from "@/lib/gsap";
import { GALLERY } from "@/lib/content";

export function Gallery() {
  const scopeRef = useGsapScope<HTMLElement>(() => {
    // The vertical-scrub parallax fights a horizontally-scrolling rail and is
    // imperceptible at phone widths — restrict it to lg+ (desktop) only.
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      gsap.utils.toArray<HTMLElement>("[data-gallery-image]").forEach((img) => {
        gsap.fromTo(
          img,
          { y: -7 },
          {
            y: 7,
            ease: "none",
            scrollTrigger: {
              trigger: img,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    });
  });

  return (
    <section ref={scopeRef} className="bg-coal py-16 lg:py-32">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 px-6 sm:mb-12 sm:px-8">
        <h2
          className="font-medium"
          style={{
            fontSize: "clamp(30px,3.4vw,48px)",
            letterSpacing: "-.03em",
          }}
        >
          the villa
          <span className="text-volt">.</span>
        </h2>
        <div className="lbl mono text-chalk/42">
          01 <span className="text-chalk/24">—</span> 04 · delhi
        </div>
      </div>

      <div className="gallery-rail-wrap relative">
        <div className="gallery-rail scrollbar-hidden flex gap-4 overflow-x-auto px-6 pb-2 sm:px-8">
          {GALLERY.map((item) => (
            <figure
              key={item.caption}
              className="gallery-figure shrink-0"
              style={{ width: item.width }}
            >
              <div className="h-[300px] overflow-hidden sm:h-[430px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-gallery-image
                  src={item.src}
                  alt={item.alt}
                  className="photo-grade h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="lbl mt-3 text-chalk/50">
                {item.caption}
              </figcaption>
            </figure>
          ))}
          {/* Trailing spacer guarantees the last card clears the right edge
              in browsers that collapse flex end-padding under overflow. */}
          <div className="w-2 shrink-0 sm:hidden" aria-hidden />
        </div>
        {/* Right edge fade — a visible hint that the rail scrolls. Mobile only;
            pointer-events-none so it never blocks the swipe. */}
        <div
          className="gallery-edge-fade pointer-events-none absolute inset-y-0 right-0 w-12 sm:hidden"
          aria-hidden
        />
      </div>
    </section>
  );
}
