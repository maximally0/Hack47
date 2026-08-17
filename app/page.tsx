"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Monitor,
  Trash2,
  Globe,
  Folder,
  AlertTriangle,
  Users,
  MapPin,
  Newspaper,
  Zap,
  Ticket,
  Mail,
  Phone,
  Flame,
  ArrowUp,
  Skull,
} from "lucide-react";
import { WinWindow } from "@/components/win-window";
import { DesktopIcon } from "@/components/desktop-icon";
import { Taskbar } from "@/components/taskbar";
import { cn } from "@/lib/utils";

const CLOUD_URLS = [
  "https://images.unsplash.com/photo-1603437873662-dc1f44901825?auto=format&w=400&q=80",
  "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&w=400&q=80",
];

const SUN_SVG = "https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/caro-asercion/heraldic-sun.svg";
const BIRD_SVG = "https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/lorc/bird-limb.svg";
const FLOWER_SVG = "https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/lorc/twirly-flower.svg";
const SHIELD_SVG = "https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/lorc/checked-shield.svg";

// ═══════════════════════════════════════════════════════════════════════════
// DATA — socials, cities, contact, feed
// ═══════════════════════════════════════════════════════════════════════════

const SOCIALS = [
  {
    id: "x",
    label: "X / TWITTER",
    handle: "@hack47org",
    url: "https://x.com/hack47org",
    icon: "𝕏",
  },
  {
    id: "instagram",
    label: "INSTAGRAM",
    handle: "@hack47.0rg",
    url: "https://www.instagram.com/hack47.0rg/",
    icon: "📸",
  },
  {
    id: "linkedin",
    label: "LINKEDIN",
    handle: "/company/hack47",
    url: "https://www.linkedin.com/company/hack47",
    icon: "💼",
  },
];

const CONTACT = {
  email: "hello@hack47.org",
  phone: "+91 90412 60790",
  phoneRaw: "+919041260790",
};

const CITIES = [
  {
    name: "DELHI",
    status: "LIVE",
    statusText: "BATCH #001 · SEPT 15 – OCT 15",
    detail: "The origin node. 16 builders. One villa.",
    icon: "🔥",
  },
  {
    name: "MUMBAI",
    status: "QUEUED",
    statusText: "NEXT WAVE",
    detail: "Maximum city. Maximum chaos.",
    icon: "🌊",
  },
  {
    name: "BANGALORE",
    status: "QUEUED",
    statusText: "NEXT WAVE",
    detail: "The silicon node.",
    icon: "💻",
  },
  {
    name: "CHANDIGARH",
    status: "QUEUED",
    statusText: "NEXT WAVE",
    detail: "The home node.",
    icon: "🏠",
  },
  {
    name: "AND MORE…",
    status: "TBD",
    statusText: "ACROSS INDIA",
    detail: "The network keeps growing. City by city.",
    icon: "🇮🇳",
  },
];

type FeedPost = { author: string; role: string; date: string; url: string; text: string };
type FeedData = {
  updated: string;
  mint: { title: string; url: string; date: string; snippet: string };
  x: FeedPost[];
  linkedin: FeedPost[];
};

const FEED_DEFAULT: FeedData = {
  updated: "2026-08-17T11:30:00+05:30",
  mint: {
    title:
      "How Gen Z entrepreneurs are using startup builder residencies and hacker houses to start their businesses",
    url: "https://www.livemint.com/mint-lounge/business-of-life/gen-z-business-entrepreneurs-residency-hacker-house-11785839736145.html",
    date: "2026-08-05",
    snippet:
      '"Others, like Hack47 (which describes itself as Delhi\'s first hacker house), will pack builders into a villa for a month."',
  },
  x: [],
  linkedin: [
    {
      author: "Pratyush Pandey",
      role: "co-founder @ Hack47",
      date: "2026-08-17",
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7494952801635328000/",
      text: "At 17 I hosted the biggest hackathon of my city. At 18 I will be hosting Delhi's first hacker house. upgraded? maybe. but this time I wanna create more impact with my work. Hack47 doesn't want to be just another hacker house — we want to be the most exclusive community of builders where we can build, break and rebuild together.",
    },
    {
      author: "Rishul Chanana",
      role: "founder @ hack47.org",
      date: "2026-08-16",
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7494805195122716672/",
      text: "OpenAI credits are coming to hack47. Every builder at hack47 is going to get OpenAI credits to build with. A lot of them. We want hack47 to be less about sitting through talks and more about actually building shit.",
    },
    {
      author: "Rishul Chanana",
      role: "founder @ hack47.org",
      date: "2026-08-16",
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7494453770676887552/",
      text: "The fastest person in the room is often the least productive. I've started noticing this after being around a lot of young builders. I've been to two hacker houses, I'm hosting another one right now, and I've run around 20 hackathons.",
    },
  ],
};

function useFeedData(): FeedData {
  const [data, setData] = useState<FeedData | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/feed/latest.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d === "object") setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data ?? FEED_DEFAULT;
}

