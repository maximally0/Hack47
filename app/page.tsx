"use client"

import React, { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import {
  Monitor,
  Trash2,
  Globe,
  Link2,
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
} from "lucide-react"
import { WinWindow } from "@/components/win-window"
import { DesktopIcon } from "@/components/desktop-icon"
import { Taskbar } from "@/components/taskbar"
import { cn } from "@/lib/utils"

const CLOUD_URLS = [
  "https://images.unsplash.com/photo-1603437873662-dc1f44901825?auto=format&w=400&q=80",
  "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&w=400&q=80",
]

const SUN_SVG =
  "https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/caro-asercion/heraldic-sun.svg"
const BIRD_SVG =
  "https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/lorc/bird-limb.svg"
const FLOWER_SVG =
  "https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/lorc/twirly-flower.svg"
const SHIELD_SVG =
  "https://cdn.jsdelivr.net/npm/game-icons-transparent@latest/svgs/lorc/checked-shield.svg"

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
  {
    id: "variance",
    label: "VARIANCE.HOUSE",
    handle: "variance.house",
    url: "https://www.variance.house",
    icon: "🌐",
  },
]

const CONTACT = {
  email: "hello@hack47.org",
  phone: "+91 90412 60790",
  phoneRaw: "+919041260790",
}

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
    status: "CO-RUN",
    statusText: "WITH VARIANCE",
    detail: "Deep-tech residency. Co-conducted.",
    icon: "💻",
  },
  {
    name: "GOA",
    status: "QUEUED",
    statusText: "WITH VARIANCE — NEXT",
    detail: "The beach node. Built together.",
    icon: "🌴",
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
]

type FeedPost = {
  author: string
  role: string
  date: string
  url: string
  text: string
}
type FeedData = {
  updated: string
  mint: { title: string; url: string; date: string; snippet: string }
  x: FeedPost[]
  linkedin: FeedPost[]
}

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
}

