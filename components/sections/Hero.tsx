"use client";

import { Fragment } from "react";
import { ApertureGrid } from "@/components/ui/ApertureGrid";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { useGsapScope } from "@/hooks/useGsapScope";
import { gsap } from "@/lib/gsap";
import { HERO_IMAGE, HERO_STATS } from "@/lib/content";

export function Hero() {
  const scopeRef = useGsapScope<HTMLElement>((scope) => {
    const image = scope.querySelector<HTMLElement>("[data-hero-image]");
    const content = scope.querySelector<HTMLElement>("[data-hero-content]");

    // The media layer is a real fixed, full-viewport element (not a GSAP pin,
    // which collapses zero-size `absolute inset-0` layers). The section itself
    // reserves the scroll height, and the sections below — which live in a
    // solid, higher stacking context — simply scroll up and over this fixed
    // image. As they cover it, the image drifts, scales and dims.
    if (image) {
      gsap.to(image, {
        scale: 1.12,
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to("[data-hero-shade]", {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Once the hero is fully scrolled past, hide the fixed layer entirely so
      // it can't sit under (or bleed through) later sections or cost paint.
      gsap.set(scope, { "--hero-media-visible": 1 });
      gsap.to(scope, {
        "--hero-media-visible": 0,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "bottom 60%",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    if (content) {
      gsap.to(content, {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "45% top",
          scrub: true,
        },
      });
    }

    gsap.utils.toArray<HTMLElement>(".aperture-glow").forEach((el) => {
      gsap.to(el, {
        opacity: gsap.utils.random(0.35, 1),
        duration: gsap.utils.random(1.6, 3.4),
        delay: gsap.utils.random(0, 4),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    gsap.from("[data-hero-reveal]", {
      y: 34,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.2,
    });
  });

  return (
    <section
      ref={scopeRef}
      id="pilot"
      className="hero-section relative z-0 h-[100svh] min-h-[560px]"
    >
      {/* Fixed full-viewport media layer */}
      <div
        data-hero-media
        className="hero-media fixed inset-0 -z-10 overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-hero-image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          className="photo-grade absolute inset-0 h-full w-full object-cover"
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,rgba(8,8,7,.72) 0%,rgba(8,8,7,.3) 32%,rgba(8,8,7,.86) 76%,var(--color-coal) 100%)",
          }}
        />
        <div data-hero-shade className="absolute inset-0 bg-coal opacity-0" />

        <ApertureGrid
          columns={4}
          cellWidth={26}
          rowHeight={56}
          gap={8}
          variant="glow"
          className="absolute right-6 top-20 hidden md:right-16 md:top-24 md:grid"
        />
        <div className="lbl absolute right-6 top-[54px] hidden text-chalk/50 md:right-16 md:top-[70px] md:block">
          sixteen places
        </div>
      </div>

      {/* Hero copy */}
      <div
        data-hero-content
        className="pointer-events-none absolute inset-x-0 bottom-[128px] px-6 sm:bottom-[132px] sm:px-8"
      >
        <div data-hero-reveal className="lbl mb-4 text-volt sm:mb-6">
          batch 01 · delhi villa · 30 days · 16 places
        </div>
        <h1
          data-hero-reveal
          className="max-w-[840px] font-medium"
          style={{
            fontSize: "clamp(32px,7vw,78px)",
            lineHeight: 1,
            letterSpacing: "-.03em",
          }}
        >
          a house for builders who would rather ship than sleep.
        </h1>
      </div>

      {/* Stat bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-line bg-ink">
        <div className="flex flex-col items-stretch px-6 sm:min-h-24 sm:flex-row sm:flex-wrap sm:px-8">
          <div className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-4 py-5 sm:min-w-[280px] sm:gap-12 sm:pr-12">
            {HERO_STATS.map((stat, i) => (
              <Fragment key={stat.label}>
                {i > 0 && (
                  <div className="hidden w-px self-stretch bg-line sm:block" />
                )}
                <div>
                  <div className="lbl mb-1.5 text-chalk/45">{stat.label}</div>
                  <div
                    className="tnum text-[26px] font-medium sm:text-[30px]"
                    style={{ letterSpacing: "-.02em" }}
                  >
                    {stat.value}
                    {stat.accent && (
                      <span className="text-volt">{stat.accent}</span>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          <ArrowLink
            href="#apply"
            className="justify-center border-t border-line py-4 sm:items-center sm:border-t-0 sm:px-8 sm:py-0"
          >
            apply for a place
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
