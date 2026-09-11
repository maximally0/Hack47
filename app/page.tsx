import { Apply } from "@/components/sections/Apply";
import { Campus } from "@/components/sections/Campus";
import { Gallery } from "@/components/sections/Gallery";
import { Hackathons } from "@/components/sections/Hackathons";
import { Hero } from "@/components/sections/Hero";
import { Partners } from "@/components/sections/Partners";
import { Premise } from "@/components/sections/Premise";
import { Selection } from "@/components/sections/Selection";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { ThirtyDays } from "@/components/sections/ThirtyDays";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        {/* Everything below the hero shares a solid stacking context and sits
            above the pinned hero media, so it scrolls up and over it. */}
        <div className="relative z-10 bg-coal">
          <Selection />
          <Premise />
          <Partners />
          <ThirtyDays />
          <Gallery />
          <Campus />
          <Hackathons />
          <Apply />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