function useFeedData(): FeedData {
  const [data, setData] = useState<FeedData | null>(null)
  useEffect(() => {
    let alive = true
    fetch("/feed/latest.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d === "object") setData(d)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return data ?? FEED_DEFAULT
}

/** Deterministic IST timestamp — avoids server/client hydration mismatch. */
function formatSyncIST(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const ist = new Date(d.getTime() + 5.5 * 3600e3)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(ist.getUTCDate())}-${p(ist.getUTCMonth() + 1)}-${ist.getUTCFullYear()} ${p(ist.getUTCHours())}:${p(ist.getUTCMinutes())} IST`
}

// ═══════════════════════════════════════════════════════════════════════════
// Window layout
// ═══════════════════════════════════════════════════════════════════════════

function computeWindowLayout() {
  if (typeof window === "undefined") {
    return {
      main: { x: 200, y: 30 },
      perks: { x: 880, y: 30 },
      photos: { x: 880, y: 350 },
      error: { x: 200, y: 400 },
      soul: { x: 580, y: 180 },
      team: { x: 400, y: 100 },
      residents: { x: 500, y: 120 },
      specs: { x: 450, y: 200 },
      network: { x: 700, y: 260 },
      cities: { x: 900, y: 180 },
      news: { x: 600, y: 380 },
      sponsors: { x: 400, y: 120 },
      offgrid: { x: 700, y: 60 },
      contact: { x: 900, y: 440 },
      partner: { x: 700, y: 170 },
    }
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  // Icon tray is a 2-col grid: 12px left offset + 176px wide = 188px.
  // Windows must start AFTER the full tray or they cover the second column.
  const iconCol = 188
  const taskbarH = 36
  const gutter = 12

  const availW = vw - iconCol - gutter * 3
  const availH = vh - taskbarH - gutter * 3

  const colW = Math.floor(availW / 2)
  const rowH = Math.floor(availH / 2)

  const col1X = iconCol + gutter
  const col2X = iconCol + gutter + colW + gutter
  const row1Y = gutter
  const row2Y = gutter + rowH + gutter

  const centerX = iconCol + Math.floor(availW / 3)
  const centerY = Math.floor(availH / 4)

  const soulX = iconCol + Math.floor(availW / 2) - 130
  const soulY = Math.floor(availH / 2) - 80

  // New windows — right strip (past the perks/photos column) + bottom-center
  // strip (below the main window). Clamped so a ~300px window always fits.
  const rightX = Math.min(col2X + Math.min(colW, 380) + 16, vw - 300)
  const bottomX = col1X + Math.min(colW, 380) + 16

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
    partner: { x: rightX + 60, y: row1Y + 270 },
    cities: { x: bottomX, y: row2Y },
    sponsors: { x: bottomX + 20, y: row2Y + 80 },
    contact: { x: bottomX + 40, y: row2Y + 160 },
  }
}

export default function DesktopPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (isMobile) {
    return <MobileExperience />
  }

  return <DesktopView />
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE VIEW — the full experience, rebuilt
// ═══════════════════════════════════════════════════════════════════════════

function MobileCard({
  title,
  children,
  titleClassName,
}: {
  title: string
  children: React.ReactNode
  titleClassName?: string
}) {
  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div
        className={cn(
          "h-[3px] w-full",
          titleClassName || "bg-gradient-to-r from-[#dc2626] to-[#ef4444]"
        )}
      />
      <div className="px-3.5 pt-2.5 pb-1">
        <span className="font-code text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          {title}
        </span>
      </div>
      <div className="text-zinc-900">{children}</div>
    </div>
  )
}

function MobileView() {
  const [showForm, setShowForm] = useState(false)
  const feed = useFeedData()

  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <div
      className="mobile-page relative min-h-screen pb-28 font-body"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #241a00 0%, #0c0c0c 45%, #000000 100%)",
      }}
    >
      {/* CRT scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9997] scanlines opacity-15" />

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-[9000] flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-md">
        <p className="font-display text-xl font-bold leading-none tracking-tight text-white uppercase select-none">
          HACK<span className="text-electric-yellow">47</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            BATCH #001 LIVE
          </span>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-bold text-white uppercase transition-colors active:scale-95"
          >
            Apply
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="px-4 pt-8 pb-4">
        <h1 className="font-display text-[56px] font-bold leading-[0.95] tracking-tight text-white uppercase select-none">
          HACK<span className="text-electric-yellow">47</span>
        </h1>
        <p className="mt-3 max-w-[340px] text-[15px] leading-relaxed text-zinc-300">
          Delhi&apos;s first hacker house. A 30-day residency for 16 builders
          who care more about their Git history than their sleep schedule.
        </p>
        <div className="mt-5 rounded-xl border border-white/10 bg-black/60 p-3.5 font-code text-[13px] leading-relaxed text-electric-yellow">
          <p>&gt; INITIALIZING DELHI&apos;S FIRST HACKER HOUSE...</p>
          <p>&gt; STATUS: PURE CHAOS DETECTED</p>
          <p>&gt; LOCATION: DELHI VILLA · SEPT 15 – OCT 15</p>
          <p>&gt; CROSS-LINK: VARIANCE.HOUSE — SAME MONTH, TWO CITIES</p>
          <p className="animate-pulse">
            &gt; NEXT NODE: TBD — INDIA IS THE NETWORK ▊
          </p>
        </div>
      </section>

      {/* ── OFFGRID — golden ticket ── */}
      <section id="offgrid" className="mt-6 px-4">
        <div className="relative overflow-hidden border-2 border-yellow-700/60 bg-gradient-to-b from-[#3a2b00] via-[#1a1200] to-black shadow-[0_0_30px_rgba(255,200,0,0.15)]">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between text-[9px] font-bold tracking-widest text-yellow-600">
              <span>OFFGRID.EXE</span>
              <span>VIRTUAL HACKATHON</span>
            </div>
            <p className="mt-2 font-anton text-3xl leading-none text-yellow-400 uppercase">
              Golden
              <br />
              Ticket
            </p>
            <p className="mt-2 text-[10px] leading-relaxed text-yellow-200/70">
              30 days. Fully remote. Pure chaos. Win Offgrid and get a{" "}
              <span className="font-bold text-yellow-300">guaranteed seat</span>{" "}
              in the next Hack47 cohort.
            </p>
            <a
              href="https://hack47-offgrid.devpost.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block w-full win-border-outset bg-yellow-500 py-2.5 text-center text-xs font-bold tracking-wider text-black uppercase active:translate-y-px"
            >
              ✦ ENTER THE ARENA ↗
            </a>
            <p className="mt-1.5 text-center text-[8px] text-yellow-700/60 italic">
              One winner. One seat. The next cohort is waiting.
            </p>
          </div>
        </div>
      </section>

      {/* ── APPLY CTA ── */}
      <section id="apply" className="mt-6 px-4">
        <MobileCard title="⚠ SELL_YOUR_SOUL.EXE">
          <div className="p-4 text-center font-mono">
            <p className="mb-1 text-2xl font-bold">👹</p>
            <p className="mb-2 text-sm font-bold tracking-wide uppercase">
              SELL US YOUR SOUL
            </p>
            <p className="mb-3 text-[10px] leading-relaxed text-gray-600">
              30 days. No distractions. Pure building.
              <br />
              In exchange, we take your soul (and your sleep schedule).
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-red-600 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-[3px_3px_0px_rgba(0,0,0,0.3)] transition-all hover:bg-red-700 active:translate-y-px"
            >
              ✦ I ACCEPT — APPLY NOW ✦
            </button>
            <p className="mt-2 text-[8px] text-gray-400 italic">
              Terms: No refunds on sleep lost.
            </p>
          </div>
        </MobileCard>
      </section>

      {/* ── CITIES — next nodes ── */}
      <section id="nodes" className="mt-6 px-4">
        <MobileCard
          title="📡 NEXT_NODES.EXE"
          titleClassName="bg-gradient-to-r from-[#006400] to-[#00a000]"
        >
          <div className="p-3 font-mono text-[11px]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-700 uppercase">
                INDIA NODE MAP
              </p>
              <span className="animate-pulse text-[8px] font-bold text-green-600">
                ● DELHI LIVE
              </span>
            </div>
            <div>
              {CITIES.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between border-b border-gray-200 py-2 last:border-0"
                >
                  <div className="pr-2">
                    <p className="text-[11px] font-bold">
                      {c.icon} {c.name}
                    </p>
                    <p className="text-[9px] text-gray-500">{c.detail}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={cn(
                        "inline-block border px-1.5 py-0.5 text-[8px] font-bold",
                        c.status === "LIVE"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : c.status === "CO-RUN"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : c.status === "QUEUED"
                              ? "border-yellow-600 bg-yellow-50 text-yellow-700"
                              : "border-gray-400 bg-gray-100 text-gray-500"
                      )}
                    >
                      {c.status}
                    </span>
                    <p className="mt-0.5 text-[7px] text-gray-400">
                      {c.statusText}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[9px] text-gray-500 italic">
              Node announcements drop on X + LinkedIn first. Follow to know when
              your city goes live.
            </p>
          </div>
        </MobileCard>
      </section>

      {/* ── PARTNER — variance ── */}
      <section id="partner" className="mt-6 px-4">
        <MobileCard
          title="🌐 CROSS_LINK.EXE"
          titleClassName="bg-gradient-to-r from-[#7a007a] to-[#c300c3]"
        >
          <div className="p-3 font-mono text-[11px]">
            <div className="border-2 border-purple-700/60 bg-gradient-to-b from-[#1a001a] to-[#000000] p-3">
              <div className="mb-2 flex justify-between text-[8px] font-bold tracking-widest text-purple-400">
                <span>LINK: VARIANCE.HOUSE</span>
                <span className="animate-pulse text-green-400">
                  ● CONNECTED
                </span>
              </div>
              <p className="mb-1 font-anton text-2xl leading-none text-purple-300 uppercase">
                Variance
              </p>
              <p className="mb-2 text-[9px] leading-relaxed text-purple-100/70">
                30-day deep-tech residency. Bengaluru. Same month as Delhi —
                Sept 15 to Oct 15. Cross-promoted, not merged. No fee. No
                equity.
              </p>
              <a
                href="https://www.variance.house"
                target="_blank"
                rel="noopener noreferrer"
                className="block win-border-outset bg-purple-600 py-2 text-center text-[10px] font-bold text-white uppercase hover:brightness-110 active:translate-y-px"
              >
                ✦ LEARN MORE ↗
              </a>
              <p className="mt-1.5 text-center text-[8px] text-purple-400/60 italic">
                Full details on variance.house.
              </p>
            </div>
          </div>
        </MobileCard>
      </section>

      {/* ── SPONSORS — power supply ── */}
      <section id="sponsors" className="mt-6 px-4">
        <MobileCard
          title="⚡ POWER_SUPPLY.INI"
          titleClassName="bg-gradient-to-r from-[#4a0080] to-[#7a00cc]"
        >
          <div className="p-3">
            <p className="mb-2 text-[10px] font-bold text-gray-700 uppercase">
              INSTALLED DRIVERS — POWERING THE MACHINE
            </p>
            <div className="flex gap-2">
              <div className="flex min-h-[92px] flex-1 flex-col items-center justify-center border border-gray-300 bg-white p-2">
                <img
                  src="/sponsors/redbull.png"
                  alt="Red Bull"
                  className="h-10 w-auto"
                />
                <p className="mt-1 text-center text-[7px] text-gray-500">
                  FUEL.SYS — OFFICIAL CHAOS FUEL
                </p>
              </div>
              <div className="flex min-h-[92px] flex-1 flex-col items-center justify-center border border-gray-300 bg-white p-2">
                <img
                  src="/sponsors/openai.png"
                  alt="OpenAI"
                  className="h-7 w-auto"
                />
                <p className="mt-1 text-center text-[7px] text-gray-500">
                  GPT.DLL — COMPUTE FOR BUILDERS
                </p>
              </div>
            </div>
            <div className="mt-2 border border-purple-300 bg-white p-2">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[9px] font-bold text-purple-800 uppercase">
                  DRIVER 03 — VARIANCE HOUSE
                </p>
                <span className="text-[7px] font-bold text-green-600">
                  LINKED
                </span>
              </div>
              <p className="mb-1 text-[8px] text-gray-600">
                Sister residency, bengaluru — same month, cross-promoted.
              </p>
              <a
                href="https://www.variance.house"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[8px] font-bold text-blue-700 underline"
              >
                LEARN MORE ↗
              </a>
            </div>
            <p className="mt-2 text-[8px] text-gray-500 italic">
              Want to power the machine? → hello@hack47.org
            </p>
          </div>
        </MobileCard>
      </section>

      {/* ── NEWS — press + live feed ── */}
      <section id="news" className="mt-6 px-4">
        <MobileCard
          title="📰 NEWS_SIGNAL.EXE"
          titleClassName="bg-gradient-to-r from-[#000080] to-[#0000cc]"
        >
          <div className="p-3">
            <a
              href={feed.mint.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border-2 border-yellow-500/60 bg-black p-3 text-white transition-colors hover:border-yellow-400"
            >
              <p className="mb-1 text-[8px] font-bold tracking-widest text-yellow-400 uppercase">
                ★ Featured in The Mint — {feed.mint.date}
              </p>
              <p className="mb-2 text-[11px] leading-snug font-bold">
                {feed.mint.title}
              </p>
              <p className="text-[9px] text-gray-400 italic">
                {feed.mint.snippet}
              </p>
              <p className="mt-2 text-[9px] font-bold text-yellow-400">
                READ ARTICLE ↗
              </p>
            </a>

            <div className="mt-3">
              <p className="mb-1.5 text-[9px] font-bold text-gray-600 uppercase">
                LATEST SIGNALS
              </p>
              {feed.x.length === 0 ? (
                <div className="border border-dashed border-gray-300 bg-gray-100 p-2 text-[9px] leading-relaxed text-gray-500">
                  @hack47org — 0 signals detected. The birds haven&apos;t landed
                  yet.{" "}
                  <a
                    href="https://x.com/hack47org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-700 underline"
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
                    className="mb-2 block border border-gray-300 bg-[#f8f8f8] p-2"
                  >
                    <p className="text-[9px] font-bold text-gray-800">
                      {p.author}{" "}
                      <span className="font-normal text-gray-400">
                        · {p.date}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-3 text-[9px] leading-snug text-gray-600">
                      {p.text}
                    </p>
                    <p className="mt-1 text-[8px] font-bold text-blue-700">
                      OPEN ON X ↗
                    </p>
                  </a>
                ))
              )}
              {feed.linkedin.slice(0, 2).map((p, i) => (
                <a
                  key={i}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-2 block border border-gray-300 bg-[#f8f8f8] p-2 last:mb-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-gray-800">
                      {p.author}
                    </p>
                    <span className="text-[8px] text-gray-400">{p.date}</span>
                  </div>
                  <p className="text-[8px] text-gray-500">{p.role}</p>
                  <p className="mt-1 line-clamp-3 text-[9px] leading-snug text-gray-600">
                    {p.text}
                  </p>
                  <p className="mt-1 text-[8px] font-bold text-blue-700">
                    OPEN ON LINKEDIN ↗
                  </p>
                </a>
              ))}
            </div>
          </div>
        </MobileCard>
      </section>

      {/* ── HOUSE PROTOCOLS ── */}
      <section className="mt-6 px-4">
        <MobileCard title="README_FIRST.TXT">
          <div className="p-3 font-mono text-[11px] text-black">
            <p className="mb-3 font-bold uppercase underline">
              HOUSE PROTOCOLS:
            </p>
            <ul className="mb-4 space-y-3">
              <li>
                - <span className="font-bold">LAUNDRY.SYS</span>: We wash the
                socks. You build the robots.
              </li>
              <li>
                - <span className="font-bold">FOOD.EXE</span>: High-protein
                fuel. Optimized for latency.
              </li>
              <li>
                - <span className="font-bold">SLEEP.DLL</span>: Optional. Not
                recommended during demo day.
              </li>
            </ul>
            <div className="border-2 border-dashed border-red-500 bg-red-50/70 p-3">
              <p className="text-[11px] leading-relaxed">
                Highly addictive environment. May cause sudden career pivots.
              </p>
            </div>
          </div>
        </MobileCard>
      </section>

      {/* ── ARCHDEMONS ── */}
      <section id="devils" className="mt-6 px-4">
        <MobileCard
          title="👹 ARCHDEMONS.SYS"
          titleClassName="bg-gradient-to-r from-[#4a0000] to-[#cc0000]"
        >
          <div className="p-3">
            <p className="mb-3 text-center text-[9px] text-gray-500 italic">
              The ones who summoned this chaos into existence
            </p>
            <DevilRow
              name="Rishul Chanana"
              role="Archdemon I"
              img="/rishul.jpeg"
              links={[
                {
                  label: "LinkedIn ↗",
                  url: "https://www.linkedin.com/in/rishul-chanana/",
                },
                { label: "𝕏 ↗", url: "https://x.com/rishhul" },
              ]}
            />
            <DevilRow
              name="Pratyush Pandey"
              role="Archdemon II"
              img="/pratyush.jpeg"
              links={[
                {
                  label: "LinkedIn ↗",
                  url: "https://www.linkedin.com/in/pratyush-pandey-09b35b219",
                },
                { label: "𝕏 ↗", url: "https://x.com/P_Pratyush7" },
              ]}
            />
            <DevilRow
              name="Raghwender Vasisth"
              role="Archdemon III"
              initials="RV"
              links={[
                {
                  label: "LinkedIn ↗",
                  url: "https://www.linkedin.com/in/raghwender-vasist",
                },
                { label: "𝕏 ↗", url: "https://x.com/Hawthorn_thinks" },
                {
                  label: "IG ↗",
                  url: "https://www.instagram.com/hawthorn_laments",
                },
              ]}
            />
            <p className="mt-3 text-center text-[8px] text-gray-400 italic">
              These three traded their souls first. Now they collect yours.
            </p>
          </div>
        </MobileCard>
      </section>

      {/* ── RESIDENTS ── */}
      <section className="mt-6 px-4">
        <MobileCard
          title="RESIDENTS.DAT"
          titleClassName="bg-gradient-to-r from-[#005000] to-[#008000]"
        >
          <ResidentsPanel />
        </MobileCard>
      </section>

      {/* ── SYSTEM SPECS ── */}
      <section className="mt-6 px-4">
        <MobileCard
          title="SYSTEM_SPECS.INF"
          titleClassName="bg-gradient-to-r from-[#404040] to-[#808080]"
        >
          <SystemSpecs />
        </MobileCard>
      </section>

      {/* ── HOUSE PHOTOS ── */}
      <section className="mt-6 px-4">
        <MobileCard
          title="HOUSE_PHOTOS.EXE"
          titleClassName="bg-gradient-to-r from-[#0058ee] to-[#3789f8]"
        >
          <div className="flex gap-2 overflow-x-auto p-2 pb-2">
            {HOUSE_PHOTOS.map((p, i) => (
              <img
                key={i}
                src={p.src}
                alt={p.caption}
                className="h-28 w-auto shrink-0 rounded border-2 border-white/30 object-cover shadow-lg"
                style={{
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (2 + i)}deg)`,
                }}
              />
            ))}
          </div>
          <p className="px-2 pb-2 text-[8px] text-gray-500 italic">
            The house. The arena. The 4AM brainwave zone.
          </p>
        </MobileCard>
      </section>

      {/* ── CONTACT — helpdesk ── */}
      <section id="contact" className="mt-6 px-4">
        <MobileCard
          title="☎ HELPDESK.EXE"
          titleClassName="bg-gradient-to-r from-[#008080] to-[#00b0b0]"
        >
          <div className="p-3">
            <p className="mb-3 text-[10px] text-gray-600">
              Summon an organizer. We reply fast (or when the WiFi drops).
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mb-2 block w-full win-border-outset bg-[#c0c0c0] px-3 py-2.5 text-left active:translate-x-px active:translate-y-px"
            >
              <p className="text-[8px] font-bold text-gray-500 uppercase">
                Email
              </p>
              <p className="text-[13px] font-bold text-blue-800">
                {CONTACT.email}
              </p>
            </a>
            <a
              href={`tel:${CONTACT.phoneRaw}`}
              className="block w-full win-border-outset bg-[#c0c0c0] px-3 py-2.5 text-left active:translate-x-px active:translate-y-px"
            >
              <p className="text-[8px] font-bold text-gray-500 uppercase">
                Phone / WhatsApp
              </p>
              <p className="text-[13px] font-bold text-blue-800">
                {CONTACT.phone}
              </p>
            </a>
            <p className="mt-2 text-[8px] text-gray-500 italic">
              Response time: 24-48h. Faster if you bribe us with chai.
            </p>
          </div>
        </MobileCard>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-6 px-4 pb-4">
        <div className="flex gap-2">
          {SOCIALS.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border border-red-900/50 bg-black/60 py-2.5 text-center text-[10px] font-bold text-white transition-colors hover:bg-red-950/60"
            >
              {s.icon} {s.label.split(" ")[0]} ↗
            </a>
          ))}
        </div>
        <p className="mt-4 text-center text-[9px] leading-relaxed text-red-200/40">
          HACK47 © 2026 — Delhi&apos;s first hacker house.
          <br />
          Batch #001: Sept 15 – Oct 15 · More cities loading…
          <br />
          CO-CONDUCTED WITH VARIANCE HOUSE —{" "}
          <a
            href="https://www.variance.house"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-red-200"
          >
            variance.house
          </a>
        </p>
      </footer>

      {/* ── BOTTOM DOCK ── */}
      <MobileDock onApply={() => setShowForm(true)} scrollTo={scrollTo} />

      {showForm && <SoulForm onClose={() => setShowForm(false)} />}
    </div>
  )
}