/** Deterministic IST timestamp — avoids server/client hydration mismatch. */
function formatSyncIST(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const ist = new Date(d.getTime() + 5.5 * 3600e3);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(ist.getUTCDate())}-${p(ist.getUTCMonth() + 1)}-${ist.getUTCFullYear()} ${p(ist.getUTCHours())}:${p(ist.getUTCMinutes())} IST`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Window layout
// ═══════════════════════════════════════════════════════════════════════════

function computeWindowLayout() {
  if (typeof window === "undefined") {
    return {
      main: { x: 100, y: 30 },
      perks: { x: 550, y: 30 },
      photos: { x: 550, y: 350 },
      error: { x: 100, y: 400 },
      soul: { x: 350, y: 180 },
      team: { x: 250, y: 100 },
      residents: { x: 350, y: 120 },
      specs: { x: 300, y: 200 },
      network: { x: 120, y: 260 },
      cities: { x: 560, y: 180 },
      news: { x: 300, y: 380 },
      sponsors: { x: 100, y: 120 },
      offgrid: { x: 440, y: 60 },
      contact: { x: 620, y: 440 },
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const iconCol = 85;
  const taskbarH = 36;
  const gutter = 12;

  const availW = vw - iconCol - gutter * 3;
  const availH = vh - taskbarH - gutter * 3;

  const colW = Math.floor(availW / 2);
  const rowH = Math.floor(availH / 2);

  const col1X = iconCol + gutter;
  const col2X = iconCol + gutter + colW + gutter;
  const row1Y = gutter;
  const row2Y = gutter + rowH + gutter;

  const centerX = iconCol + Math.floor(availW / 3);
  const centerY = Math.floor(availH / 4);

  const soulX = iconCol + Math.floor(availW / 2) - 130;
  const soulY = Math.floor(availH / 2) - 80;

  // New windows — right strip (past the perks/photos column) + bottom-center
  // strip (below the main window). Clamped so a ~300px window always fits.
  const rightX = Math.min(col2X + Math.min(colW, 380) + 16, vw - 300);
  const bottomX = col1X + Math.min(colW, 380) + 16;

  return {
    main: { x: col1X, y: row1Y },
    perks: { x: col2X, y: row1Y },
    photos: { x: col2X, y: row2Y },
    error: { x: col1X, y: row2Y },
    soul: { x: soulX, y: soulY },
    team: { x: centerX - 20, y: centerY },
    residents: { x: centerX + 30, y: centerY + 40 },
    specs: { x: centerX + 60, y: centerY + 80 },
    // Default-open apps — staggered so every title bar is visible
    news: { x: rightX, y: row1Y },
    offgrid: { x: rightX + 20, y: row1Y + 90 },
    network: { x: rightX + 40, y: row1Y + 180 },
    cities: { x: bottomX, y: row2Y },
    sponsors: { x: bottomX + 20, y: row2Y + 80 },
    contact: { x: bottomX + 40, y: row2Y + 160 },
  };
}

export default function DesktopPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return <MobileView />;
  }

  return <DesktopView />;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE VIEW — the full experience, rebuilt
// ═══════════════════════════════════════════════════════════════════════════

function MobileCard({
  title,
  children,
  titleClassName,
}: {
  title: string;
  children: React.ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className="mb-3 bg-[#c0c0c0] win-border-outset overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.35)]">
      <div
        className={cn(
          "bg-gradient-to-r from-[#800000] to-[#cc0000] px-2.5 py-1.5 text-[11px] font-bold text-white flex items-center justify-between",
          titleClassName
        )}
      >
        <span className="truncate pr-2">{title}</span>
        <span className="text-[8px] text-white/50 tracking-tight shrink-0 select-none">─ □ ✕</span>
      </div>
      <div className="p-0.5 m-[3px] win-border-inset bg-white text-black">{children}</div>
    </div>
  );
}

function MobileView() {
  const [showForm, setShowForm] = useState(false);
  const feed = useFeedData();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div
      className="relative min-h-screen font-mono pb-28"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #4a0505 0%, #1a0000 45%, #000000 100%)",
      }}
    >
      {/* CRT scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9997] scanlines opacity-15" />

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-[9000] bg-black/80 backdrop-blur-md border-b-2 border-red-900/60 px-3 py-2 flex items-center justify-between">
        <p className="font-anton text-2xl leading-none text-white uppercase tracking-tight select-none">
          HACK<span className="text-electric-yellow">47</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[9px] text-green-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            BATCH #001 LIVE
          </span>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 win-border-outset active:translate-x-px active:translate-y-px"
          >
            APPLY
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="px-4 pt-6">
        <h1 className="font-anton text-[64px] leading-[0.9] text-white uppercase select-none">
          HACK<span className="text-electric-yellow">47</span>
        </h1>
        <p className="text-[11px] text-red-200/80 leading-snug mt-2 max-w-[320px]">
          Delhi&apos;s first hacker house. A 30-day residency for 16 builders who care more about
          their Git history than their sleep schedule.
        </p>
        <div className="mt-3 bg-black text-electric-yellow p-2.5 font-mono text-[10px] border-l-4 border-electric-yellow shadow-[3px_3px_0px_rgba(0,0,0,0.4)]">
          <p>&gt; INITIALIZING DELHI&apos;S FIRST HACKER HOUSE...</p>
          <p>&gt; STATUS: PURE CHAOS DETECTED</p>
          <p>&gt; LOCATION: DELHI VILLA · SEPT 15 – OCT 15</p>
          <p className="animate-pulse">&gt; NEXT NODE: TBD — INDIA IS THE NETWORK ▊</p>
        </div>
      </section>

      {/* ── OFFGRID — golden ticket ── */}
      <section id="offgrid" className="px-4 mt-6">
        <div className="relative overflow-hidden bg-gradient-to-b from-[#3a2b00] via-[#1a1200] to-black border-2 border-yellow-700/60 shadow-[0_0_30px_rgba(255,200,0,0.15)]">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center text-[9px] font-bold tracking-widest text-yellow-600">
              <span>OFFGRID.EXE</span>
              <span>VIRTUAL HACKATHON</span>
            </div>
            <p className="font-anton text-3xl text-yellow-400 uppercase mt-2 leading-none">
              Golden
              <br />
              Ticket
            </p>
            <p className="text-[10px] text-yellow-200/70 mt-2 leading-relaxed">
              30 days. Fully remote. Pure chaos. Win Offgrid and get a{" "}
                        <span className="text-yellow-300 font-bold">guaranteed seat</span> in the next Hack47
                        cohort.
            </p>
            <a
              href="https://hack47-offgrid.devpost.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block w-full text-center bg-yellow-500 text-black font-bold text-xs uppercase py-2.5 tracking-wider win-border-outset active:translate-y-px"
            >
              ✦ ENTER THE ARENA ↗
            </a>
            <p className="text-[8px] text-yellow-700/60 mt-1.5 text-center italic">
              One winner. One seat. The next cohort is waiting.
            </p>
          </div>
        </div>
      </section>

      {/* ── APPLY CTA ── */}
      <section id="apply" className="px-4 mt-6">
        <MobileCard title="⚠ SELL_YOUR_SOUL.EXE">
          <div className="p-4 text-center font-mono">
            <p className="text-2xl font-bold mb-1">👹</p>
            <p className="font-bold text-sm uppercase tracking-wide mb-2">SELL US YOUR SOUL</p>
            <p className="text-[10px] text-gray-600 mb-3 leading-relaxed">
              30 days. No distractions. Pure building.
              <br />
              In exchange, we take your soul (and your sleep schedule).
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-red-600 text-white py-3 font-bold text-xs uppercase tracking-wider hover:bg-red-700 active:translate-y-px transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.3)]"
            >
              ✦ I ACCEPT — APPLY NOW ✦
            </button>
            <p className="text-[8px] text-gray-400 mt-2 italic">Terms: No refunds on sleep lost.</p>
          </div>
        </MobileCard>
      </section>

      {/* ── CITIES — next nodes ── */}
      <section id="nodes" className="px-4 mt-6">
        <MobileCard title="📡 NEXT_NODES.EXE" titleClassName="bg-gradient-to-r from-[#006400] to-[#00a000]">
          <div className="p-3 font-mono text-[11px]">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-[10px] text-gray-700 uppercase">INDIA NODE MAP</p>
              <span className="text-[8px] font-bold text-green-600 animate-pulse">● DELHI LIVE</span>
            </div>
            <div>
              {CITIES.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                >
                  <div className="pr-2">
                    <p className="font-bold text-[11px]">
                      {c.icon} {c.name}
                    </p>
                    <p className="text-[9px] text-gray-500">{c.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        "inline-block text-[8px] font-bold px-1.5 py-0.5 border",
                        c.status === "LIVE"
                          ? "text-green-700 border-green-600 bg-green-50"
                          : c.status === "QUEUED"
                            ? "text-yellow-700 border-yellow-600 bg-yellow-50"
                            : "text-gray-500 border-gray-400 bg-gray-100"
                      )}
                    >
                      {c.status}
                    </span>
                    <p className="text-[7px] text-gray-400 mt-0.5">{c.statusText}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-500 italic mt-2">
              Node announcements drop on X + LinkedIn first. Follow to know when your city goes
              live.
            </p>
          </div>
        </MobileCard>
      </section>

      {/* ── SPONSORS — power supply ── */}
      <section id="sponsors" className="px-4 mt-6">
        <MobileCard title="⚡ POWER_SUPPLY.INI" titleClassName="bg-gradient-to-r from-[#4a0080] to-[#7a00cc]">
          <div className="p-3">
            <p className="font-bold text-[10px] text-gray-700 uppercase mb-2">
              INSTALLED DRIVERS — POWERING THE MACHINE
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-gray-300 p-2 flex flex-col items-center justify-center min-h-[92px]">
                <img src="/sponsors/redbull.png" alt="Red Bull" className="h-10 w-auto" />
                <p className="text-[7px] text-gray-500 mt-1 text-center">FUEL.SYS — OFFICIAL CHAOS FUEL</p>
              </div>
              <div className="flex-1 bg-white border border-gray-300 p-2 flex flex-col items-center justify-center min-h-[92px]">
                <img src="/sponsors/openai.png" alt="OpenAI" className="h-7 w-auto" />
                <p className="text-[7px] text-gray-500 mt-1 text-center">GPT.DLL — COMPUTE FOR BUILDERS</p>
              </div>
            </div>
            <p className="text-[8px] text-gray-500 italic mt-2">
              Want to power the machine? → hello@hack47.org
            </p>
          </div>
        </MobileCard>
      </section>

      {/* ── NEWS — press + live feed ── */}
      <section id="news" className="px-4 mt-6">
        <MobileCard title="📰 NEWS_SIGNAL.EXE" titleClassName="bg-gradient-to-r from-[#000080] to-[#0000cc]">
          <div className="p-3">
            <a
              href={feed.mint.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-black text-white p-3 border-2 border-yellow-500/60 hover:border-yellow-400 transition-colors"
            >
              <p className="text-[8px] font-bold text-yellow-400 tracking-widest mb-1 uppercase">
                ★ Featured in The Mint — {feed.mint.date}
              </p>
              <p className="text-[11px] font-bold leading-snug mb-2">{feed.mint.title}</p>
              <p className="text-[9px] text-gray-400 italic">{feed.mint.snippet}</p>
              <p className="text-[9px] text-yellow-400 mt-2 font-bold">READ ARTICLE ↗</p>
            </a>

            <div className="mt-3">
              <p className="text-[9px] font-bold text-gray-600 uppercase mb-1.5">
                LATEST SIGNALS
              </p>
              {feed.x.length === 0 ? (
                <div className="text-[9px] text-gray-500 bg-gray-100 border border-dashed border-gray-300 p-2 leading-relaxed">
                  @hack47org — 0 signals detected. The birds haven&apos;t landed yet.{" "}
                  <a
                    href="https://x.com/hack47org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 font-bold underline"
                  >
                    Follow ↗
                  </a>
                </div>
              ) : (
                feed.x.slice(0, 1).map((p, i) => (
                  <a
                    key={i}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-300 bg-[#f8f8f8] p-2 mb-2"
                  >
                    <p className="text-[9px] font-bold text-gray-800">
                      {p.author} <span className="text-gray-400 font-normal">· {p.date}</span>
                    </p>
                    <p className="text-[9px] text-gray-600 leading-snug mt-1 line-clamp-3">{p.text}</p>
                    <p className="text-[8px] font-bold mt-1 text-blue-700">OPEN ON X ↗</p>
                  </a>
                ))
              )}
              {feed.linkedin.slice(0, 2).map((p, i) => (
                <a
                  key={i}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-gray-300 bg-[#f8f8f8] p-2 mb-2 last:mb-0"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-bold text-gray-800">{p.author}</p>
                    <span className="text-[8px] text-gray-400">{p.date}</span>
                  </div>
                  <p className="text-[8px] text-gray-500">{p.role}</p>
                  <p className="text-[9px] text-gray-600 leading-snug mt-1 line-clamp-3">{p.text}</p>
                  <p className="text-[8px] font-bold mt-1 text-blue-700">OPEN ON LINKEDIN ↗</p>
                </a>
              ))}
            </div>
          </div>
        </MobileCard>
      </section>

      {/* ── HOUSE PROTOCOLS ── */}
      <section className="px-4 mt-6">
        <MobileCard title="README_FIRST.TXT">
          <div className="p-3 font-mono text-[11px] text-black">
            <p className="font-bold underline mb-3 uppercase">HOUSE PROTOCOLS:</p>
            <ul className="space-y-3 mb-4">
              <li>
                - <span className="font-bold">LAUNDRY.SYS</span>: We wash the socks. You build the robots.
              </li>
              <li>
                - <span className="font-bold">FOOD.EXE</span>: High-protein fuel. Optimized for latency.
              </li>
              <li>
                - <span className="font-bold">SLEEP.DLL</span>: Optional. Not recommended during demo day.
              </li>
            </ul>
            <div className="p-3 border-2 border-dashed border-red-500 bg-red-50/70">
              <p className="text-[11px] leading-relaxed">
                Highly addictive environment. May cause sudden career pivots.
              </p>
            </div>
          </div>
        </MobileCard>
      </section>

      {/* ── ARCHDEMONS ── */}
      <section id="devils" className="px-4 mt-6">
        <MobileCard title="👹 ARCHDEMONS.SYS" titleClassName="bg-gradient-to-r from-[#4a0000] to-[#cc0000]">
          <div className="p-3">
            <p className="text-center text-[9px] text-gray-500 italic mb-3">
              The ones who summoned this chaos into existence
            </p>
            <DevilRow
              name="Rishul Chanana"
              role="Archdemon I"
              img="/rishul.jpeg"
              links={[
                { label: "LinkedIn ↗", url: "https://www.linkedin.com/in/rishul-chanana/" },
                { label: "𝕏 ↗", url: "https://x.com/rishhul" },
              ]}
            />
            <DevilRow
              name="Pratyush Pandey"
              role="Archdemon II"
              img="/pratyush.jpeg"
              links={[
                { label: "LinkedIn ↗", url: "https://www.linkedin.com/in/pratyush-pandey-09b35b219" },
                { label: "𝕏 ↗", url: "https://x.com/P_Pratyush7" },
              ]}
            />
            <DevilRow
              name="Raghwender Vasisth"
              role="Archdemon III"
              initials="RV"
              links={[
                { label: "LinkedIn ↗", url: "https://www.linkedin.com/in/raghwender-vasist" },
                { label: "𝕏 ↗", url: "https://x.com/Hawthorn_thinks" },
                { label: "IG ↗", url: "https://www.instagram.com/hawthorn_laments" },
              ]}
            />
            <p className="text-center text-[8px] text-gray-400 italic mt-3">
              These three traded their souls first. Now they collect yours.
            </p>
          </div>
        </MobileCard>
      </section>

      {/* ── RESIDENTS ── */}
      <section className="px-4 mt-6">
        <MobileCard title="RESIDENTS.DAT" titleClassName="bg-gradient-to-r from-[#005000] to-[#008000]">
          <ResidentsPanel />
        </MobileCard>
      </section>

      {/* ── SYSTEM SPECS ── */}
      <section className="px-4 mt-6">
        <MobileCard title="SYSTEM_SPECS.INF" titleClassName="bg-gradient-to-r from-[#404040] to-[#808080]">
          <SystemSpecs />
        </MobileCard>
      </section>

      {/* ── HOUSE PHOTOS ── */}
      <section className="px-4 mt-6">
        <MobileCard title="HOUSE_PHOTOS.EXE" titleClassName="bg-gradient-to-r from-[#0058ee] to-[#3789f8]">
          <div className="overflow-x-auto flex gap-2 p-2 pb-2">
            {HOUSE_PHOTOS.map((p, i) => (
              <img
                key={i}
                src={p.src}
                alt={p.caption}
                className="h-28 w-auto object-cover rounded border-2 border-white/30 shrink-0 shadow-lg"
                style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (2 + i)}deg)` }}
              />
            ))}
          </div>
          <p className="px-2 pb-2 text-[8px] text-gray-500 italic">
            The house. The arena. The 4AM brainwave zone.
          </p>
        </MobileCard>
      </section>

      {/* ── CONTACT — helpdesk ── */}
      <section id="contact" className="px-4 mt-6">
        <MobileCard title="☎ HELPDESK.EXE" titleClassName="bg-gradient-to-r from-[#008080] to-[#00b0b0]">
          <div className="p-3">
            <p className="text-[10px] text-gray-600 mb-3">
              Summon an organizer. We reply fast (or when the WiFi drops).
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="block w-full text-left bg-[#c0c0c0] win-border-outset px-3 py-2.5 mb-2 active:translate-x-px active:translate-y-px"
            >
              <p className="text-[8px] font-bold text-gray-500 uppercase">Email</p>
              <p className="text-[13px] font-bold text-blue-800">{CONTACT.email}</p>
            </a>
            <a
              href={`tel:${CONTACT.phoneRaw}`}
              className="block w-full text-left bg-[#c0c0c0] win-border-outset px-3 py-2.5 active:translate-x-px active:translate-y-px"
            >
              <p className="text-[8px] font-bold text-gray-500 uppercase">Phone / WhatsApp</p>
              <p className="text-[13px] font-bold text-blue-800">{CONTACT.phone}</p>
            </a>
            <p className="text-[8px] text-gray-500 italic mt-2">
              Response time: 24-48h. Faster if you bribe us with chai.
            </p>
          </div>
        </MobileCard>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-4 mt-6 pb-4">
        <div className="flex gap-2">
          {SOCIALS.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-black/60 border border-red-900/50 text-white py-2.5 text-center text-[10px] font-bold hover:bg-red-950/60 transition-colors"
            >
              {s.icon} {s.label.split(" ")[0]} ↗
            </a>
          ))}
        </div>
        <p className="text-center text-[9px] text-red-200/40 mt-4 leading-relaxed">
          HACK47 © 2026 — Delhi&apos;s first hacker house.
          <br />
          Batch #001: Sept 15 – Oct 15 · More cities loading…
        </p>
      </footer>

      {/* ── BOTTOM DOCK ── */}
      <MobileDock
        onApply={() => setShowForm(true)}
        scrollTo={scrollTo}
      />

      {showForm && <SoulForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function DevilRow({
  name,
  role,
  img,
  initials,
  links,
}: {
  name: string;
  role: string;
  img?: string;
  initials?: string;
  links: { label: string; url: string }[];
}) {
  return (
    <div className="flex gap-3 items-start p-2 border border-gray-300 bg-[#f8f8f8] mb-2 last:mb-0">
      {img ? (
        <img src={img} alt={name} className="w-16 h-16 object-cover border-2 border-red-800 shrink-0" />
      ) : (
        <div className="w-16 h-16 border-2 border-red-800 bg-black text-red-500 flex items-center justify-center font-bold text-xl shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[11px]">{name}</p>
        <p className="text-[9px] text-red-700 uppercase tracking-wider mb-1.5">{role}</p>
        <div className="flex gap-2 flex-wrap">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-blue-600 hover:underline"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileDock({
  onApply,
  scrollTo,
}: {
  onApply: () => void;
  scrollTo: (id: string) => void;
}) {
  const items = [
    {
      id: "top",
      label: "TOP",
      icon: ArrowUp,
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    { id: "apply", label: "APPLY", icon: Flame, action: onApply },
    { id: "nodes", label: "NODES", icon: MapPin, action: () => scrollTo("nodes") },
    { id: "news", label: "NEWS", icon: Newspaper, action: () => scrollTo("news") },
    { id: "call", label: "CALL", icon: Phone, action: () => (window.location.href = `tel:${CONTACT.phoneRaw}`) },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-linear-to-b from-[#245edb] via-[#3f8cf3] to-[#245edb] border-t-2 border-black/50 shadow-[0_-2px_10px_rgba(0,0,0,0.6)] flex">
      {items.map((i) => (
        <button
          key={i.id}
          onClick={i.action}
          className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 text-white active:bg-[#2c6ecb] transition-colors"
        >
          <i.icon className="w-4 h-4" />
          <span className="text-[8px] font-bold tracking-wider">{i.label}</span>
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DESKTOP VIEW
// ═══════════════════════════════════════════════════════════════════════════

function DesktopView() {
  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({
    main: true,
    perks: true,
    photos: true,
    error: true,
    soul: true,
    team: false,
    residents: false,
    specs: false,
    network: true,
    cities: true,
    news: true,
    sponsors: true,
    offgrid: true,
    contact: true,
  });
  const [windowOrder, setWindowOrder] = useState<string[]>([
    "news",
    "offgrid",
    "network",
    "cities",
    "sponsors",
    "contact",
    "soul",
    "main",
    "perks",
    "photos",
    "error",
    "team",
    "residents",
    "specs",
  ]);
  const [clippyVisible, setClippyVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [layout, setLayout] = useState(computeWindowLayout);

  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLayout(computeWindowLayout());
  }, []);

  const toggleWindow = (id: string, state?: boolean) => {
    setOpenWindows((prev) => ({ ...prev, [id]: state ?? !prev[id] }));
    if (state !== false) {
      bringToFront(id);
    }
  };

  const bringToFront = (id: string) => {
    setWindowOrder((prev) => [id, ...prev.filter((w) => w !== id)]);
  };

  const getZIndex = (id: string) => {
    const index = windowOrder.indexOf(id);
    return 100 - index;
  };

  const activeTasks = Object.entries(openWindows)
    .filter(([_, isOpen]) => isOpen)
    .map(([id]) => ({
      id,
      title: getWindowTitle(id),
    }));

  function getWindowTitle(id: string) {
    switch (id) {
      case "main": return "C:\\SYSTEM\\HACK47_OS.EXE";
      case "perks": return "README_FIRST.TXT";
      case "photos": return "HOUSE_PHOTOS.EXE";
      case "error": return "System Error";
      case "soul": return "⚠ SELL_YOUR_SOUL.EXE";
      case "team": return "ARCHDEMONS.SYS";
      case "residents": return "RESIDENTS.DAT";
      case "specs": return "SYSTEM_SPECS.INF";
      case "network": return "NETWORK_NEIGHBORHOOD.EXE";
      case "cities": return "NEXT_NODES.EXE";
      case "news": return "NEWS_SIGNAL.EXE";
      case "sponsors": return "POWER_SUPPLY.INI";
      case "offgrid": return "OFFGRID.EXE";
      case "contact": return "HELPDESK.EXE";
      default: return id;
    }
  }

  return (
    <div
      ref={desktopRef}
      className="desktop-environment relative w-full h-screen bg-[#008080] overflow-hidden font-win"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1603437873662-dc1f44901825?auto=format&w=2000&q=80&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dynamic Clouds & Nature */}
      <NatureLayer />

      <img
        src={SUN_SVG}
        className="sun-element absolute top-4 right-4 w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 z-5 drop-shadow-[0_0_40px_#FAFF00] animate-pulse pointer-events-none"
        alt="Heraldic Sun"
      />

      {/* Desktop Icons — two columns, each app with its own colored tile */}
      <div className="desktop-icons absolute top-4 left-3 grid grid-cols-2 gap-x-1 gap-y-3 w-[176px] z-20">
        <DesktopIcon icon={Monitor} tile="bg-[#000080]" label="My Computer" onClick={() => toggleWindow("specs", true)} />
        <DesktopIcon icon={Trash2} tile="bg-[#008000]" label="Recycle Bin" onClick={() => alert("Emptying bin...")} />
        <DesktopIcon icon={Skull} tile="bg-[#8b0000]" label="The Devils" onClick={() => toggleWindow("team", true)} />
        <DesktopIcon icon={Folder} tile="bg-[#0058ee]" label="House_Photos" onClick={() => toggleWindow("photos", true)} />
        <DesktopIcon icon={Users} tile="bg-[#006400]" label="Residents" onClick={() => toggleWindow("residents", true)} />
        <DesktopIcon icon={Globe} tile="bg-[#0000cc]" label="The Web" onClick={() => toggleWindow("network", true)} />
        <DesktopIcon icon={MapPin} tile="bg-[#008080]" label="Next Nodes" onClick={() => toggleWindow("cities", true)} />
        <DesktopIcon icon={Newspaper} tile="bg-[#cc0000]" label="News Signal" onClick={() => toggleWindow("news", true)} />
        <DesktopIcon icon={Zap} tile="bg-[#4a0080]" label="Power Supply" onClick={() => toggleWindow("sponsors", true)} />
        <DesktopIcon icon={Ticket} tile="bg-[#8b6914]" label="Offgrid" onClick={() => toggleWindow("offgrid", true)} />
        <DesktopIcon icon={Mail} tile="bg-[#006666]" label="Helpdesk" onClick={() => toggleWindow("contact", true)} />
      </div>

      {/* ═══════ WINDOWS (2×2 grid, never overlapping) ═══════ */}

      {openWindows.main && (
        <WinWindow
          id="main"
          title="C:\SYSTEM\HACK47_OS.EXE"
          startX={layout.main.x}
          startY={layout.main.y}
          className="w-[45vw] min-w-[260px] max-w-[520px]"
          isActive={windowOrder[0] === "main"}
          zIndex={getZIndex("main")}
          onActivate={() => bringToFront("main")}
          onClose={() => toggleWindow("main", false)}
          floating={true}
        >
          <div className="p-3 md:p-4">
            <h1 className="font-syne text-[clamp(36px,7vw,100px)] leading-none tracking-tighter text-black uppercase mb-3 select-none whitespace-nowrap">
              HACK<a href="https://en.wikipedia.org/wiki/Indian_independence_movement" target="_blank" rel="noopener noreferrer" className="hover:text-electric-yellow hover:bg-black px-0.5 transition-colors duration-200 cursor-pointer">47</a>
            </h1>
            <div className="bg-black text-electric-yellow p-2 md:p-3 font-mono text-[9px] md:text-[11px] mb-3 border-l-4 border-electric-yellow">
              <p>&gt; INITIALIZING DELHI&apos;S FIRST HACKER HOUSE...</p>
              <p>&gt; STATUS: PURE CHAOS DETECTED</p>
              <p>&gt; LOCATION: DELHI VILLA</p>
              <p>&gt; SEPT 15 - OCT 15</p>
              <p>&gt; NEXT NODE: TBD — INDIA IS THE NETWORK</p>
            </div>
            <p className="font-serif italic text-[clamp(11px,1.3vw,18px)] text-gray-700 leading-snug border-l-4 border-gray-300 pl-2">
              &quot;A 30-day residency for 16 builders who care more about their Git history than their sleep schedule.&quot;
            </p>
          </div>
        </WinWindow>
      )}

      {openWindows.perks && (
        <WinWindow
          id="perks"
          title="README_FIRST.TXT"
          startX={layout.perks.x}
          startY={layout.perks.y}
          className="w-[40vw] min-w-[220px] max-w-[320px]"
          titleBarClassName="bg-[#800000]"
          isActive={windowOrder[0] === "perks"}
          zIndex={getZIndex("perks")}
          onActivate={() => bringToFront("perks")}
          onClose={() => toggleWindow("perks", false)}
          floating={true}
        >
          <div className="p-3 font-mono text-[11px] text-black">
            <p className="font-bold underline mb-3 uppercase">HOUSE PROTOCOLS:</p>
            <ul className="space-y-3 mb-4">
              <li className="text-black">- <span className="font-bold">LAUNDRY.SYS</span>: We wash the socks. You build the robots.</li>
              <li className="text-black">- <span className="font-bold">FOOD.EXE</span>: High-protein fuel. Optimized for latency.</li>
              <li className="text-black">- <span className="font-bold">SLEEP.DLL</span>: Optional. Not recommended during demo day.</li>
            </ul>
            <div className="p-3 border-2 border-dashed border-red-500 bg-red-50/70">
              <p className="text-[11px] leading-relaxed text-black">Highly addictive environment. May cause sudden career pivots.</p>
            </div>
          </div>
        </WinWindow>
      )}

      {openWindows.photos && (
        <WinWindow
          id="photos"
          title="HOUSE_PHOTOS.EXE"
          startX={layout.photos.x}
          startY={layout.photos.y}
          className="w-[40vw] min-w-[220px] max-w-[360px]"
          isActive={windowOrder[0] === "photos"}
          zIndex={getZIndex("photos")}
          onActivate={() => bringToFront("photos")}
          onClose={() => toggleWindow("photos", false)}
          floating={true}
        >
          <HousePhotosGallery />
        </WinWindow>
      )}

      {openWindows.error && (
        <WinWindow
          id="error"
          title="System Error"
          startX={layout.error.x}
          startY={layout.error.y}
          className="w-[38vw] min-w-[220px] max-w-[300px]"
          titleBarClassName="bg-[#808080]"
          isActive={windowOrder[0] === "error"}
          zIndex={getZIndex("error")}
          onActivate={() => bringToFront("error")}
          onClose={() => toggleWindow("error", false)}
          floating={true}
        >
          <div className="p-3 flex gap-3 items-start">
            <AlertTriangle className="w-7 h-7 text-yellow-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-800">404: Tribe Not Found?</p>
              <p className="text-[11px] mt-1 text-gray-600 leading-relaxed">
                If you can&apos;t find your tribe in the wild, you must build one at Hack47. Delhi is waiting for your next big thing.
              </p>
              <button
                onClick={() => toggleWindow("error", false)}
                className="mt-3 bg-win-grey win-border-outset px-5 py-1 text-xs font-bold active:translate-x-px active:translate-y-px hover:brightness-105"
              >
                OK
              </button>
            </div>
          </div>
        </WinWindow>
      )}

      {/* ═══════ SELL YOUR SOUL — center CTA ═══════ */}

      {openWindows.soul && (
        <WinWindow
          id="soul"
          title="⚠ SELL_YOUR_SOUL.EXE"
          startX={layout.soul.x}
          startY={layout.soul.y}
          className="w-[32vw] min-w-[250px] max-w-[300px]"
          titleBarClassName="bg-[#cc0000]"
          isActive={windowOrder[0] === "soul"}
          zIndex={getZIndex("soul")}
          onActivate={() => bringToFront("soul")}
          onClose={() => toggleWindow("soul", false)}
          floating={true}
        >
          <div className="p-4 text-center font-mono">
            <p className="text-xl font-bold mb-2">👹</p>
            <p className="font-bold text-sm uppercase tracking-wide mb-2">SELL US YOUR SOUL</p>
            <p className="text-[10px] text-gray-600 mb-4 leading-relaxed">
              30 days. No distractions. Pure building.<br />
              In exchange, we take your soul (and your sleep schedule).
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-red-600 text-white py-2 font-bold text-xs uppercase tracking-wider hover:bg-red-700 active:translate-y-px transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.3)]"
            >
              ✦ I ACCEPT — APPLY NOW ✦
            </button>
            <p className="text-[8px] text-gray-400 mt-2 italic">Terms: No refunds on sleep lost.</p>
          </div>
        </WinWindow>
      )}

      {/* ═══════ EXTRA WINDOWS (open from desktop icons) ═══════ */}

      {openWindows.team && (
        <WinWindow
          id="team"
          title="ARCHDEMONS.SYS"
          startX={layout.team.x}
          startY={layout.team.y}
          className="w-[40vw] min-w-[280px] max-w-[380px]"
          titleBarClassName="bg-[#4a0000]"
          isActive={windowOrder[0] === "team"}
          zIndex={getZIndex("team")}
          onActivate={() => bringToFront("team")}
          onClose={() => toggleWindow("team", false)}
          floating={true}
        >
          <TheDevils />
        </WinWindow>
      )}

      {openWindows.residents && (
        <WinWindow
          id="residents"
          title="RESIDENTS.DAT"
          startX={layout.residents.x}
          startY={layout.residents.y}
          className="w-[36vw] min-w-[240px] max-w-[300px]"
          titleBarClassName="bg-[#006400]"
          isActive={windowOrder[0] === "residents"}
          zIndex={getZIndex("residents")}
          onActivate={() => bringToFront("residents")}
          onClose={() => toggleWindow("residents", false)}
          floating={true}
        >
          <ResidentsPanel />
        </WinWindow>
      )}

      {openWindows.specs && (
        <WinWindow
          id="specs"
          title="SYSTEM_SPECS.INF"
          startX={layout.specs.x}
          startY={layout.specs.y}
          className="w-[36vw] min-w-[230px] max-w-[290px]"
          isActive={windowOrder[0] === "specs"}
          zIndex={getZIndex("specs")}
          onActivate={() => bringToFront("specs")}
          onClose={() => toggleWindow("specs", false)}
          floating={true}
        >
          <SystemSpecs />
        </WinWindow>
      )}

      {/* ═══════ NEW WINDOWS — network, cities, news, sponsors, offgrid, contact ═══════ */}

      {openWindows.network && (
        <WinWindow
          id="network"
          title="NETWORK_NEIGHBORHOOD.EXE"
          startX={layout.network.x}
          startY={layout.network.y}
          className="w-[36vw] min-w-[240px] max-w-[300px]"
          isActive={windowOrder[0] === "network"}
          zIndex={getZIndex("network")}
          onActivate={() => bringToFront("network")}
          onClose={() => toggleWindow("network", false)}
          floating={false}
        >
          <NetworkNeighborhood />
        </WinWindow>
      )}

      {openWindows.cities && (
        <WinWindow
          id="cities"
          title="NEXT_NODES.EXE"
          startX={layout.cities.x}
          startY={layout.cities.y}
          className="w-[40vw] min-w-[260px] max-w-[330px]"
          titleBarClassName="bg-[#006400]"
          isActive={windowOrder[0] === "cities"}
          zIndex={getZIndex("cities")}
          onActivate={() => bringToFront("cities")}
          onClose={() => toggleWindow("cities", false)}
          floating={false}
        >
          <CitiesPanel />
        </WinWindow>
      )}

      {openWindows.news && (
        <WinWindow
          id="news"
          title="NEWS_SIGNAL.EXE"
          startX={layout.news.x}
          startY={layout.news.y}
          className="w-[44vw] min-w-[300px] max-w-[400px]"
          titleBarClassName="bg-[#000080]"
          isActive={windowOrder[0] === "news"}
          zIndex={getZIndex("news")}
          onActivate={() => bringToFront("news")}
          onClose={() => toggleWindow("news", false)}
          floating={false}
        >
          <NewsPanel />
        </WinWindow>
      )}

      {openWindows.sponsors && (
        <WinWindow
          id="sponsors"
          title="POWER_SUPPLY.INI"
          startX={layout.sponsors.x}
          startY={layout.sponsors.y}
          className="w-[36vw] min-w-[240px] max-w-[310px]"
          titleBarClassName="bg-[#4a0080]"
          isActive={windowOrder[0] === "sponsors"}
          zIndex={getZIndex("sponsors")}
          onActivate={() => bringToFront("sponsors")}
          onClose={() => toggleWindow("sponsors", false)}
          floating={false}
        >
          <SponsorsPanel />
        </WinWindow>
      )}

      {openWindows.offgrid && (
        <WinWindow
          id="offgrid"
          title="OFFGRID.EXE"
          startX={layout.offgrid.x}
          startY={layout.offgrid.y}
          className="w-[36vw] min-w-[250px] max-w-[320px]"
          titleBarClassName="bg-[#8b6914]"
          isActive={windowOrder[0] === "offgrid"}
          zIndex={getZIndex("offgrid")}
          onActivate={() => bringToFront("offgrid")}
          onClose={() => toggleWindow("offgrid", false)}
          floating={false}
        >
          <OffgridPanel />
        </WinWindow>
      )}

      {openWindows.contact && (
        <WinWindow
          id="contact"
          title="HELPDESK.EXE"
          startX={layout.contact.x}
          startY={layout.contact.y}
          className="w-[36vw] min-w-[240px] max-w-[300px]"
          titleBarClassName="bg-[#008080]"
          isActive={windowOrder[0] === "contact"}
          zIndex={getZIndex("contact")}
          onActivate={() => bringToFront("contact")}
          onClose={() => toggleWindow("contact", false)}
          floating={false}
        >
          <ContactPanel />
        </WinWindow>
      )}

      {/* Clippy Buddy */}
      <div className="absolute bottom-11 right-4 z-[9000]">
        <div className={cn(
          "absolute bottom-full right-0 mb-3 w-44 p-2.5 bg-[#ffffcc] border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.3)] text-[10px] leading-snug transition-all duration-300 origin-bottom-right pointer-events-none",
          clippyVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}>
          <p className="text-black font-mono">It looks like you&apos;re trying to build the next big thing. Need a spot at Hack47?</p>
          <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black" />
        </div>
        <img
          src={SHIELD_SVG}
          className="w-11 h-11 cursor-pointer contrast-200 grayscale brightness-200 hover:scale-110 active:scale-95 transition-all"
          style={{ filter: "hue-rotate(90deg) brightness(2.5)" }}
          onClick={() => setClippyVisible((v) => !v)}
          alt="Clippy Buddy"
        />
      </div>

      {/* ═══════ TYPEFORM OVERLAY ═══════ */}
      {showForm && <SoulForm onClose={() => setShowForm(false)} />}

      <Taskbar
        activeTasks={activeTasks}
        onTaskClick={(id) => { toggleWindow(id, true); bringToFront(id); }}
        onStartClick={() => toggleWindow("error", true)}
      />
    </div>
  );
}

// ─── Network Neighborhood (social links app) ────────────────────────────────

function NetworkNeighborhood() {
  return (
    <div className="p-3 font-mono">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-gray-700">&gt; SELECT A CHANNEL</p>
        <span className="text-[8px] text-green-600 font-bold animate-pulse">● 3 CHANNELS ONLINE</span>
      </div>
      <div className="space-y-2">
        {SOCIALS.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-win-grey win-border-outset px-2.5 py-2 hover:brightness-105 active:translate-x-px active:translate-y-px transition-all"
          >
            <span className="w-7 h-7 bg-white win-border-inset flex items-center justify-center text-sm shrink-0">
              {s.icon}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-black uppercase">{s.label}</span>
              <span className="block text-[8px] text-gray-600 truncate">{s.handle}</span>
            </span>
            <span className="text-[10px] text-black font-bold">↗</span>
          </a>
        ))}
      </div>
      <p className="text-[8px] text-gray-500 italic mt-2">
        Establish connection. No viruses detected (probably).
      </p>
    </div>
  );
}

// ─── Next Nodes (cities) ────────────────────────────────────────────────────

function CitiesPanel() {
  return (
    <div className="p-3 font-mono text-[10px]">
      <div className="flex justify-between items-center mb-2">
        <p className="font-bold text-gray-800">INDIA NODE MAP</p>
        <span className="text-[8px] font-bold text-green-600 animate-pulse">● DELHI NODE LIVE</span>
      </div>
      <div className="space-y-1">
        {CITIES.map((c) => (
          <div key={c.name} className="flex items-center justify-between border border-gray-200 bg-[#f8f8f8] px-2 py-1.5">
            <div className="pr-2 min-w-0">
              <p className="font-bold text-[10px]">
                {c.icon} {c.name}
              </p>
              <p className="text-[8px] text-gray-500">{c.detail}</p>
            </div>
            <div className="text-right shrink-0">
              <span
                className={cn(
                  "inline-block text-[8px] font-bold px-1.5 py-0.5 border",
                  c.status === "LIVE"
                    ? "text-green-700 border-green-600 bg-green-50"
                    : c.status === "QUEUED"
                      ? "text-yellow-700 border-yellow-600 bg-yellow-50"
                      : "text-gray-500 border-gray-400 bg-gray-100"
                )}
              >
                {c.status}
              </span>
              <p className="text-[7px] text-gray-400 mt-0.5">{c.statusText}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-gray-500 italic mt-2">
        Node announcements drop on X + LinkedIn first. Follow to know when your city goes live.
      </p>
    </div>
  );
}

// ─── News Signal (press + feeds) ────────────────────────────────────────────

const NEWS_TABS = [
  { id: "press", label: "PRESS" },
  { id: "x", label: "X FEED" },
  { id: "linkedin", label: "LINKEDIN" },
] as const;

function NewsPanel() {
  const [tab, setTab] = useState<(typeof NEWS_TABS)[number]["id"]>("press");
  const feed = useFeedData();

  return (
    <div className="p-2 font-mono">
      <div className="flex items-end gap-0 px-1">
        {NEWS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-3 py-1 text-[9px] font-bold border border-gray-400 -mb-px transition-colors",
              tab === t.id
                ? "bg-white border-b-white relative z-10 text-black"
                : "bg-[#d4d0c8] text-gray-500 hover:bg-[#e0ddd5]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-400 p-2 min-h-[190px] max-h-[320px] overflow-y-auto">
        {tab === "press" && <PressTab />}
        {tab === "x" && <XFeedTab posts={feed.x} />}
        {tab === "linkedin" && <LinkedInFeedTab posts={feed.linkedin} />}
      </div>
      <p className="text-[7px] text-gray-400 mt-1.5 px-1">
        LAST SYNC: {formatSyncIST(feed.updated)} · FEED: @hack47org + /company/hack47
      </p>
    </div>
  );
}

function PressTab() {
  const feed = useFeedData();
  const m = feed.mint;
  return (
    <a
      href={m.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-black text-white p-3 border-2 border-yellow-500/60 hover:border-yellow-400 transition-colors"
    >
      <p className="text-[8px] font-bold text-yellow-400 tracking-widest mb-1 uppercase">
        ★ Featured in The Mint — {m.date}
      </p>
      <p className="text-[11px] font-bold leading-snug mb-2">{m.title}</p>
      <p className="text-[9px] text-gray-400 italic leading-relaxed">{m.snippet}</p>
      <p className="text-[9px] text-yellow-400 mt-2 font-bold">READ ARTICLE ↗</p>
    </a>
  );
}

function PostCard({ post, platform }: { post: FeedPost; platform: "x" | "linkedin" }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-300 bg-[#f8f8f8] p-2 mb-2 hover:bg-[#fffbe6] transition-colors last:mb-0"
    >
      <div className="flex justify-between items-center mb-1">
        <p className="text-[9px] font-bold text-gray-800">
          {post.author} <span className="text-gray-400 font-normal">· {post.role}</span>
        </p>
        <span className="text-[8px] text-gray-400 shrink-0 ml-2">{post.date}</span>
      </div>
      <p className="text-[9px] text-gray-600 leading-snug line-clamp-4">{post.text}</p>
      <p className="text-[8px] font-bold mt-1 text-blue-700">
        OPEN ON {platform === "x" ? "X" : "LINKEDIN"} ↗
      </p>
    </a>
  );
}

function XFeedTab({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center p-4">
        <p className="text-2xl mb-2">🕊️</p>
        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-1">
          NO_SIGNAL
        </p>
        <p className="text-[9px] text-gray-500 leading-relaxed max-w-[220px] mb-3">
          0 posts detected on @hack47org. The birds haven&apos;t landed yet.
        </p>
        <a
          href="https://x.com/hack47org"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-win-grey win-border-outset px-4 py-1.5 text-[10px] font-bold text-black hover:brightness-105 active:translate-x-px active:translate-y-px"
        >
          FOLLOW ON X ↗
        </a>
      </div>
    );
  }
  return (
    <div>
      {posts.map((p, i) => (
        <PostCard key={i} post={p} platform="x" />
      ))}
    </div>
  );
}

function LinkedInFeedTab({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center p-4">
        <p className="text-2xl mb-2">💼</p>
        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-1">
          NO_SIGNAL
        </p>
        <p className="text-[9px] text-gray-500 leading-relaxed max-w-[220px] mb-3">
          No posts detected on /company/hack47.
        </p>
        <a
          href="https://www.linkedin.com/company/hack47"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-win-grey win-border-outset px-4 py-1.5 text-[10px] font-bold text-black hover:brightness-105 active:translate-x-px active:translate-y-px"
        >
          FOLLOW ON LINKEDIN ↗
        </a>
      </div>
    );
  }
  return (
    <div>
      {posts.map((p, i) => (
        <PostCard key={i} post={p} platform="linkedin" />
      ))}
    </div>
  );
}

// ─── Power Supply (sponsors) ────────────────────────────────────────────────

function SponsorsPanel() {
  return (
    <div className="p-3 font-mono text-[10px]">
      <p className="font-bold text-gray-800 mb-2 underline">POWER SUPPLY — INSTALLED DRIVERS</p>
      <div className="space-y-2">
        <div className="border border-gray-300 bg-[#f8f8f8] p-2">
          <div className="flex justify-between items-center mb-1.5">
            <p className="font-bold text-[10px] text-red-700">DRIVER 01 — RED BULL</p>
            <span className="text-[8px] text-green-600 font-bold">OVERCLOCKED</span>
          </div>
          <img src="/sponsors/redbull.png" alt="Red Bull" className="h-9 w-auto mb-1" />
          <p className="text-[8px] text-gray-500">FUEL.SYS — Liquid horsepower for the chaos engine.</p>
        </div>
        <div className="border border-gray-300 bg-[#f8f8f8] p-2">
          <div className="flex justify-between items-center mb-1.5">
            <p className="font-bold text-[10px] text-gray-800">DRIVER 02 — OPENAI</p>
            <span className="text-[8px] text-green-600 font-bold">LOADED</span>
          </div>
          <img src="/sponsors/openai.png" alt="OpenAI" className="h-6 w-auto mb-1" />
          <p className="text-[8px] text-gray-500">GPT.DLL — Compute credits for every builder in the house.</p>
        </div>
      </div>
      <p className="text-[8px] text-gray-500 italic mt-2">
        Want to power the machine? → hello@hack47.org
      </p>
    </div>
  );
}

// ─── Offgrid (golden ticket) ────────────────────────────────────────────────

const OFFGRID_URL = "https://hack47-offgrid.devpost.com/";

function OffgridPanel() {
  return (
    <div className="p-3 font-mono">
      <div className="border-2 border-yellow-600/70 bg-gradient-to-b from-[#2a2000] to-[#0d0a00] p-3 relative overflow-hidden">
        <div className="flex justify-between text-[8px] font-bold text-yellow-600 tracking-widest mb-2">
          <span>OFFGRID.EXE</span>
          <span>VIRTUAL HACKATHON</span>
        </div>
        <p className="font-anton text-2xl text-yellow-400 uppercase leading-none mb-1">
          Golden
          <br />
          Ticket
        </p>
        <p className="text-[9px] text-yellow-100/70 leading-relaxed mb-3">
          30 days. Fully remote. Pure chaos. Win Offgrid and get a{" "}
                    <span className="text-yellow-300 font-bold">guaranteed seat</span> in the next Hack47
                    cohort.
        </p>
        <a
          href={OFFGRID_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-yellow-500 text-black font-bold text-[10px] uppercase py-2 win-border-outset hover:brightness-110 active:translate-y-px"
        >
          ✦ ENTER THE ARENA ↗
        </a>
        <p className="text-[8px] text-yellow-700/60 mt-1.5 text-center italic">
          One winner. One seat. The next cohort is waiting.
        </p>
      </div>
    </div>
  );
}

// ─── Helpdesk (contact) ─────────────────────────────────────────────────────

function ContactPanel() {
  return (
    <div className="p-3 font-mono">
      <p className="text-[10px] font-bold text-gray-700 mb-2">&gt; SUMMON AN ORGANIZER</p>
      <a
        href={`mailto:${CONTACT.email}`}
        className="flex items-center gap-2 bg-win-grey win-border-outset px-2.5 py-2 mb-2 hover:brightness-105 active:translate-x-px active:translate-y-px transition-all"
      >
        <span className="w-7 h-7 bg-white win-border-inset flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-black" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[8px] text-gray-600 uppercase font-bold">Email</span>
          <span className="block text-[11px] font-bold text-black truncate">{CONTACT.email}</span>
        </span>
        <span className="text-[10px] text-black font-bold">↗</span>
      </a>
      <a
        href={`tel:${CONTACT.phoneRaw}`}
        className="flex items-center gap-2 bg-win-grey win-border-outset px-2.5 py-2 hover:brightness-105 active:translate-x-px active:translate-y-px transition-all"
      >
        <span className="w-7 h-7 bg-white win-border-inset flex items-center justify-center shrink-0">
          <Phone className="w-4 h-4 text-black" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[8px] text-gray-600 uppercase font-bold">Phone / WhatsApp</span>
          <span className="block text-[11px] font-bold text-black truncate">{CONTACT.phone}</span>
        </span>
        <span className="text-[10px] text-black font-bold">↗</span>
      </a>
      <p className="text-[8px] text-gray-500 italic mt-2">
        Response time: 24-48h. Faster if you bribe us with chai.
      </p>
    </div>
  );
}

// ─── House Photos Gallery ────────────────────────────────────────────────────

const HOUSE_PHOTOS = [
  { src: "https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?auto=format&w=600&q=80&fit=crop", caption: "View from the 'Thinking Spot'. Birds included." },
  { src: "https://images.pexels.com/photos/19977288/pexels-photo-19977288.jpeg?auto=compress&cs=tinysrgb&w=600&q=80", caption: "The Arena. Where 4AM brainwaves happen." },
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=600&q=80", caption: "Common area. Whiteboards > walls." },
  { src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&w=600&q=80", caption: "The workspace. Dual monitors provided." },
];

function HousePhotosGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const next = () => setCurrentIndex((i) => (i + 1) % HOUSE_PHOTOS.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + HOUSE_PHOTOS.length) % HOUSE_PHOTOS.length);
  const photo = HOUSE_PHOTOS[currentIndex];

  return (
    <div>
      <img src={photo.src} className="w-full h-[140px] object-cover" alt={photo.caption} />
      <div className="flex items-center justify-between px-2 py-1.5 bg-gray-100 border-t border-gray-200">
        <button onClick={prev} className="px-2 py-0.5 bg-win-grey win-border-outset text-[10px] font-bold active:translate-x-px active:translate-y-px">◀ Prev</button>
        <span className="text-[10px] font-mono text-gray-500">{currentIndex + 1} / {HOUSE_PHOTOS.length}</span>
        <button onClick={next} className="px-2 py-0.5 bg-win-grey win-border-outset text-[10px] font-bold active:translate-x-px active:translate-y-px">Next ▶</button>
      </div>
      <p className="px-2 py-1.5 text-[9px] font-mono italic text-gray-600 bg-gray-50 border-t border-gray-200">{photo.caption}</p>
    </div>
  );
}

// ─── The Devils (Team) ───────────────────────────────────────────────────────

function TheDevils() {
  return (
    <div className="p-4 font-mono bg-[#ffffff]">
      <div className="text-center mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-red-700 mb-1">👹 THE ARCHDEMONS 👹</p>
        <p className="text-[9px] text-gray-500 italic">The ones who summoned this chaos into existence</p>
      </div>

      <div className="space-y-4">
        <DevilRow
          name="Rishul Chanana"
          role="Archdemon I"
          img="/rishul.jpeg"
          links={[
            { label: "LinkedIn ↗", url: "https://www.linkedin.com/in/rishul-chanana/" },
            { label: "𝕏 ↗", url: "https://x.com/rishhul" },
          ]}
        />
        <DevilRow
          name="Pratyush Pandey"
          role="Archdemon II"
          img="/pratyush.jpeg"
          links={[
            { label: "LinkedIn ↗", url: "https://www.linkedin.com/in/pratyush-pandey-09b35b219" },
            { label: "𝕏 ↗", url: "https://x.com/P_Pratyush7" },
          ]}
        />
        <DevilRow
          name="Raghwender Vasisth"
          role="Archdemon III"
          initials="RV"
          links={[
            { label: "LinkedIn ↗", url: "https://www.linkedin.com/in/raghwender-vasist" },
            { label: "𝕏 ↗", url: "https://x.com/Hawthorn_thinks" },
            { label: "IG ↗", url: "https://www.instagram.com/hawthorn_laments" },
          ]}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-gray-300 text-center">
        <p className="text-[8px] text-gray-400 italic">These three traded their souls first. Now they collect yours.</p>
      </div>
    </div>
  );
}

// ─── Residents Panel ─────────────────────────────────────────────────────────

function ResidentsPanel() {
  const filled = 0;
  const total = 16;

  return (
    <div className="p-3 font-mono text-[10px]">
      <p className="font-bold mb-2">RESIDENT SLOTS — BATCH #001</p>
      <div className="mb-3">
        <div className="flex justify-between text-[9px] mb-1">
          <span>Capacity</span>
          <span className="font-bold text-green-600">ALL {total} SLOTS OPEN</span>
        </div>
        <div className="w-full h-4 bg-gray-200 border border-gray-400">
          <div className="h-full bg-green-500 transition-all" style={{ width: `0%` }} />
        </div>
      </div>
      <div className="space-y-1 text-[9px] mb-3">
        <p className="text-gray-400">░░░░░░░░░░░░░░░░ {total} spots available</p>
        <p className="text-green-600 font-bold">First come, first served.</p>
      </div>
      <div className="border-t border-gray-300 pt-2 text-[9px]">
        <p className="mb-1">No residents yet. Be the first.</p>
        <p className="text-gray-500 italic">Applications open now.</p>
      </div>
    </div>
  );
}

// ─── Soul Form (Typeform-style) ──────────────────────────────────────────────

const FORM_QUESTIONS = [
  { id: "name", label: "What do they call you, mortal?", type: "text", placeholder: "Your full name" },
  { id: "email", label: "Your email. We need a way to summon you.", type: "email", placeholder: "soul@builder.dev" },
  { id: "phone", label: "Phone number. For when the WiFi dies and demons need to reach you.", type: "tel", placeholder: "+91 ..." },
  { id: "instagram", label: "Your Instagram. We want to see your life before we consume it.", type: "text", placeholder: "@your_handle" },
  { id: "linkedin", label: "LinkedIn — show us the professional mask you wear.", type: "text", placeholder: "linkedin.com/in/..." },
  { id: "twitter", label: "X (Twitter) — where your real thoughts live.", type: "text", placeholder: "@handle or x.com/..." },
  { id: "brag", label: "BRAG SHEET — This is your altar. Lay down every offering: projects shipped, hackathons won, repos that slap, startups launched, communities built. Attach links. Be shameless.", type: "textarea", placeholder: "I built a...\ngithub.com/...\ntwitter.com/...\nproducthunt.com/..." },
  { id: "icecream", label: "The most important question of your life: What is the BEST ice cream flavor?", type: "text", placeholder: "Choose wisely. This matters more than your resume." },
  { id: "failure", label: "What's the biggest failure you've experienced? What was the most breaking point of your life — the moment everything crumbled? And how did you crawl back?", type: "textarea", placeholder: "The devil respects honesty..." },
  { id: "caffeine", label: "How do you take your caffeine? The devil needs to know your poison. ☕", type: "text", placeholder: "Black coffee at 3AM? Chai? Monster Energy? IV drip?" },
  { id: "food", label: "House vibes: What food do you prefer? Dietary restrictions? Favorite late-night sin? Drink of choice when the code finally works?", type: "textarea", placeholder: "Veg/non-veg, midnight Maggi, celebratory drink..." },
  { id: "funding", label: "Would you like to live at Hack47 completely free, or would you be open to contributing some funds? (Your answer does NOT affect your application. Zero impact. We're just asking.)", type: "mcq", placeholder: "", options: ["Completely free — I'm broke and building", "I can chip in a little", "Happy to contribute meaningfully", "Money's not an issue — just let me in"] },
];

function SoulForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const questionRef = useRef<HTMLDivElement>(null);

  const q = FORM_QUESTIONS[step];
  const isLast = step === FORM_QUESTIONS.length - 1;
  const currentValue = answers[q?.id] || "";

  // Animate question transitions
  useEffect(() => {
    if (questionRef.current && !submitted) {
      gsap.fromTo(questionRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [step, submitted]);

  // Validation per field
  function validate(id: string, value: string): string | null {
    const v = value.trim();
    if (!v) return "This field is required.";

    switch (id) {
      case "name":
        if (v.length < 2) return "Name must be at least 2 characters.";
        if (v.length > 100) return "Name is too long.";
        if (!/^[a-zA-Z\s'.()-]+$/.test(v)) return "Name contains invalid characters.";
        return null;

      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
        if (v.length > 254) return "Email is too long.";
        return null;

      case "phone":
        const digits = v.replace(/[\s\-().+]/g, "");
        if (!/^\d{7,15}$/.test(digits)) return "Enter a valid phone number (7-15 digits).";
        return null;

      case "instagram":
        if (!/^@?[\w.]+$/.test(v) && !/instagram\.com\/[\w.]+/i.test(v)) {
          return "Enter a valid Instagram handle (@username) or profile URL.";
        }
        return null;

      case "linkedin":
        if (!/linkedin\.com\/in\/[\w-]+/i.test(v) && !/^[\w-]+$/.test(v)) {
          return "Enter a valid LinkedIn profile URL (linkedin.com/in/...).";
        }
        return null;

      case "twitter":
        if (!/^@[\w]+$/.test(v) && !/(x\.com|twitter\.com)\/[\w]+/i.test(v) && !/^[\w]+$/.test(v)) {
          return "Enter a valid X/Twitter handle (@username) or profile URL.";
        }
        return null;

      case "brag":
        if (v.length < 50) return "C'mon, brag more. At least 50 characters. Show us what you've got.";
        if (v.length > 5000) return "Max 5000 characters. Edit it down.";
        return null;

      case "icecream":
        if (v.length < 2) return "Seriously, just name a flavor.";
        if (v.length > 100) return "It's an ice cream flavor, not an essay.";
        return null;

      case "failure":
        if (v.length < 30) return "Give us more than that. At least 30 characters.";
        if (v.length > 5000) return "Max 5000 characters.";
        return null;

      case "caffeine":
        if (v.length < 2) return "Just tell us your poison.";
        if (v.length > 200) return "Keep it under 200 characters.";
        return null;

      case "food":
        if (v.length < 10) return "Tell us a bit more. At least 10 characters.";
        if (v.length > 2000) return "Max 2000 characters.";
        return null;

      case "funding":
        if (!v) return "Pick an option.";
        return null;

      default:
        return null;
    }
  }

  const handleNext = () => {
    const validationError = validate(q.id, currentValue);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    if (isLast) {
      // Bot check: if honeypot field is filled, silently fake success
      if (honeypot) {
        setSubmitted(true);
        return;
      }

      // Prevent double submission
      if (isSubmitting) return;
      setIsSubmitting(true);

      // Submit to Google Sheets
      fetch("https://script.google.com/macros/s/AKfycbxfqO1VrEUves58l8qfU6Jq2sKUwawN4SLBi4TXOOHjO8vpoV7_HMvtocGUiLtLmi7DTA/exec", {
        method: "POST",
        body: JSON.stringify(answers),
      }).catch(() => {});
      setSubmitted(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && q.type !== "textarea" && currentValue.trim()) {
      handleNext();
    }
    if (e.key === "Enter" && e.ctrlKey && q.type === "textarea" && currentValue.trim()) {
      handleNext();
    }
  };

  // Clear error when user types
  const handleChange = (value: string) => {
    setAnswers((a) => ({ ...a, [q.id]: value }));
    if (error) setError("");
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black flex items-start sm:items-center justify-center p-4 py-6 overflow-y-auto">
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at center, #660000 0%, transparent 70%)" }} />
        <div className="text-center font-mono max-w-md relative z-10">
          <p className="text-6xl mb-4 animate-pulse">👹</p>
          <p className="text-red-500 text-2xl font-bold mb-3 uppercase tracking-widest">SOUL RECEIVED.</p>
          <p className="text-red-300/80 text-sm mb-6">Your offering has been accepted. We&apos;ll reach out if your soul is... sufficient.</p>
          <div className="bg-gray-950 border border-red-900/50 p-4 text-[10px] text-red-400/70 mb-6 text-left">
            <p>&gt; Transaction complete</p>
            <p>&gt; Soul integrity: SCANNING...</p>
            <p>&gt; Soul integrity: <span className="text-green-500">VERIFIED</span></p>
            <p>&gt; Added to the queue of the damned</p>
            <p>&gt; Expected response: 48-72 hours</p>
          </div>
          <button
            onClick={onClose}
            className="bg-red-700 text-white px-8 py-2 font-bold text-sm hover:bg-red-600 active:translate-y-px transition-all border border-red-500/50 shadow-[0_0_20px_rgba(200,0,0,0.3)]"
          >
            RETURN TO THE MORTAL REALM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-start sm:items-center justify-center p-4 py-6 overflow-y-auto">
      {/* Dark hellish background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at bottom, #4a0000 0%, transparent 60%)" }} />
      <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at top right, #ff0000 0%, transparent 40%)" }} />

      {/* Floating ember particles (CSS animated) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/60 rounded-full animate-ping"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-lg relative z-10" ref={questionRef}>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-mono text-red-400/60 mb-1.5">
            <span>RITUAL {step + 1} OF {FORM_QUESTIONS.length}</span>
            <span>{Math.round(((step + 1) / FORM_QUESTIONS.length) * 100)}% CONSUMED</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 border border-red-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500 shadow-[0_0_8px_rgba(255,0,0,0.5)]"
              style={{ width: `${((step + 1) / FORM_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <p className="text-white/90 font-mono text-sm md:text-base leading-relaxed mb-5">{q.label}</p>
          {q.type === "mcq" && "options" in q ? (
            <div className="space-y-2">
              {(q as { options: string[] }).options.map((option: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleChange(option)}
                  className={cn(
                    "w-full text-left px-4 py-3 font-mono text-sm border transition-all",
                    currentValue === option
                      ? "border-red-500 bg-red-950/50 text-white shadow-[0_0_10px_rgba(200,0,0,0.2)]"
                      : "border-red-900/30 bg-transparent text-gray-400 hover:border-red-700/50 hover:text-white"
                  )}
                >
                  <span className="text-red-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {option}
                </button>
              ))}
            </div>
          ) : q.type === "textarea" ? (
            <textarea
              autoFocus
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={q.placeholder}
              className={cn(
                "w-full bg-transparent border-b-2 text-white font-mono text-sm p-3 outline-none resize-none h-36 placeholder:text-red-900/50 transition-colors",
                error ? "border-red-500" : "border-red-900/40 focus:border-red-500"
              )}
            />
          ) : (
            <input
              autoFocus
              type={q.type}
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={q.placeholder}
              className={cn(
                "w-full bg-transparent border-b-2 text-white font-mono text-lg p-3 outline-none placeholder:text-red-900/50 transition-colors",
                error ? "border-red-500" : "border-red-900/40 focus:border-red-500"
              )}
            />
          )}
          {error && (
            <p className="text-red-400 text-[11px] mt-2 font-mono animate-pulse">⚠ {error}</p>
          )}
          {!error && q.type === "textarea" && (
            <p className="text-[9px] text-red-800/60 mt-1.5 font-mono">Ctrl+Enter to proceed deeper</p>
          )}
        </div>

        {/* Honeypot - hidden from humans, bots fill it */}
        <input
          type="text"
          name="website_url"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
          aria-hidden="true"
        />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-1.5 bg-gray-900 text-red-300/70 font-mono text-xs border border-red-900/30 hover:border-red-700/50 hover:text-red-200 transition-colors"
              >
                ← BACK
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-gray-700 font-mono text-xs hover:text-gray-400 transition-colors"
            >
              FLEE
            </button>
          </div>
          <button
            onClick={handleNext}
            disabled={!currentValue.trim() || isSubmitting}
            className="px-6 py-2 bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-20 disabled:cursor-not-allowed hover:bg-red-600 active:translate-y-px transition-all border border-red-500/30 shadow-[0_0_15px_rgba(200,0,0,0.2)]"
          >
            {isSubmitting ? "SUBMITTING..." : isLast ? "🔥 SUBMIT SOUL" : "NEXT →"}
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-[9px] text-red-900/50 font-mono mt-8 text-center">
          {q.type !== "textarea" ? "Press Enter ↵ to descend further" : ""}
        </p>
      </div>
    </div>
  );
}

// ─── System Specs ────────────────────────────────────────────────────────────

function SystemSpecs() {
  return (
    <div className="p-3 font-mono text-[10px]">
      <p className="font-bold text-gray-800 mb-2 underline">HACK47 HOUSE — DEVICE MANAGER</p>
      <div className="space-y-2 text-[9px]">
        <div className="border-b border-gray-200 pb-1.5">
          <p className="font-bold text-blue-700">📍 LOCATION</p>
          <p className="text-gray-600 pl-3">Delhi, Premium Villa</p>
          <p className="text-gray-600 pl-3">4BHK + Terrace + Garden</p>
        </div>
        <div className="border-b border-gray-200 pb-1.5">
          <p className="font-bold text-green-700">🖥 COMPUTE</p>
          <p className="text-gray-600 pl-3">Desks: 16 (ergonomic)</p>
          <p className="text-gray-600 pl-3">Monitors: Available on request</p>
          <p className="text-gray-600 pl-3">Power backup: 24/7 inverter</p>
        </div>
        <div className="border-b border-gray-200 pb-1.5">
          <p className="font-bold text-purple-700">📡 NETWORK</p>
          <p className="text-gray-600 pl-3">WiFi: 1Gbps Symmetric Fiber</p>
          <p className="text-gray-600 pl-3">Backup: 4G failover</p>
          <p className="text-gray-600 pl-3">Latency: &lt;5ms to AWS Mumbai</p>
        </div>
        <div className="border-b border-gray-200 pb-1.5">
          <p className="font-bold text-orange-700">☕ FUEL SYSTEM</p>
          <p className="text-gray-600 pl-3">RAM: Unlimited chai & coffee</p>
          <p className="text-gray-600 pl-3">Storage: 3 meals/day (high protein)</p>
          <p className="text-gray-600 pl-3">Cache: Snack bar 24/7</p>
        </div>
        <div>
          <p className="font-bold text-red-700">🌅 GPU (Graphics)</p>
          <p className="text-gray-600 pl-3">Delhi sunset view</p>
          <p className="text-gray-600 pl-3">Resolution: 4K terrace panorama</p>
          <p className="text-gray-600 pl-3">Refresh rate: Every evening</p>
        </div>
      </div>
    </div>
  );
}

// ─── Nature Layer ────────────────────────────────────────────────────────────

function NatureLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<{
    clouds: { id: number; src: string; width: number; top: number; startX: number }[];
    birds: { id: number; top: number }[];
    flowers: { id: number; bottom: number; left: number }[];
  }>({ clouds: [], birds: [], flowers: [] });

  useEffect(() => {
    const newClouds = [...Array(12)].map((_, i) => ({
      id: i,
      src: CLOUD_URLS[i % 2],
      width: 120 + Math.random() * 280,
      top: -5 + Math.random() * 75,
      startX: -20 + Math.random() * 110,
    }));

    const newBirds = [...Array(5)].map((_, i) => ({
      id: i,
      top: 10 + Math.random() * 50,
    }));

    const newFlowers = [...Array(8)].map((_, i) => ({
      id: i,
      bottom: Math.random() * 80,
      left: Math.random() * 100,
    }));

    setElements({ clouds: newClouds, birds: newBirds, flowers: newFlowers });
  }, []);

  useEffect(() => {
    if (!containerRef.current || elements.clouds.length === 0) return;

    const clouds = containerRef.current.querySelectorAll(".cloud");
    const birds = containerRef.current.querySelectorAll(".bird");
    const flowers = containerRef.current.querySelectorAll(".flower");

    clouds.forEach((cloud, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      gsap.to(cloud, {
        x: dir * (window.innerWidth * 0.5 + Math.random() * 200),
        duration: 25 + Math.random() * 30,
        repeat: -1,
        yoyo: true,
        ease: "none",
      });
      gsap.to(cloud, {
        y: `random(-50, 50)`,
        duration: 6 + Math.random() * 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 4,
      });
    });

    birds.forEach((bird) => {
      gsap.to(bird, {
        x: window.innerWidth + 200,
        y: "random(-60, 60)",
        duration: 12 + Math.random() * 10,
        repeat: -1,
        delay: Math.random() * 12,
        ease: "none",
      });
    });

    flowers.forEach((flower) => {
      gsap.to(flower, {
        rotation: 360,
        duration: 10 + Math.random() * 8,
        repeat: -1,
        ease: "none",
      });
    });
  }, [elements]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
      {elements.clouds.map((cloud) => (
        <img
          key={`cloud-${cloud.id}`}
          src={cloud.src}
          className="cloud absolute opacity-35 pointer-events-none"
          style={{ width: `${cloud.width}px`, top: `${cloud.top}%`, left: `${cloud.startX}%` }}
          alt=""
        />
      ))}
      {elements.birds.map((bird) => (
        <img
          key={`bird-${bird.id}`}
          src={BIRD_SVG}
          className="bird absolute w-8 -left-16 opacity-60"
          style={{ top: `${bird.top}%`, filter: "brightness(0.2)" }}
          alt=""
        />
      ))}
      {elements.flowers.map((flower) => (
        <img
          key={`flower-${flower.id}`}
          src={FLOWER_SVG}
          className="flower absolute w-6 opacity-40"
          style={{ bottom: `${flower.bottom}px`, left: `${flower.left}%`, filter: "hue-rotate(300deg) brightness(1.2)" }}
          alt=""
        />
      ))}
    </div>
  );
}
