"use client";

import { useGsapScope } from "@/hooks/useGsapScope";
import { gsap } from "@/lib/gsap";
import { GALLERY } from "@/lib/content";

export function Gallery() {
  const scopeRef = useGsapScope<HTMLElement>(() => {
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

      <div className="scrollbar-hidden flex gap-4 overflow-x-auto px-6 pb-2 sm:px-8">
        {GALLERY.map((item) => (
          <figure
            key={item.caption}
            className="shrink-0"
            style={{ width: item.width }}
          >
            <div className="h-[430px] overflow-hidden">
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
      </div>
    </section>
  );
}