function DevilRow({
  name,
  role,
  img,
  initials,
  links,
}: {
  name: string
  role: string
  img?: string
  initials?: string
  links: { label: string; url: string }[]
}) {
  return (
    <div className="mb-2 flex items-start gap-3 border border-gray-300 bg-[#f8f8f8] p-2 last:mb-0">
      {img ? (
        <img
          src={img}
          alt={name}
          className="h-16 w-16 shrink-0 border-2 border-red-800 object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-red-800 bg-black text-xl font-bold text-red-500">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold">{name}</p>
        <p className="mb-1.5 text-[9px] tracking-wider text-red-700 uppercase">
          {role}
        </p>
        <div className="flex flex-wrap gap-2">
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
  )
}

function MobileDock({
  onApply,
  scrollTo,
}: {
  onApply: () => void
  scrollTo: (id: string) => void
}) {
  const tabs = [
    {
      id: "top",
      label: "TOP",
      icon: ArrowUp,
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      id: "nodes",
      label: "NODES",
      icon: MapPin,
      action: () => scrollTo("nodes"),
    },
    {
      id: "news",
      label: "NEWS",
      icon: Newspaper,
      action: () => scrollTo("news"),
    },
    {
      id: "call",
      label: "CALL",
      icon: Phone,
      action: () => (window.location.href = `tel:${CONTACT.phoneRaw}`),
    },
  ]
  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] border-t border-white/10 bg-black/85 px-3 pt-2 pb-[max(10px,calc(env(safe-area-inset-bottom)))] backdrop-blur">
      <div className="flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={t.action}
            className="flex flex-1 flex-col items-center gap-1 py-1 text-zinc-400 transition-colors hover:text-white"
          >
            <t.icon className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wider">
              {t.label}
            </span>
          </button>
        ))}
        <button
          onClick={onApply}
          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-3 text-[13px] font-bold uppercase text-white shadow-[0_4px_16px_rgba(220,38,38,0.4)] transition-colors active:scale-95"
        >
          <Flame className="h-4 w-4" />
          Apply
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE EXPERIENCE — cinematic, real-asset, warm (rebuilt from the ground up)
// ═══════════════════════════════════════════════════════════════════════════

function MobileLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-code text-[11px] uppercase tracking-[0.18em] text-[#38bdf8] mb-2">
      {children}
    </div>
  )
}

/** Warm content card that pops on the dark cinematic base. */
function ContentCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl bg-[#eef4ff] text-[#0c1524] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]", className)}>
      {children}
    </div>
  )
}

function PerkRow({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-black/5 last:border-0">
      <span className="font-code text-[12px] font-bold text-[#3b82f6] mt-0.5">{n}</span>
      <div>
        <h3 className="font-semibold text-[16px] text-[#0c1524]">{title}</h3>
        <p className="text-[13.5px] text-[#62708c] mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function MobileExperience() {
  const [showForm, setShowForm] = useState(false)
  const feed = useFeedData()
  const open = () => setShowForm(true)
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <div className="mobile-page relative min-h-screen bg-[#070d1a] text-[#f5f1ea] font-body overflow-x-hidden pb-28">
      {/* ── Cinematic hero (real b-roll video / photo) ── */}
      <section className="relative isolate flex min-h-[96svh] flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[#070d1a]">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/hero-2.jpg"
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/assets/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-[#070d1a]" />
        </div>

        <header className="flex items-center justify-between px-5 pt-5">
          <div className="font-display text-2xl font-extrabold tracking-tight text-white">
            HACK<span className="text-[#3b82f6]">47</span>
          </div>
          <button
            onClick={open}
            className="rounded-full bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.4)] active:scale-95"
          >
            Apply
          </button>
        </header>

        <div className="px-5 pb-8">
          <MobileLabel>Delhi&apos;s first hacker house</MobileLabel>
          <h1 className="font-display text-[clamp(30px,9vw,40px)] font-extrabold leading-[1.02] tracking-tight text-white">
            The coolest <span className="text-[#3b82f6]">hacker house.</span>
          </h1>
          <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-white/80">
            30 days. 16 builders. One villa. Build something real — then actually enjoy the good life.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 font-code text-[11px]">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">SEPT 15 – OCT 15</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">16 SLOTS</span>
            <span className="rounded-full bg-[#38bdf8] px-3 py-1.5 font-bold text-black">APPLY NOW</span>
          </div>
          <button
            onClick={open}
            className="mt-7 w-full rounded-2xl bg-[#3b82f6] py-4 font-display text-[17px] font-bold text-white shadow-[0_12px_30px_rgba(59,130,246,0.35)] active:scale-[0.99]"
          >
            Apply to Hack47 →
          </button>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-3 gap-3 px-5 pt-6">
        {[
          ["30", "days"],
          ["16", "builders"],
          ["1", "villa"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-2xl border border-white/10 bg-white/5 py-5 text-center">
            <div className="font-display text-3xl font-extrabold text-[#38bdf8]">{v}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-white/50">{l}</div>
          </div>
        ))}
      </section>

      {/* ── What you get ── */}
      <section className="px-5 pt-9">
        <MobileLabel>What you get</MobileLabel>
        <h2 className="mb-5 font-display text-2xl font-bold text-white">Built to ship. Built to live.</h2>
        <ContentCard>
          <PerkRow n="01" title="16 desks, real monitors" desc="Work when it flows." />
          <PerkRow n="02" title="1Gbps fiber + failsafe" desc="Lag is a build error." />
          <PerkRow n="03" title="3 meals a day" desc="Fuel, not feasts. Snack bar 24/7." />
          <PerkRow n="04" title="Unlimited chai & coffee" desc="Pick your poison, we stock it." />
          <PerkRow n="05" title="Terrace + sunsets" desc="Build by day, unwind by dusk." />
          <PerkRow n="06" title="Your work stays yours" desc="We host, you keep the IP." />
        </ContentCard>
      </section>

      {/* ── The house (photos) ── */}
      <section className="px-5 pt-9">
        <MobileLabel>The house</MobileLabel>
        <h2 className="mb-5 font-display text-2xl font-bold text-white">A villa, not an office.</h2>
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
          {HOUSE_PHOTOS.map((p, i) => (
            <figure key={i} className="w-[80%] max-w-[320px] shrink-0 snap-center">
              <img
                src={p.src}
                alt={p.caption}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-2xl border border-white/10 object-cover"
              />
              <figcaption className="mt-2 text-[12px] text-white/60">{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Offgrid golden ticket ── */}
      <section id="offgrid" className="px-5 pt-9">
        <MobileLabel>Offgrid — the golden ticket</MobileLabel>
        <div className="rounded-3xl bg-gradient-to-br from-[#38bdf8] to-[#3b82f6] p-5 text-white shadow-[0_16px_40px_rgba(56,189,248,0.25)]">
          <div className="flex items-center justify-between font-code text-[11px] font-bold uppercase tracking-widest text-[#eaf3ff]">
            <span>Virtual hackathon</span><span>30 days</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-none">Win a seat</h2>
          <p className="mt-2 max-w-[300px] text-[14px] leading-relaxed text-[#eaf3ff]">
            Fully remote. Pure chaos. Win Offgrid and get a guaranteed spot in the next Hack47 cohort.
          </p>
          <a
            href={OFFGRID_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-xl bg-black py-3 text-center font-display text-[15px] font-bold text-[#38bdf8] active:scale-[0.99]"
          >
            Enter the arena ↗
          </a>
        </div>
      </section>

      {/* ── Cities / nodes ── */}
      <section id="nodes" className="px-5 pt-9">
        <MobileLabel>Next nodes</MobileLabel>
        <ContentCard>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0c1524]">India node map</h2>
            <span className="font-code text-[11px] font-bold text-green-700">● DELHI LIVE</span>
          </div>
          <div className="mt-2">
            {CITIES.map((c) => (
              <div key={c.name} className="flex items-center justify-between border-b border-black/5 py-2.5 last:border-0">
                <div>
                  <p className="text-[14px] font-semibold text-[#0c1524]">
                    {c.icon} {c.name}
                  </p>
                  <p className="text-[12px] text-[#62708c]">{c.detail}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 font-code text-[10px] font-bold uppercase",
                    c.status === "LIVE"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : c.status === "CO-RUN"
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : c.status === "QUEUED"
                          ? "border-amber-600 bg-amber-50 text-amber-700"
                          : "border-zinc-400 bg-zinc-100 text-zinc-500"
                  )}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] italic text-[#62708c]">
            Node announcements drop on X + LinkedIn first. Follow to know when your city goes live.
          </p>
        </ContentCard>
      </section>

      {/* ── Variance partner ── */}
      <section id="partner" className="px-5 pt-9">
        <MobileLabel>Partner node</MobileLabel>
        <div className="rounded-3xl bg-gradient-to-br from-[#4f46e5] to-[#818cf8] p-5 text-white shadow-[0_16px_40px_rgba(79,70,229,0.3)]">
          <div className="flex items-center justify-between font-code text-[11px] font-bold uppercase tracking-widest">
            <span>Variance.house</span><span className="text-green-300">● CONNECTED</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-none">Variance</h2>
          <p className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-white/85">
            30-day deep-tech residency in Bengaluru. Same month as Delhi — shared mentors, shared sponsors, stacked credits. No fee. No equity.
          </p>
          <a
            href="https://www.variance.house"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-xl bg-white py-3 text-center font-display text-[15px] font-bold text-[#4f46e5] active:scale-[0.99]"
          >
            Learn more ↗
          </a>
        </div>
      </section>

      {/* ── Sponsors ── */}
      <section id="sponsors" className="px-5 pt-9">
        <MobileLabel>Power supply</MobileLabel>
        <ContentCard>
          <p className="mb-3 font-code text-[11px] font-bold uppercase tracking-widest text-[#0c1524]">
            Powering the machine
          </p>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-4">
              <img src="/sponsors/redbull.png" alt="Red Bull" className="h-9 w-auto" />
              <p className="mt-2 text-center font-code text-[10px] text-[#62708c]">Fuel</p>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-4">
              <img src="/sponsors/openai.png" alt="OpenAI" className="h-9 w-auto" />
              <p className="mt-2 text-center font-code text-[10px] text-[#62708c]">Compute</p>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-[#62708c]">
            Plus the shared Variance credit stack. Want to power the machine?{" "}
            <a href={`mailto:${CONTACT.email}`} className="font-bold text-blue-700 underline">
              hello@hack47.org
            </a>
          </p>
        </ContentCard>
      </section>

      {/* ── News ── */}
      <section id="news" className="px-5 pt-9">
        <MobileLabel>Press + signals</MobileLabel>
        <a
          href={feed.mint.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-3xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-[#38bdf8]/50"
        >
          <p className="font-code text-[11px] font-bold uppercase tracking-widest text-[#38bdf8]">
            ★ Featured in The Mint — {feed.mint.date}
          </p>
          <p className="mt-2 text-[16px] font-semibold text-white">{feed.mint.title}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/60">{feed.mint.snippet}</p>
          <p className="mt-3 font-code text-[11px] font-bold text-[#38bdf8]">Read article ↗</p>
        </a>
        <div className="mt-3 space-y-3">
          {feed.x.slice(0, 1).map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-code text-[12px] font-bold text-white">
                {p.author} <span className="font-normal text-white/50">· {p.date}</span>
              </p>
              <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-white/65">{p.text}</p>
              <p className="mt-2 font-code text-[11px] font-bold text-[#3b82f6]">Open on X ↗</p>
            </a>
          ))}
          {feed.linkedin.slice(0, 1).map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-code text-[12px] font-bold text-white">{p.author}</p>
              <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-white/65">{p.text}</p>
              <p className="mt-2 font-code text-[11px] font-bold text-[#3b82f6]">Open on LinkedIn ↗</p>
            </a>
          ))}
        </div>
      </section>

      {/* ── House protocols ── */}
      <section className="px-5 pt-9">
        <MobileLabel>House protocols</MobileLabel>
        <ContentCard>
          <p className="mb-3 font-code text-[11px] font-bold uppercase tracking-widest text-[#0c1524]">Read me first</p>
          <div className="space-y-3">
            {[
              ["LAUNDRY.SYS", "We wash the socks. You build the robots."],
              ["FOOD.EXE", "High-protein fuel. Optimized for latency."],
              ["SLEEP.DLL", "Optional. Not recommended during demo day."],
            ].map(([f, l]) => (
              <div key={f} className="flex items-start gap-2">
                <span className="font-code text-[13px] font-bold text-[#3b82f6]">{f}</span>
                <span className="text-[13.5px] text-[#2a3450]">{l}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] italic text-[#62708c]">
            Highly addictive environment. May cause sudden career pivots.
          </p>
        </ContentCard>
      </section>

      {/* ── Archdemons ── */}
      <section id="devils" className="px-5 pt-9">
        <MobileLabel>The archdemons</MobileLabel>
        <ContentCard>
          <p className="mb-3 text-center text-[12px] italic text-[#62708c]">The ones who summoned this chaos into existence</p>
          <DevilRow name="Rishul Chanana" role="Archdemon I" img="/rishul.jpeg" links={[{ label: "LinkedIn ↗", url: "https://www.linkedin.com/in/rishul-chanana/" }, { label: "𝕏 ↗", url: "https://x.com/rishhul" }]} />
          <DevilRow name="Pratyush Pandey" role="Archdemon II" img="/pratyush.jpeg" links={[{ label: "LinkedIn ↗", url: "https://www.linkedin.com/in/pratyush-pandey-09b35b219" }, { label: "𝕏 ↗", url: "https://x.com/P_Pratyush7" }]} />
          <DevilRow name="Raghwender Vasisth" role="Archdemon III" initials="RV" links={[{ label: "LinkedIn ↗", url: "https://www.linkedin.com/in/raghwender-vasist" }, { label: "𝕏 ↗", url: "https://x.com/Hawthorn_thinks" }, { label: "IG ↗", url: "https://www.instagram.com/hawthorn_laments" }]} />
        </ContentCard>
      </section>

      {/* ── Residents ── */}
      <section className="px-5 pt-9">
        <MobileLabel>Residents</MobileLabel>
        <ContentCard>
          <ResidentsPanel />
        </ContentCard>
      </section>

      {/* ── System specs ── */}
      <section className="px-5 pt-9">
        <MobileLabel>System specs</MobileLabel>
        <ContentCard>
          <SystemSpecs />
        </ContentCard>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 pt-9">
        <MobileLabel>FAQ</MobileLabel>
        <h2 className="mb-4 font-display text-2xl font-bold text-white">A few practical questions.</h2>
        <div className="divide-y divide-white/10">
          {[
            ["Who is this for?", "Builders. Students, founders, indie hackers — anyone who ships. The bar is momentum, not pedigree."],
            ["What does it cost?", "We ask if you can contribute, but it never affects your application. Be honest — need-based support exists and nobody is turned away over money."],
            ["Where is it?", "A premium villa in Delhi. 4BHK, terrace, garden. Sept 15 – Oct 15."],
            ["Do I need to know how to code already?", "Being a builder is the real requirement. Code helps; momentum wins."],
            ["Is it really about the good life?", "Yes. Ship like you mean it, then actually enjoy the best 30 days of your year. That is the whole point."],
          ].map(([q, a]) => (
            <div key={q} className="py-4">
              <h3 className="text-[15px] font-semibold text-white">{q}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/65">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="px-5 pt-9">
        <MobileLabel>Contact</MobileLabel>
        <ContentCard>
          <p className="mb-3 text-[13.5px] text-[#62708c]">Summon an organizer. We reply fast (or when the WiFi drops).</p>
          <a href={`mailto:${CONTACT.email}`} className="block rounded-xl border border-zinc-200 bg-white p-3">
            <p className="font-code text-[10px] font-bold uppercase text-[#62708c]">Email</p>
            <p className="text-[16px] font-semibold text-blue-800">{CONTACT.email}</p>
          </a>
          <a href={`tel:${CONTACT.phoneRaw}`} className="mt-2 block rounded-xl border border-zinc-200 bg-white p-3">
            <p className="font-code text-[10px] font-bold uppercase text-[#62708c]">Phone / WhatsApp</p>
            <p className="text-[16px] font-semibold text-blue-800">{CONTACT.phone}</p>
          </a>
          <p className="mt-3 text-[12px] italic text-[#62708c]">Response time: 24-48h. Faster if you bribe us with chai.</p>
        </ContentCard>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-10 px-5 pb-8 text-center">
        <div className="flex gap-2">
          {SOCIALS.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-center text-[12px] font-semibold text-white/80 transition-colors hover:border-[#3b82f6]/50"
            >
              {s.icon} {s.label.split(" ")[0]} ↗
            </a>
          ))}
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-white/40">
          HACK47 © 2026 — Delhi&apos;s first hacker house.
          <br />
          Batch #001: Sept 15 – Oct 15 · More cities loading…
          <br />
          Co-conducted with{" "}
          <a href="https://www.variance.house" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            variance.house
          </a>
        </p>
      </footer>

      {/* ── Bottom dock ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0c0b09]/90 px-4 pt-2 pb-[max(10px,calc(env(safe-area-inset-bottom)))] backdrop-blur">
        <div className="flex items-center gap-2">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex flex-1 flex-col items-center gap-1 py-1 text-white/50 hover:text-white">
            <ArrowUp className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wider">Top</span>
          </button>
          <button onClick={() => scrollTo("nodes")} className="flex flex-1 flex-col items-center gap-1 py-1 text-white/50 hover:text-white">
            <MapPin className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wider">Nodes</span>
          </button>
          <button onClick={() => scrollTo("news")} className="flex flex-1 flex-col items-center gap-1 py-1 text-white/50 hover:text-white">
            <Newspaper className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wider">News</span>
          </button>
          <button onClick={() => (window.location.href = `tel:${CONTACT.phoneRaw}`)} className="flex flex-1 flex-col items-center gap-1 py-1 text-white/50 hover:text-white">
            <Phone className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wider">Call</span>
          </button>
          <button onClick={open} className="flex items-center gap-1.5 rounded-xl bg-[#3b82f6] px-5 py-3 text-[13px] font-bold text-white shadow-[0_6px_18px_rgba(59,130,246,0.4)] active:scale-95">
            <Flame className="h-4 w-4" />
            Apply
          </button>
        </div>
      </nav>

      {showForm && <SoulForm onClose={() => setShowForm(false)} />}
    </div>
  )
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
    network: false,
    cities: false,
    news: false,
    sponsors: false,
    offgrid: false,
    contact: false,
    partner: false,
  })
  const [windowOrder, setWindowOrder] = useState<string[]>([
    "soul",
    "main",
    "perks",
    "photos",
    "error",
    "news",
    "offgrid",
    "network",
    "cities",
    "sponsors",
    "contact",
    "partner",
    "team",
    "residents",
    "specs",
  ])
  const [clippyVisible, setClippyVisible] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [layout, setLayout] = useState(computeWindowLayout)

  const desktopRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLayout(computeWindowLayout())
  }, [])

  const toggleWindow = (id: string, state?: boolean) => {
    setOpenWindows((prev) => ({ ...prev, [id]: state ?? !prev[id] }))
    if (state !== false) {
      bringToFront(id)
    }
  }

  const bringToFront = (id: string) => {
    setWindowOrder((prev) => [id, ...prev.filter((w) => w !== id)])
  }

  const getZIndex = (id: string) => {
    const index = windowOrder.indexOf(id)
    return 100 - index
  }

  const activeTasks = Object.entries(openWindows)
    .filter(([_, isOpen]) => isOpen)
    .map(([id]) => ({
      id,
      title: getWindowTitle(id),
    }))

  function getWindowTitle(id: string) {
    switch (id) {
      case "main":
        return "C:\\SYSTEM\\HACK47_OS.EXE"
      case "perks":
        return "README_FIRST.TXT"
      case "photos":
        return "HOUSE_PHOTOS.EXE"
      case "error":
        return "System Error"
      case "soul":
        return "⚠ SELL_YOUR_SOUL.EXE"
      case "team":
        return "ARCHDEMONS.SYS"
      case "residents":
        return "RESIDENTS.DAT"
      case "specs":
        return "SYSTEM_SPECS.INF"
      case "network":
        return "NETWORK_NEIGHBORHOOD.EXE"
      case "cities":
        return "NEXT_NODES.EXE"
      case "news":
        return "NEWS_SIGNAL.EXE"
      case "sponsors":
        return "POWER_SUPPLY.INI"
      case "offgrid":
        return "OFFGRID.EXE"
      case "contact":
        return "HELPDESK.EXE"
      case "partner":
        return "CROSS_LINK.EXE"
      default:
        return id
    }
  }

  return (
    <div
      ref={desktopRef}
      className="desktop-environment relative h-screen w-full overflow-hidden bg-[#008080] font-win"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1603437873662-dc1f44901825?auto=format&w=2000&q=80&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dynamic Clouds & Nature */}
      <NatureLayer />

      <img
        src={SUN_SVG}
        className="sun-element pointer-events-none absolute top-4 right-4 z-5 h-16 w-16 animate-pulse drop-shadow-[0_0_40px_#FAFF00] md:h-24 md:w-24 lg:h-28 lg:w-28"
        alt="Heraldic Sun"
      />

      {/* Desktop Icons — two columns, each app with its own colored tile */}
      <div className="desktop-icons absolute top-4 left-3 z-20 grid w-[176px] grid-cols-2 gap-x-1 gap-y-3">
        <DesktopIcon
          icon={Monitor}
          tile="bg-[#000080]"
          label="My Computer"
          onClick={() => toggleWindow("specs", true)}
        />
        <DesktopIcon
          icon={Trash2}
          tile="bg-[#008000]"
          label="Recycle Bin"
          onClick={() => alert("Emptying bin...")}
        />
        <DesktopIcon
          icon={Skull}
          tile="bg-[#8b0000]"
          label="The Devils"
          onClick={() => toggleWindow("team", true)}
        />
        <DesktopIcon
          icon={Folder}
          tile="bg-[#0058ee]"
          label="House_Photos"
          onClick={() => toggleWindow("photos", true)}
        />
        <DesktopIcon
          icon={Users}
          tile="bg-[#006400]"
          label="Residents"
          onClick={() => toggleWindow("residents", true)}
        />
        <DesktopIcon
          icon={Globe}
          tile="bg-[#0000cc]"
          label="The Web"
          onClick={() => toggleWindow("network", true)}
        />
        <DesktopIcon
          icon={MapPin}
          tile="bg-[#008080]"
          label="Next Nodes"
          onClick={() => toggleWindow("cities", true)}
        />
        <DesktopIcon
          icon={Link2}
          tile="bg-[#7a007a]"
          label="Variance House"
          onClick={() => toggleWindow("partner", true)}
        />
        <DesktopIcon
          icon={Newspaper}
          tile="bg-[#cc0000]"
          label="News Signal"
          onClick={() => toggleWindow("news", true)}
        />
        <DesktopIcon
          icon={Zap}
          tile="bg-[#4a0080]"
          label="Power Supply"
          onClick={() => toggleWindow("sponsors", true)}
        />
        <DesktopIcon
          icon={Ticket}
          tile="bg-[#8b6914]"
          label="Offgrid"
          onClick={() => toggleWindow("offgrid", true)}
        />
        <DesktopIcon
          icon={Mail}
          tile="bg-[#006666]"
          label="Helpdesk"
          onClick={() => toggleWindow("contact", true)}
        />
      </div>

      {/* ═══════ WINDOWS (2×2 grid, never overlapping) ═══════ */}

      {openWindows.main && (
        <WinWindow
          id="main"
          title="C:\SYSTEM\HACK47_OS.EXE"
          startX={layout.main.x}
          startY={layout.main.y}
          className="w-[45vw] max-w-[520px] min-w-[260px]"
          isActive={windowOrder[0] === "main"}
          zIndex={getZIndex("main")}
          onActivate={() => bringToFront("main")}
          onClose={() => toggleWindow("main", false)}
          floating={true}
        >
          <div className="p-3 md:p-4">
            <h1 className="font-syne mb-3 text-[clamp(36px,7vw,100px)] leading-none tracking-tighter whitespace-nowrap text-black uppercase select-none">
              HACK
              <a
                href="https://en.wikipedia.org/wiki/Indian_independence_movement"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer px-0.5 transition-colors duration-200 hover:bg-black hover:text-electric-yellow"
              >
                47
              </a>
            </h1>
            <div className="mb-3 border-l-4 border-electric-yellow bg-black p-2 font-mono text-[9px] text-electric-yellow md:p-3 md:text-[11px]">
              <p>&gt; INITIALIZING DELHI&apos;S FIRST HACKER HOUSE...</p>
              <p>&gt; STATUS: PURE CHAOS DETECTED</p>
              <p>&gt; LOCATION: DELHI VILLA</p>
              <p>&gt; SEPT 15 - OCT 15</p>
              <p>&gt; CROSS-LINK: VARIANCE.HOUSE — SAME MONTH, TWO CITIES</p>
              <p>&gt; NEXT NODE: TBD — INDIA IS THE NETWORK</p>
            </div>
            <p className="border-l-4 border-gray-300 pl-2 font-serif text-[clamp(11px,1.3vw,18px)] leading-snug text-gray-700 italic">
              &quot;A 30-day residency for 16 builders who care more about their
              Git history than their sleep schedule.&quot;
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
          className="w-[40vw] max-w-[320px] min-w-[220px]"
          titleBarClassName="bg-[#800000]"
          isActive={windowOrder[0] === "perks"}
          zIndex={getZIndex("perks")}
          onActivate={() => bringToFront("perks")}
          onClose={() => toggleWindow("perks", false)}
          floating={true}
        >
          <div className="p-3 font-mono text-[11px] text-black">
            <p className="mb-3 font-bold uppercase underline">
              HOUSE PROTOCOLS:
            </p>
            <ul className="mb-4 space-y-3">
              <li className="text-black">
                - <span className="font-bold">LAUNDRY.SYS</span>: We wash the
                socks. You build the robots.
              </li>
              <li className="text-black">
                - <span className="font-bold">FOOD.EXE</span>: High-protein
                fuel. Optimized for latency.
              </li>
              <li className="text-black">
                - <span className="font-bold">SLEEP.DLL</span>: Optional. Not
                recommended during demo day.
              </li>
            </ul>
            <div className="border-2 border-dashed border-red-500 bg-red-50/70 p-3">
              <p className="text-[11px] leading-relaxed text-black">
                Highly addictive environment. May cause sudden career pivots.
              </p>
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
          className="w-[40vw] max-w-[360px] min-w-[220px]"
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
          className="w-[38vw] max-w-[300px] min-w-[220px]"
          titleBarClassName="bg-[#808080]"
          isActive={windowOrder[0] === "error"}
          zIndex={getZIndex("error")}
          onActivate={() => bringToFront("error")}
          onClose={() => toggleWindow("error", false)}
          floating={true}
        >
          <div className="flex items-start gap-3 p-3">
            <AlertTriangle className="h-7 w-7 shrink-0 text-yellow-500" />
            <div>
              <p className="text-sm font-bold text-gray-800">
                404: Tribe Not Found?
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
                If you can&apos;t find your tribe in the wild, you must build
                one at Hack47. Delhi is waiting for your next big thing.
              </p>
              <button
                onClick={() => toggleWindow("error", false)}
                className="mt-3 win-border-outset bg-win-grey px-5 py-1 text-xs font-bold hover:brightness-105 active:translate-x-px active:translate-y-px"
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
          className="w-[32vw] max-w-[300px] min-w-[250px]"
          titleBarClassName="bg-[#cc0000]"
          isActive={windowOrder[0] === "soul"}
          zIndex={getZIndex("soul")}
          onActivate={() => bringToFront("soul")}
          onClose={() => toggleWindow("soul", false)}
          floating={true}
        >
          <div className="p-4 text-center font-mono">
            <p className="mb-2 text-xl font-bold">👹</p>
            <p className="mb-2 text-sm font-bold tracking-wide uppercase">
              SELL US YOUR SOUL
            </p>
            <p className="mb-4 text-[10px] leading-relaxed text-gray-600">
              30 days. No distractions. Pure building.
              <br />
              In exchange, we take your soul (and your sleep schedule).
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-red-600 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-[3px_3px_0px_rgba(0,0,0,0.3)] transition-all hover:bg-red-700 active:translate-y-px"
            >
              ✦ I ACCEPT — APPLY NOW ✦
            </button>
            <p className="mt-2 text-[8px] text-gray-400 italic">
              Terms: No refunds on sleep lost.
            </p>
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
          className="w-[40vw] max-w-[380px] min-w-[280px]"
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
          className="w-[36vw] max-w-[300px] min-w-[240px]"
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
          className="w-[36vw] max-w-[290px] min-w-[230px]"
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
          className="w-[36vw] max-w-[300px] min-w-[240px]"
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
          className="w-[40vw] max-w-[330px] min-w-[260px]"
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
          className="w-[44vw] max-w-[400px] min-w-[300px]"
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
          className="w-[36vw] max-w-[310px] min-w-[240px]"
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
          className="w-[36vw] max-w-[320px] min-w-[250px]"
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
          className="w-[36vw] max-w-[300px] min-w-[240px]"
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

      {openWindows.partner && (
        <WinWindow
          id="partner"
          title="CROSS_LINK.EXE"
          startX={layout.partner.x}
          startY={layout.partner.y}
          className="w-[38vw] max-w-[320px] min-w-[250px]"
          titleBarClassName="bg-[#7a007a]"
          isActive={windowOrder[0] === "partner"}
          zIndex={getZIndex("partner")}
          onActivate={() => bringToFront("partner")}
          onClose={() => toggleWindow("partner", false)}
          floating={false}
        >
          <div className="p-3 font-mono">
            <div className="relative overflow-hidden border-2 border-purple-700/60 bg-gradient-to-b from-[#1a001a] to-[#000000] p-3">
              <div className="mb-2 flex justify-between text-[8px] font-bold tracking-widest text-purple-400">
                <span>CROSS_LINK.EXE</span>
                <span>LINK: VARIANCE.HOUSE</span>
              </div>
              <p className="mb-1 font-anton text-2xl leading-none text-purple-300 uppercase">
                Variance
              </p>
              <p className="mb-2 text-[9px] leading-relaxed text-purple-100/70">
                30-day deep-tech residency. Bengaluru. Same month as Delhi —
                Sept 15 to Oct 15. Cross-promoted, not merged. No fee. No
                equity. Your work stays yours.
              </p>
              <a
                href="https://www.variance.house"
                target="_blank"
                rel="noopener noreferrer"
                className="block win-border-outset bg-purple-600 py-2 text-center text-[10px] font-bold text-white uppercase hover:brightness-110 active:translate-y-px"
              >
                ✦ LEARN MORE ↗
              </a>
              <p className="mt-1.5 text-center text-[8px] text-purple-400/60 italic">
                Full details on variance.house.
              </p>
            </div>
          </div>
        </WinWindow>
      )}

      {/* Clippy Buddy */}
      <div className="absolute right-4 bottom-11 z-[9000]">
        <div
          className={cn(
            "pointer-events-none absolute right-0 bottom-full mb-3 w-44 origin-bottom-right border-2 border-black bg-[#ffffcc] p-2.5 text-[10px] leading-snug shadow-[3px_3px_0px_rgba(0,0,0,0.3)] transition-all duration-300",
            clippyVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
        >
          <p className="font-mono text-black">
            It looks like you&apos;re trying to build the next big thing. Need a
            spot at Hack47?
          </p>
          <div className="absolute top-full right-4 h-0 w-0 border-t-8 border-r-8 border-l-8 border-t-black border-r-transparent border-l-transparent" />
        </div>
        <img
          src={SHIELD_SVG}
          className="h-11 w-11 cursor-pointer brightness-200 contrast-200 grayscale transition-all hover:scale-110 active:scale-95"
          style={{ filter: "hue-rotate(90deg) brightness(2.5)" }}
          onClick={() => setClippyVisible((v) => !v)}
          alt="Clippy Buddy"
        />
      </div>

      {/* ═══════ TYPEFORM OVERLAY ═══════ */}
      {showForm && <SoulForm onClose={() => setShowForm(false)} />}

      <Taskbar
        activeTasks={activeTasks}
        onTaskClick={(id) => {
          toggleWindow(id, true)
          bringToFront(id)
        }}
        onStartClick={() => toggleWindow("error", true)}
      />
    </div>
  )
}

// ─── Network Neighborhood (social links app) ────────────────────────────────

function NetworkNeighborhood() {
  return (
    <div className="p-3 font-mono">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-700">
          &gt; SELECT A CHANNEL
        </p>
        <span className="animate-pulse text-[8px] font-bold text-green-600">
          ● 4 CHANNELS ONLINE
        </span>
      </div>
      <div className="space-y-2">
        {SOCIALS.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 win-border-outset bg-win-grey px-2.5 py-2 transition-all hover:brightness-105 active:translate-x-px active:translate-y-px"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-white text-sm win-border-inset">
              {s.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-black uppercase">
                {s.label}
              </span>
              <span className="block truncate text-[8px] text-gray-600">
                {s.handle}
              </span>
            </span>
            <span className="text-[10px] font-bold text-black">↗</span>
          </a>
        ))}
      </div>
      <p className="mt-2 text-[8px] text-gray-500 italic">
        Establish connection. No viruses detected (probably).
      </p>
    </div>
  )
}

// ─── Next Nodes (cities) ────────────────────────────────────────────────────

function CitiesPanel() {
  return (
    <div className="p-3 font-mono text-[10px]">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-bold text-gray-800">INDIA NODE MAP</p>
        <span className="animate-pulse text-[8px] font-bold text-green-600">
          ● DELHI NODE LIVE
        </span>
      </div>
      <div className="space-y-1">
        {CITIES.map((c) => (
          <div
            key={c.name}
            className="flex items-center justify-between border border-gray-200 bg-[#f8f8f8] px-2 py-1.5"
          >
            <div className="min-w-0 pr-2">
              <p className="text-[10px] font-bold">
                {c.icon} {c.name}
              </p>
              <p className="text-[8px] text-gray-500">{c.detail}</p>
            </div>
            <div className="shrink-0 text-right">
              <span
                className={cn(
                  "inline-block border px-1.5 py-0.5 text-[8px] font-bold",
                  c.status === "LIVE"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : c.status === "CO-RUN"
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : c.status === "QUEUED"
                        ? "border-yellow-600 bg-yellow-50 text-yellow-700"
                        : "border-gray-400 bg-gray-100 text-gray-500"
                )}
              >
                {c.status}
              </span>
              <p className="mt-0.5 text-[7px] text-gray-400">{c.statusText}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[8px] text-gray-500 italic">
        Node announcements drop on X + LinkedIn first. Follow to know when your
        city goes live.
      </p>
    </div>
  )
}

// ─── News Signal (press + feeds) ────────────────────────────────────────────

const NEWS_TABS = [
  { id: "press", label: "PRESS" },
  { id: "x", label: "X FEED" },
  { id: "linkedin", label: "LINKEDIN" },
] as const

function NewsPanel() {
  const [tab, setTab] = useState<(typeof NEWS_TABS)[number]["id"]>("press")
  const feed = useFeedData()

  return (
    <div className="p-2 font-mono">
      <div className="flex items-end gap-0 px-1">
        {NEWS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px border border-gray-400 px-3 py-1 text-[9px] font-bold transition-colors",
              tab === t.id
                ? "relative z-10 border-b-white bg-white text-black"
                : "bg-[#d4d0c8] text-gray-500 hover:bg-[#e0ddd5]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="max-h-[320px] min-h-[190px] overflow-y-auto border border-gray-400 bg-white p-2">
        {tab === "press" && <PressTab />}
        {tab === "x" && <XFeedTab posts={feed.x} />}
        {tab === "linkedin" && <LinkedInFeedTab posts={feed.linkedin} />}
      </div>
      <p className="mt-1.5 px-1 text-[7px] text-gray-400">
        LAST SYNC: {formatSyncIST(feed.updated)} · FEED: @hack47org +
        /company/hack47
      </p>
    </div>
  )
}

function PressTab() {
  const feed = useFeedData()
  const m = feed.mint
  return (
    <a
      href={m.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-2 border-yellow-500/60 bg-black p-3 text-white transition-colors hover:border-yellow-400"
    >
      <p className="mb-1 text-[8px] font-bold tracking-widest text-yellow-400 uppercase">
        ★ Featured in The Mint — {m.date}
      </p>
      <p className="mb-2 text-[11px] leading-snug font-bold">{m.title}</p>
      <p className="text-[9px] leading-relaxed text-gray-400 italic">
        {m.snippet}
      </p>
      <p className="mt-2 text-[9px] font-bold text-yellow-400">
        READ ARTICLE ↗
      </p>
    </a>
  )
}

function PostCard({
  post,
  platform,
}: {
  post: FeedPost
  platform: "x" | "linkedin"
}) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-2 block border border-gray-300 bg-[#f8f8f8] p-2 transition-colors last:mb-0 hover:bg-[#fffbe6]"
    >
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[9px] font-bold text-gray-800">
          {post.author}{" "}
          <span className="font-normal text-gray-400">· {post.role}</span>
        </p>
        <span className="ml-2 shrink-0 text-[8px] text-gray-400">
          {post.date}
        </span>
      </div>
      <p className="line-clamp-4 text-[9px] leading-snug text-gray-600">
        {post.text}
      </p>
      <p className="mt-1 text-[8px] font-bold text-blue-700">
        OPEN ON {platform === "x" ? "X" : "LINKEDIN"} ↗
      </p>
    </a>
  )
}

function XFeedTab({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex h-full min-h-[150px] flex-col items-center justify-center p-4 text-center">
        <p className="mb-2 text-2xl">🕊️</p>
        <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-700 uppercase">
          NO_SIGNAL
        </p>
        <p className="mb-3 max-w-[220px] text-[9px] leading-relaxed text-gray-500">
          0 posts detected on @hack47org. The birds haven&apos;t landed yet.
        </p>
        <a
          href="https://x.com/hack47org"
          target="_blank"
          rel="noopener noreferrer"
          className="win-border-outset bg-win-grey px-4 py-1.5 text-[10px] font-bold text-black hover:brightness-105 active:translate-x-px active:translate-y-px"
        >
          FOLLOW ON X ↗
        </a>
      </div>
    )
  }
  return (
    <div>
      {posts.map((p, i) => (
        <PostCard key={i} post={p} platform="x" />
      ))}
    </div>
  )
}

function LinkedInFeedTab({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex h-full min-h-[150px] flex-col items-center justify-center p-4 text-center">
        <p className="mb-2 text-2xl">💼</p>
        <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-700 uppercase">
          NO_SIGNAL
        </p>
        <p className="mb-3 max-w-[220px] text-[9px] leading-relaxed text-gray-500">
          No posts detected on /company/hack47.
        </p>
        <a
          href="https://www.linkedin.com/company/hack47"
          target="_blank"
          rel="noopener noreferrer"
          className="win-border-outset bg-win-grey px-4 py-1.5 text-[10px] font-bold text-black hover:brightness-105 active:translate-x-px active:translate-y-px"
        >
          FOLLOW ON LINKEDIN ↗
        </a>
      </div>
    )
  }
  return (
    <div>
      {posts.map((p, i) => (
        <PostCard key={i} post={p} platform="linkedin" />
      ))}
    </div>
  )
}

// ─── Power Supply (sponsors) ────────────────────────────────────────────────

function SponsorsPanel() {
  return (
    <div className="p-3 font-mono text-[10px]">
      <p className="mb-2 font-bold text-gray-800 underline">
        POWER SUPPLY — INSTALLED DRIVERS
      </p>
      <div className="space-y-2">
        <div className="border border-gray-300 bg-[#f8f8f8] p-2">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-bold text-red-700">
              DRIVER 01 — RED BULL
            </p>
            <span className="text-[8px] font-bold text-green-600">
              OVERCLOCKED
            </span>
          </div>
          <img
            src="/sponsors/redbull.png"
            alt="Red Bull"
            className="mb-1 h-9 w-auto"
          />
          <p className="text-[8px] text-gray-500">
            FUEL.SYS — Liquid horsepower for the chaos engine.
          </p>
        </div>
        <div className="border border-gray-300 bg-[#f8f8f8] p-2">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-800">
              DRIVER 02 — OPENAI
            </p>
            <span className="text-[8px] font-bold text-green-600">LOADED</span>
          </div>
          <img
            src="/sponsors/openai.png"
            alt="OpenAI"
            className="mb-1 h-6 w-auto"
          />
          <p className="text-[8px] text-gray-500">
            GPT.DLL — Compute credits for every builder in the house.
          </p>
        </div>
        <div className="border border-gray-300 bg-[#f8f8f8] p-2">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-bold text-purple-800">
              DRIVER 03 — VARIANCE HOUSE
            </p>
            <span className="text-[8px] font-bold text-green-600">LINKED</span>
          </div>
          <p className="mb-1 text-[8px] text-gray-600">
            Sister residency, bengaluru — same month, cross-promoted.
          </p>
          <a
            href="https://www.variance.house"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[8px] font-bold text-blue-700 underline"
          >
            LEARN MORE ↗
          </a>
        </div>
      </div>
      <p className="mt-2 text-[8px] text-gray-500 italic">
        Want to power the machine? → hello@hack47.org
      </p>
    </div>
  )
}

// ─── Offgrid (golden ticket) ────────────────────────────────────────────────

const OFFGRID_URL = "https://hack47-offgrid.devpost.com/"

function OffgridPanel() {
  return (
    <div className="p-3 font-mono">
      <div className="relative overflow-hidden border-2 border-yellow-600/70 bg-gradient-to-b from-[#2a2000] to-[#0d0a00] p-3">
        <div className="mb-2 flex justify-between text-[8px] font-bold tracking-widest text-yellow-600">
          <span>OFFGRID.EXE</span>
          <span>VIRTUAL HACKATHON</span>
        </div>
        <p className="mb-1 font-anton text-2xl leading-none text-yellow-400 uppercase">
          Golden
          <br />
          Ticket
        </p>
        <p className="mb-3 text-[9px] leading-relaxed text-yellow-100/70">
          30 days. Fully remote. Pure chaos. Win Offgrid and get a{" "}
          <span className="font-bold text-yellow-300">guaranteed seat</span> in
          the next Hack47 cohort.
        </p>
        <a
          href={OFFGRID_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block win-border-outset bg-yellow-500 py-2 text-center text-[10px] font-bold text-black uppercase hover:brightness-110 active:translate-y-px"
        >
          ✦ ENTER THE ARENA ↗
        </a>
        <p className="mt-1.5 text-center text-[8px] text-yellow-700/60 italic">
          One winner. One seat. The next cohort is waiting.
        </p>
      </div>
    </div>
  )
}

// ─── Helpdesk (contact) ─────────────────────────────────────────────────────

function ContactPanel() {
  return (
    <div className="p-3 font-mono">
      <p className="mb-2 text-[10px] font-bold text-gray-700">
        &gt; SUMMON AN ORGANIZER
      </p>
      <a
        href={`mailto:${CONTACT.email}`}
        className="mb-2 flex items-center gap-2 win-border-outset bg-win-grey px-2.5 py-2 transition-all hover:brightness-105 active:translate-x-px active:translate-y-px"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-white win-border-inset">
          <Mail className="h-4 w-4 text-black" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[8px] font-bold text-gray-600 uppercase">
            Email
          </span>
          <span className="block truncate text-[11px] font-bold text-black">
            {CONTACT.email}
          </span>
        </span>
        <span className="text-[10px] font-bold text-black">↗</span>
      </a>
      <a
        href={`tel:${CONTACT.phoneRaw}`}
        className="flex items-center gap-2 win-border-outset bg-win-grey px-2.5 py-2 transition-all hover:brightness-105 active:translate-x-px active:translate-y-px"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-white win-border-inset">
          <Phone className="h-4 w-4 text-black" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[8px] font-bold text-gray-600 uppercase">
            Phone / WhatsApp
          </span>
          <span className="block truncate text-[11px] font-bold text-black">
            {CONTACT.phone}
          </span>
        </span>
        <span className="text-[10px] font-bold text-black">↗</span>
      </a>
      <p className="mt-2 text-[8px] text-gray-500 italic">
        Response time: 24-48h. Faster if you bribe us with chai.
      </p>
    </div>
  )
}

// ─── House Photos Gallery ────────────────────────────────────────────────────

const HOUSE_PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?auto=format&w=600&q=80&fit=crop",
    caption: "View from the 'Thinking Spot'. Birds included.",
  },
  {
    src: "https://images.pexels.com/photos/19977288/pexels-photo-19977288.jpeg?auto=compress&cs=tinysrgb&w=600&q=80",
    caption: "The Arena. Where 4AM brainwaves happen.",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=600&q=80",
    caption: "Common area. Whiteboards > walls.",
  },
  {
    src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&w=600&q=80",
    caption: "The workspace. Dual monitors provided.",
  },
]

function HousePhotosGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const next = () => setCurrentIndex((i) => (i + 1) % HOUSE_PHOTOS.length)
  const prev = () =>
    setCurrentIndex((i) => (i - 1 + HOUSE_PHOTOS.length) % HOUSE_PHOTOS.length)
  const photo = HOUSE_PHOTOS[currentIndex]

  return (
    <div>
      <img
        src={photo.src}
        className="h-[140px] w-full object-cover"
        alt={photo.caption}
      />
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-100 px-2 py-1.5">
        <button
          onClick={prev}
          className="win-border-outset bg-win-grey px-2 py-0.5 text-[10px] font-bold active:translate-x-px active:translate-y-px"
        >
          ◀ Prev
        </button>
        <span className="font-mono text-[10px] text-gray-500">
          {currentIndex + 1} / {HOUSE_PHOTOS.length}
        </span>
        <button
          onClick={next}
          className="win-border-outset bg-win-grey px-2 py-0.5 text-[10px] font-bold active:translate-x-px active:translate-y-px"
        >
          Next ▶
        </button>
      </div>
      <p className="border-t border-gray-200 bg-gray-50 px-2 py-1.5 font-mono text-[9px] text-gray-600 italic">
        {photo.caption}
      </p>
    </div>
  )
}

// ─── The Devils (Team) ───────────────────────────────────────────────────────

function TheDevils() {
  return (
    <div className="bg-[#ffffff] p-4 font-mono">
      <div className="mb-4 text-center">
        <p className="mb-1 text-xs font-bold tracking-widest text-red-700 uppercase">
          👹 THE ARCHDEMONS 👹
        </p>
        <p className="text-[9px] text-gray-500 italic">
          The ones who summoned this chaos into existence
        </p>
      </div>

      <div className="space-y-4">
        <DevilRow
          name="Rishul Chanana"
          role="Archdemon I"
          img="/rishul.jpeg"
          links={[
            {
              label: "LinkedIn ↗",
              url: "https://www.linkedin.com/in/rishul-chanana/",
            },
            { label: "𝕏 ↗", url: "https://x.com/rishhul" },
          ]}
        />
        <DevilRow
          name="Pratyush Pandey"
          role="Archdemon II"
          img="/pratyush.jpeg"
          links={[
            {
              label: "LinkedIn ↗",
              url: "https://www.linkedin.com/in/pratyush-pandey-09b35b219",
            },
            { label: "𝕏 ↗", url: "https://x.com/P_Pratyush7" },
          ]}
        />
        <DevilRow
          name="Raghwender Vasisth"
          role="Archdemon III"
          initials="RV"
          links={[
            {
              label: "LinkedIn ↗",
              url: "https://www.linkedin.com/in/raghwender-vasist",
            },
            { label: "𝕏 ↗", url: "https://x.com/Hawthorn_thinks" },
            {
              label: "IG ↗",
              url: "https://www.instagram.com/hawthorn_laments",
            },
          ]}
        />
      </div>

      <div className="mt-4 border-t border-gray-300 pt-3 text-center">
        <p className="text-[8px] text-gray-400 italic">
          These three traded their souls first. Now they collect yours.
        </p>
      </div>
    </div>
  )
}

// ─── Residents Panel ─────────────────────────────────────────────────────────

function ResidentsPanel() {
  const filled = 0
  const total = 16

  return (
    <div className="p-3 font-mono text-[10px]">
      <p className="mb-2 font-bold">RESIDENT SLOTS — BATCH #001</p>
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[9px]">
          <span>Capacity</span>
          <span className="font-bold text-green-600">
            ALL {total} SLOTS OPEN
          </span>
        </div>
        <div className="h-4 w-full border border-gray-400 bg-gray-200">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `0%` }}
          />
        </div>
      </div>
      <div className="mb-3 space-y-1 text-[9px]">
        <p className="text-gray-400">
          ░░░░░░░░░░░░░░░░ {total} spots available
        </p>
        <p className="font-bold text-green-600">First come, first served.</p>
      </div>
      <div className="border-t border-gray-300 pt-2 text-[9px]">
        <p className="mb-1">No residents yet. Be the first.</p>
        <p className="text-gray-500 italic">Applications open now.</p>
      </div>
    </div>
  )
}

// ─── Soul Form (Typeform-style) ──────────────────────────────────────────────

const FORM_QUESTIONS = [
  {
    id: "name",
    label: "What do they call you, mortal?",
    type: "text",
    placeholder: "Your full name",
  },
  {
    id: "email",
    label: "Your email. We need a way to summon you.",
    type: "email",
    placeholder: "soul@builder.dev",
  },
  {
    id: "phone",
    label: "Phone number. For when the WiFi dies and demons need to reach you.",
    type: "tel",
    placeholder: "+91 ...",
  },
  {
    id: "instagram",
    label: "Your Instagram. We want to see your life before we consume it.",
    type: "text",
    placeholder: "@your_handle",
  },
  {
    id: "linkedin",
    label: "LinkedIn — show us the professional mask you wear.",
    type: "text",
    placeholder: "linkedin.com/in/...",
  },
  {
    id: "twitter",
    label: "X (Twitter) — where your real thoughts live.",
    type: "text",
    placeholder: "@handle or x.com/...",
  },
  {
    id: "brag",
    label:
      "BRAG SHEET — This is your altar. Lay down every offering: projects shipped, hackathons won, repos that slap, startups launched, communities built. Attach links. Be shameless.",
    type: "textarea",
    placeholder:
      "I built a...\ngithub.com/...\ntwitter.com/...\nproducthunt.com/...",
  },
  {
    id: "icecream",
    label:
      "The most important question of your life: What is the BEST ice cream flavor?",
    type: "text",
    placeholder: "Choose wisely. This matters more than your resume.",
  },
  {
    id: "failure",
    label:
      "What's the biggest failure you've experienced? What was the most breaking point of your life — the moment everything crumbled? And how did you crawl back?",
    type: "textarea",
    placeholder: "The devil respects honesty...",
  },
  {
    id: "caffeine",
    label:
      "How do you take your caffeine? The devil needs to know your poison. ☕",
    type: "text",
    placeholder: "Black coffee at 3AM? Chai? Monster Energy? IV drip?",
  },
  {
    id: "food",
    label:
      "House vibes: What food do you prefer? Dietary restrictions? Favorite late-night sin? Drink of choice when the code finally works?",
    type: "textarea",
    placeholder: "Veg/non-veg, midnight Maggi, celebratory drink...",
  },
  {
    id: "funding",
    label:
      "Would you like to live at Hack47 completely free, or would you be open to contributing some funds? (Your answer does NOT affect your application. Zero impact. We're just asking.)",
    type: "mcq",
    placeholder: "",
    options: [
      "Completely free — I'm broke and building",
      "I can chip in a little",
      "Happy to contribute meaningfully",
      "Money's not an issue — just let me in",
    ],
  },
]

function SoulForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const questionRef = useRef<HTMLDivElement>(null)

  const q = FORM_QUESTIONS[step]
  const isLast = step === FORM_QUESTIONS.length - 1
  const currentValue = answers[q?.id] || ""

  // Animate question transitions
  useEffect(() => {
    if (questionRef.current && !submitted) {
      gsap.fromTo(
        questionRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      )
    }
  }, [step, submitted])

  // Validation per field
  function validate(id: string, value: string): string | null {
    const v = value.trim()
    if (!v) return "This field is required."

    switch (id) {
      case "name":
        if (v.length < 2) return "Name must be at least 2 characters."
        if (v.length > 100) return "Name is too long."
        if (!/^[a-zA-Z\s'.()-]+$/.test(v))
          return "Name contains invalid characters."
        return null

      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
          return "Enter a valid email address."
        if (v.length > 254) return "Email is too long."
        return null

      case "phone":
        const digits = v.replace(/[\s\-().+]/g, "")
        if (!/^\d{7,15}$/.test(digits))
          return "Enter a valid phone number (7-15 digits)."
        return null

      case "instagram":
        if (!/^@?[\w.]+$/.test(v) && !/instagram\.com\/[\w.]+/i.test(v)) {
          return "Enter a valid Instagram handle (@username) or profile URL."
        }
        return null

      case "linkedin":
        if (!/linkedin\.com\/in\/[\w-]+/i.test(v) && !/^[\w-]+$/.test(v)) {
          return "Enter a valid LinkedIn profile URL (linkedin.com/in/...)."
        }
        return null

      case "twitter":
        if (
          !/^@[\w]+$/.test(v) &&
          !/(x\.com|twitter\.com)\/[\w]+/i.test(v) &&
          !/^[\w]+$/.test(v)
        ) {
          return "Enter a valid X/Twitter handle (@username) or profile URL."
        }
        return null

      case "brag":
        if (v.length < 50)
          return "C'mon, brag more. At least 50 characters. Show us what you've got."
        if (v.length > 5000) return "Max 5000 characters. Edit it down."
        return null

      case "icecream":
        if (v.length < 2) return "Seriously, just name a flavor."
        if (v.length > 100) return "It's an ice cream flavor, not an essay."
        return null

      case "failure":
        if (v.length < 30)
          return "Give us more than that. At least 30 characters."
        if (v.length > 5000) return "Max 5000 characters."
        return null

      case "caffeine":
        if (v.length < 2) return "Just tell us your poison."
        if (v.length > 200) return "Keep it under 200 characters."
        return null

      case "food":
        if (v.length < 10) return "Tell us a bit more. At least 10 characters."
        if (v.length > 2000) return "Max 2000 characters."
        return null

      case "funding":
        if (!v) return "Pick an option."
        return null

      default:
        return null
    }
  }

  const handleNext = () => {
    const validationError = validate(q.id, currentValue)
    if (validationError) {
      setError(validationError)
      return
    }
    setError("")

    if (isLast) {
      // Bot check: if honeypot field is filled, silently fake success
      if (honeypot) {
        setSubmitted(true)
        return
      }

      // Prevent double submission
      if (isSubmitting) return
      setIsSubmitting(true)

      // Submit to Google Sheets
      fetch(
        "https://script.google.com/macros/s/AKfycbxfqO1VrEUves58l8qfU6Jq2sKUwawN4SLBi4TXOOHjO8vpoV7_HMvtocGUiLtLmi7DTA/exec",
        {
          method: "POST",
          body: JSON.stringify(answers),
        }
      ).catch(() => {})
      setSubmitted(true)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && q.type !== "textarea" && currentValue.trim()) {
      handleNext()
    }
    if (
      e.key === "Enter" &&
      e.ctrlKey &&
      q.type === "textarea" &&
      currentValue.trim()
    ) {
      handleNext()
    }
  }

  // Clear error when user types
  const handleChange = (value: string) => {
    setAnswers((a) => ({ ...a, [q.id]: value }))
    if (error) setError("")
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-black p-4 py-6 sm:items-center">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, #660000 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-md text-center font-mono">
          <p className="mb-4 animate-pulse text-6xl">👹</p>
          <p className="mb-3 text-2xl font-bold tracking-widest text-red-500 uppercase">
            SOUL RECEIVED.
          </p>
          <p className="mb-6 text-sm text-red-300/80">
            Your offering has been accepted. We&apos;ll reach out if your soul
            is... sufficient.
          </p>
          <div className="mb-6 border border-red-900/50 bg-gray-950 p-4 text-left text-[10px] text-red-400/70">
            <p>&gt; Transaction complete</p>
            <p>&gt; Soul integrity: SCANNING...</p>
            <p>
              &gt; Soul integrity:{" "}
              <span className="text-green-500">VERIFIED</span>
            </p>
            <p>&gt; Added to the queue of the damned</p>
            <p>&gt; Expected response: 48-72 hours</p>
          </div>
          <button
            onClick={onClose}
            className="border border-red-500/50 bg-red-700 px-8 py-2 text-sm font-bold text-white shadow-[0_0_20px_rgba(200,0,0,0.3)] transition-all hover:bg-red-600 active:translate-y-px"
          >
            RETURN TO THE MORTAL REALM
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto p-4 py-6 sm:items-center">
      {/* Dark hellish background */}
      <div className="absolute inset-0 bg-black" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at bottom, #4a0000 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "radial-gradient(circle at top right, #ff0000 0%, transparent 40%)",
        }}
      />

      {/* Floating ember particles (CSS animated) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 animate-ping rounded-full bg-red-500/60"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg" ref={questionRef}>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-1.5 flex justify-between font-mono text-[10px] text-red-400/60">
            <span>
              RITUAL {step + 1} OF {FORM_QUESTIONS.length}
            </span>
            <span>
              {Math.round(((step + 1) / FORM_QUESTIONS.length) * 100)}% CONSUMED
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full border border-red-900/30 bg-gray-900">
            <div
              className="h-full bg-gradient-to-r from-red-700 to-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)] transition-all duration-500"
              style={{
                width: `${((step + 1) / FORM_QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <p className="mb-5 font-mono text-sm leading-relaxed text-white/90 md:text-base">
            {q.label}
          </p>
          {q.type === "mcq" && "options" in q ? (
            <div className="space-y-2">
              {(q as { options: string[] }).options.map(
                (option: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleChange(option)}
                    className={cn(
                      "w-full border px-4 py-3 text-left font-mono text-sm transition-all",
                      currentValue === option
                        ? "border-red-500 bg-red-950/50 text-white shadow-[0_0_10px_rgba(200,0,0,0.2)]"
                        : "border-red-900/30 bg-transparent text-gray-400 hover:border-red-700/50 hover:text-white"
                    )}
                  >
                    <span className="mr-2 text-red-500">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                  </button>
                )
              )}
            </div>
          ) : q.type === "textarea" ? (
            <textarea
              autoFocus
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={q.placeholder}
              className={cn(
                "h-36 w-full resize-none border-b-2 bg-transparent p-3 font-mono text-sm text-white transition-colors outline-none placeholder:text-red-900/50",
                error
                  ? "border-red-500"
                  : "border-red-900/40 focus:border-red-500"
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
                "w-full border-b-2 bg-transparent p-3 font-mono text-lg text-white transition-colors outline-none placeholder:text-red-900/50",
                error
                  ? "border-red-500"
                  : "border-red-900/40 focus:border-red-500"
              )}
            />
          )}
          {error && (
            <p className="mt-2 animate-pulse font-mono text-[11px] text-red-400">
              ⚠ {error}
            </p>
          )}
          {!error && q.type === "textarea" && (
            <p className="mt-1.5 font-mono text-[9px] text-red-800/60">
              Ctrl+Enter to proceed deeper
            </p>
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
          className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
          aria-hidden="true"
        />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="border border-red-900/30 bg-gray-900 px-4 py-1.5 font-mono text-xs text-red-300/70 transition-colors hover:border-red-700/50 hover:text-red-200"
              >
                ← BACK
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 font-mono text-xs text-gray-700 transition-colors hover:text-gray-400"
            >
              FLEE
            </button>
          </div>
          <button
            onClick={handleNext}
            disabled={!currentValue.trim() || isSubmitting}
            className="border border-red-500/30 bg-red-700 px-6 py-2 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-[0_0_15px_rgba(200,0,0,0.2)] transition-all hover:bg-red-600 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-20"
          >
            {isSubmitting
              ? "SUBMITTING..."
              : isLast
                ? "🔥 SUBMIT SOUL"
                : "NEXT →"}
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="mt-8 text-center font-mono text-[9px] text-red-900/50">
          {q.type !== "textarea" ? "Press Enter ↵ to descend further" : ""}
        </p>
      </div>
    </div>
  )
}

// ─── System Specs ────────────────────────────────────────────────────────────

function SystemSpecs() {
  return (
    <div className="p-3 font-mono text-[10px]">
      <p className="mb-2 font-bold text-gray-800 underline">
        HACK47 HOUSE — DEVICE MANAGER
      </p>
      <div className="space-y-2 text-[9px]">
        <div className="border-b border-gray-200 pb-1.5">
          <p className="font-bold text-blue-700">📍 LOCATION</p>
          <p className="pl-3 text-gray-600">Delhi, Premium Villa</p>
          <p className="pl-3 text-gray-600">4BHK + Terrace + Garden</p>
        </div>
        <div className="border-b border-gray-200 pb-1.5">
          <p className="font-bold text-green-700">🖥 COMPUTE</p>
          <p className="pl-3 text-gray-600">Desks: 16 (ergonomic)</p>
          <p className="pl-3 text-gray-600">Monitors: Available on request</p>
          <p className="pl-3 text-gray-600">Power backup: 24/7 inverter</p>
        </div>
        <div className="border-b border-gray-200 pb-1.5">
          <p className="font-bold text-purple-700">📡 NETWORK</p>
          <p className="pl-3 text-gray-600">WiFi: 1Gbps Symmetric Fiber</p>
          <p className="pl-3 text-gray-600">Backup: 4G failover</p>
          <p className="pl-3 text-gray-600">Latency: &lt;5ms to AWS Mumbai</p>
        </div>
        <div className="border-b border-gray-200 pb-1.5">
          <p className="font-bold text-orange-700">☕ FUEL SYSTEM</p>
          <p className="pl-3 text-gray-600">RAM: Unlimited chai & coffee</p>
          <p className="pl-3 text-gray-600">
            Storage: 3 meals/day (high protein)
          </p>
          <p className="pl-3 text-gray-600">Cache: Snack bar 24/7</p>
        </div>
        <div>
          <p className="font-bold text-red-700">🌅 GPU (Graphics)</p>
          <p className="pl-3 text-gray-600">Delhi sunset view</p>
          <p className="pl-3 text-gray-600">Resolution: 4K terrace panorama</p>
          <p className="pl-3 text-gray-600">Refresh rate: Every evening</p>
        </div>
      </div>
    </div>
  )
}

// ─── Nature Layer ────────────────────────────────────────────────────────────

function NatureLayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [elements, setElements] = useState<{
    clouds: {
      id: number
      src: string
      width: number
      top: number
      startX: number
    }[]
    birds: { id: number; top: number }[]
    flowers: { id: number; bottom: number; left: number }[]
  }>({ clouds: [], birds: [], flowers: [] })

  useEffect(() => {
    const newClouds = [...Array(12)].map((_, i) => ({
      id: i,
      src: CLOUD_URLS[i % 2],
      width: 120 + Math.random() * 280,
      top: -5 + Math.random() * 75,
      startX: -20 + Math.random() * 110,
    }))

    const newBirds = [...Array(5)].map((_, i) => ({
      id: i,
      top: 10 + Math.random() * 50,
    }))

    const newFlowers = [...Array(8)].map((_, i) => ({
      id: i,
      bottom: Math.random() * 80,
      left: Math.random() * 100,
    }))

    setElements({ clouds: newClouds, birds: newBirds, flowers: newFlowers })
  }, [])

  useEffect(() => {
    if (!containerRef.current || elements.clouds.length === 0) return

    const clouds = containerRef.current.querySelectorAll(".cloud")
    const birds = containerRef.current.querySelectorAll(".bird")
    const flowers = containerRef.current.querySelectorAll(".flower")

    clouds.forEach((cloud, i) => {
      const dir = i % 2 === 0 ? 1 : -1
      gsap.to(cloud, {
        x: dir * (window.innerWidth * 0.5 + Math.random() * 200),
        duration: 25 + Math.random() * 30,
        repeat: -1,
        yoyo: true,
        ease: "none",
      })
      gsap.to(cloud, {
        y: `random(-50, 50)`,
        duration: 6 + Math.random() * 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 4,
      })
    })

    birds.forEach((bird) => {
      gsap.to(bird, {
        x: window.innerWidth + 200,
        y: "random(-60, 60)",
        duration: 12 + Math.random() * 10,
        repeat: -1,
        delay: Math.random() * 12,
        ease: "none",
      })
    })

    flowers.forEach((flower) => {
      gsap.to(flower, {
        rotation: 360,
        duration: 10 + Math.random() * 8,
        repeat: -1,
        ease: "none",
      })
    })
  }, [elements])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-1 overflow-hidden"
    >
      {elements.clouds.map((cloud) => (
        <img
          key={`cloud-${cloud.id}`}
          src={cloud.src}
          className="cloud pointer-events-none absolute opacity-35"
          style={{
            width: `${cloud.width}px`,
            top: `${cloud.top}%`,
            left: `${cloud.startX}%`,
          }}
          alt=""
        />
      ))}
      {elements.birds.map((bird) => (
        <img
          key={`bird-${bird.id}`}
          src={BIRD_SVG}
          className="bird absolute -left-16 w-8 opacity-60"
          style={{ top: `${bird.top}%`, filter: "brightness(0.2)" }}
          alt=""
        />
      ))}
      {elements.flowers.map((flower) => (
        <img
          key={`flower-${flower.id}`}
          src={FLOWER_SVG}
          className="flower absolute w-6 opacity-40"
          style={{
            bottom: `${flower.bottom}px`,
            left: `${flower.left}%`,
            filter: "hue-rotate(300deg) brightness(1.2)",
          }}
          alt=""
        />
      ))}
    </div>
  )
}
