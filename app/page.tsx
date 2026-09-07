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
  Skull,
  Minus,
  ShieldCheck,
  Square,
  X,
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
// MOBILE VIEW — HACK47 OS, phone edition.
// Mirrors the desktop XP experience 1:1: wallpaper desktop, app icons that
// open windows, window chrome (titlebar, bevels, control buttons), XP taskbar.
// Every section below = the exact same window as on desktop.
// ═══════════════════════════════════════════════════════════════════════════

const MOBILE_WIN_DEFAULTS: Record<string, boolean> = {
  main: true,
  error: true,
  perks: true,
  photos: true,
  offgrid: true,
  soul: true,
  sponsors: true,
  news: true,
  cities: true,
  network: true,
  partner: true,
  devils: true,
  residents: true,
  specs: true,
  faq: true,
  helpdesk: true,
}

const MOBILE_APPS = [
  { id: "specs", label: "My Computer", icon: Monitor, tile: "bg-[#000080]" },
  { id: "bin", label: "Recycle Bin", icon: Trash2, tile: "bg-[#008000]" },
  { id: "devils", label: "The Devils", icon: Skull, tile: "bg-[#8b0000]" },
  { id: "photos", label: "House_Photos", icon: Folder, tile: "bg-[#0058ee]" },
  { id: "residents", label: "Residents", icon: Users, tile: "bg-[#006400]" },
  { id: "network", label: "The Web", icon: Globe, tile: "bg-[#0000cc]" },
  { id: "cities", label: "Next Nodes", icon: MapPin, tile: "bg-[#008080]" },
  { id: "partner", label: "Partner Node", icon: Link2, tile: "bg-[#7a007a]" },
  { id: "news", label: "News Signal", icon: Newspaper, tile: "bg-[#cc0000]" },
  { id: "sponsors", label: "Power Supply", icon: Zap, tile: "bg-[#4a0080]" },
  { id: "offgrid", label: "Offgrid", icon: Ticket, tile: "bg-[#8b6914]" },
  { id: "helpdesk", label: "Helpdesk", icon: Mail, tile: "bg-[#006666]" },
]

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

/** A full-width XP window — titlebar chrome + beveled content. Tap titlebar to minimize. */
function MobileWin({
  id,
  title,
  titleClass,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  titleClass?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="mx-2 mb-3 select-none scroll-mt-2 bg-[#c0c0c0] win-border-outset shadow-[3px_3px_0px_rgba(0,0,0,0.35)]"
    >
      <div
        onClick={onToggle}
        className={cn(
          "flex cursor-pointer items-center justify-between gap-2 bg-linear-to-r from-[#0058ee] to-[#3789f8] px-1.5 py-1.5 active:from-[#0048cc]",
          titleClass
        )}
      >
        <span className="truncate px-0.5 text-[12px] font-bold tracking-wide text-white uppercase drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
          {title}
        </span>
        <span className="flex shrink-0 gap-[2px]" onClick={(e) => e.stopPropagation()}>
          <button
            aria-label="Minimize"
            onClick={onToggle}
            className="win-btn flex h-[22px] w-[24px] items-center justify-center bg-win-grey win-border-outset active:translate-x-px active:translate-y-px"
          >
            <Minus className="h-3.5 w-3.5 text-black" strokeWidth={3} />
          </button>
          <button
            aria-label="Maximize"
            className="win-btn flex h-[22px] w-[24px] items-center justify-center bg-win-grey win-border-outset"
          >
            <Square className="h-2.5 w-2.5 text-black" strokeWidth={4} />
          </button>
          <button
            aria-label="Close"
            onClick={onToggle}
            className="win-btn flex h-[22px] w-[24px] items-center justify-center bg-[#e81123] text-white win-border-outset active:translate-x-px active:translate-y-px"
          >
            <X className="h-4 w-4" strokeWidth={3} />
          </button>
        </span>
      </div>
      {open && (
        <div className="win-content m-[3px] p-0.5 win-border-inset bg-[#ffffff] text-black">
          {children}
        </div>
      )}
    </section>
  )
}

function MobileExperience() {
  const [showForm, setShowForm] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>(MOBILE_WIN_DEFAULTS)

  const openApp = (id: string) => {
    if (id === "bin") {
      alert("Emptying bin...")
      return
    }
    setOpen((prev) => (prev[id] ? prev : { ...prev, [id]: true }))
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 60)
  }

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="mobile-page relative min-h-screen overflow-x-hidden pb-24 font-win text-black">
      {/* Wallpaper — same photo-layer feel as the desktop, dimmed for legibility */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#05050f]">
        <img
          src="/assets/hero-2.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[#02020a]/55" />
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-black/60 to-transparent" />
      </div>

      {/* ── Desktop screen: wordmark + status + app icons ── */}
      <section className="px-3 pt-5">
        <div className="flex items-start justify-between px-1">
          <div>
            <h1 className="font-anton text-[52px] leading-[0.9] tracking-tight text-white uppercase select-none">
              HACK
              <a
                href="https://en.wikipedia.org/wiki/Indian_independence_movement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric-yellow transition-colors hover:bg-electric-yellow hover:text-black"
              >
                47
              </a>
            </h1>
            <p className="mt-1.5 font-mono text-[10px] font-bold tracking-widest text-white/70 uppercase">
              Delhi&apos;s first hacker house
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 pt-1">
            <img
              src={SUN_SVG}
              alt=""
              aria-hidden="true"
              className="h-9 w-9 animate-pulse drop-shadow-[0_0_24px_#FAFF00]"
            />
            <span className="flex items-center gap-1.5 rounded-[3px] border border-white/25 bg-black/40 px-2 py-1 font-mono text-[10px] font-bold text-toxic-green backdrop-blur-[2px]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-toxic-green" />
              BATCH #001 LIVE
            </span>
            <span className="font-mono text-[9px] font-bold text-white/50 uppercase">
              SEPT 15 – OCT 15
            </span>
          </div>
        </div>

        {/* Desktop app icons — tap one, its window opens below */}
        <div className="mt-5 grid grid-cols-4 gap-x-0 gap-y-2.5 px-0.5">
          {MOBILE_APPS.map((app) => (
            <DesktopIcon
              key={app.id}
              icon={app.icon}
              tile={app.tile}
              label={app.label}
              onClick={() => openApp(app.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Open windows, stacked — same apps as the desktop ── */}
      <main className="mt-5">
        <MobileWin
          id="main"
          title="C:\SYSTEM\HACK47_OS.EXE"
          open={open.main}
          onToggle={() => toggle("main")}
        >
          <div className="p-3.5">
            <h2 className="font-anton text-[46px] leading-none tracking-tight text-black uppercase select-none">
              HACK
              <a
                href="https://en.wikipedia.org/wiki/Indian_independence_movement"
                target="_blank"
                rel="noopener noreferrer"
                className="px-0.5 transition-colors hover:bg-black hover:text-electric-yellow"
              >
                47
              </a>
            </h2>
            <div className="mb-3 mt-3 border-l-4 border-electric-yellow bg-black p-3 font-mono text-[11px] leading-relaxed text-electric-yellow">
              <p>&gt; INITIALIZING DELHI&apos;S FIRST HACKER HOUSE...</p>
              <p>&gt; STATUS: PURE CHAOS DETECTED</p>
              <p>&gt; LOCATION: DELHI VILLA</p>
              <p>&gt; SEPT 15 - OCT 15</p>
              <p>&gt; PARTNER NODE: VARIANCE.HOUSE — CONNECTED</p>
              <p className="animate-pulse">&gt; NEXT NODE: TBD — INDIA IS THE NETWORK ▊</p>
            </div>
            <p className="border-l-4 border-gray-300 pl-2 font-serif text-[15px] leading-snug text-gray-700 italic">
              &quot;A 30-day residency for 16 builders who care more about their
              Git history than their sleep schedule.&quot;
            </p>
          </div>
        </MobileWin>

        <MobileWin
          id="error"
          title="System Error"
          titleClass="bg-[#808080]"
          open={open.error}
          onToggle={() => toggle("error")}
        >
          <div className="flex items-start gap-3 p-3.5">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-yellow-500" />
            <div>
              <p className="text-[14px] font-bold text-gray-800">
                404: Tribe Not Found?
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                If you can&apos;t find your tribe in the wild, you must build one
                at Hack47. Delhi is waiting for your next big thing.
              </p>
              <button
                onClick={() => toggle("error")}
                className="mt-3 win-border-outset bg-win-grey px-6 py-1.5 text-[13px] font-bold hover:brightness-105 active:translate-x-px active:translate-y-px"
              >
                OK
              </button>
            </div>
          </div>
        </MobileWin>

        <MobileWin
          id="perks"
          title="README_FIRST.TXT"
          titleClass="bg-[#800000]"
          open={open.perks}
          onToggle={() => toggle("perks")}
        >
          <div className="p-3.5 font-mono text-[13px] text-black">
            <p className="mb-3 font-bold uppercase underline">House protocols:</p>
            <ul className="mb-4 space-y-3">
              <li>
                - <span className="font-bold">LAUNDRY.SYS</span>: We wash the
                socks. You build the robots.
              </li>
              <li>
                - <span className="font-bold">FOOD.EXE</span>: High-protein fuel.
                Optimized for latency.
              </li>
              <li>
                - <span className="font-bold">SLEEP.DLL</span>: Optional. Not
                recommended during demo day.
              </li>
            </ul>
            <div className="border-2 border-dashed border-red-500 bg-red-50/70 p-3">
              <p className="text-[13px] leading-relaxed text-black">
                Highly addictive environment. May cause sudden career pivots.
              </p>
            </div>
          </div>
        </MobileWin>

        <MobileWin
          id="photos"
          title="HOUSE_PHOTOS.EXE"
          open={open.photos}
          onToggle={() => toggle("photos")}
        >
          <HousePhotosGallery />
        </MobileWin>

        <MobileWin
          id="offgrid"
          title="OFFGRID.EXE"
          titleClass="bg-[#8b6914]"
          open={open.offgrid}
          onToggle={() => toggle("offgrid")}
        >
          <OffgridPanel />
        </MobileWin>

        <MobileWin
          id="soul"
          title="⚠ SELL_YOUR_SOUL.EXE"
          titleClass="bg-[#cc0000]"
          open={open.soul}
          onToggle={() => toggle("soul")}
        >
          <div className="p-4 text-center font-mono">
            <p className="mb-2 text-2xl font-bold">👹</p>
            <p className="mb-2 text-[15px] font-bold tracking-wide uppercase">
              SELL US YOUR SOUL
            </p>
            <p className="mb-4 text-[13px] leading-relaxed text-gray-600">
              30 days. No distractions. Pure building.
              <br />
              In exchange, we take your soul (and your sleep schedule).
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-red-600 py-3 text-[13px] font-bold tracking-wider text-white uppercase shadow-[3px_3px_0px_rgba(0,0,0,0.3)] transition-all hover:bg-red-700 active:translate-y-px"
            >
              ✦ I ACCEPT — APPLY NOW ✦
            </button>
            <p className="mt-2 text-[11px] text-gray-400 italic">
              Terms: No refunds on sleep lost.
            </p>
          </div>
        </MobileWin>

        <MobileWin
          id="sponsors"
          title="POWER_SUPPLY.INI"
          titleClass="bg-[#4a0080]"
          open={open.sponsors}
          onToggle={() => toggle("sponsors")}
        >
          <SponsorsPanel />
        </MobileWin>

        <MobileWin
          id="news"
          title="NEWS_SIGNAL.EXE"
          titleClass="bg-[#000080]"
          open={open.news}
          onToggle={() => toggle("news")}
        >
          <NewsPanel />
        </MobileWin>

        <MobileWin
          id="cities"
          title="NEXT_NODES.EXE"
          titleClass="bg-[#006400]"
          open={open.cities}
          onToggle={() => toggle("cities")}
        >
          <CitiesPanel />
        </MobileWin>

        <MobileWin
          id="network"
          title="NETWORK_NEIGHBORHOOD.EXE"
          open={open.network}
          onToggle={() => toggle("network")}
        >
          <NetworkNeighborhood />
        </MobileWin>

        <MobileWin
          id="partner"
          title="PARTNER_NODE.SYS"
          titleClass="bg-[#7a007a]"
          open={open.partner}
          onToggle={() => toggle("partner")}
        >
          <div className="p-3 font-mono">
            <div className="relative overflow-hidden border-2 border-purple-700/60 bg-linear-to-b from-[#1a001a] to-[#000000] p-3.5">
              <div className="mb-2 flex justify-between text-[10px] font-bold tracking-widest text-purple-400">
                <span>PARTNER_NODE.SYS</span>
                <span>NODE: VARIANCE.HOUSE</span>
              </div>
              <p className="mb-1.5 font-anton text-3xl leading-none text-purple-300 uppercase">
                Variance
              </p>
              <p className="mb-2.5 text-[12px] leading-relaxed text-purple-100/80">
                30-day deep-tech residency. Bengaluru. Same month as Delhi — Sept
                15 to Oct 15. Shared mentors, shared sponsors, stacked credits.
                No fee. No equity. Your work stays yours.
              </p>
              <a
                href="https://www.variance.house"
                target="_blank"
                rel="noopener noreferrer"
                className="block win-border-outset bg-purple-600 py-2.5 text-center text-[12px] font-bold text-white uppercase hover:brightness-110 active:translate-y-px"
              >
                ✦ LEARN MORE ↗
              </a>
              <p className="mt-2 text-center text-[10px] text-purple-400/70 italic">
                Mentors, supporters &amp; full credit stack — listed on
                variance.house.
              </p>
            </div>
          </div>
        </MobileWin>

        <MobileWin
          id="devils"
          title="ARCHDEMONS.SYS"
          titleClass="bg-[#4a0000]"
          open={open.devils}
          onToggle={() => toggle("devils")}
        >
          <TheDevils />
        </MobileWin>

        <MobileWin
          id="residents"
          title="RESIDENTS.DAT"
          titleClass="bg-[#006400]"
          open={open.residents}
          onToggle={() => toggle("residents")}
        >
          <ResidentsPanel />
        </MobileWin>

        <MobileWin
          id="specs"
          title="SYSTEM_SPECS.INF"
          open={open.specs}
          onToggle={() => toggle("specs")}
        >
          <SystemSpecs />
        </MobileWin>

        <MobileWin
          id="faq"
          title="FAQ.TXT"
          open={open.faq}
          onToggle={() => toggle("faq")}
        >
          <div className="p-3.5 font-mono">
            {[
              [
                "Who is this for?",
                "Builders. Students, founders, indie hackers — anyone who ships. The bar is momentum, not pedigree.",
              ],
              [
                "What does it cost?",
                "We ask if you can contribute, but it never affects your application. Be honest — need-based support exists and nobody is turned away over money.",
              ],
              [
                "Where is it?",
                "A premium villa in Delhi. 4BHK, terrace, garden. Sept 15 – Oct 15.",
              ],
              [
                "Do I need to know how to code already?",
                "Being a builder is the real requirement. Code helps; momentum wins.",
              ],
              [
                "Is it really about the good life?",
                "Yes. Ship like you mean it, then actually enjoy the best 30 days of your year. That is the whole point.",
              ],
            ].map(([q, a]) => (
              <div key={q} className="border-b border-gray-200 py-3 last:border-0">
                <p className="text-[14px] font-bold text-black">&gt; {q}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{a}</p>
              </div>
            ))}
          </div>
        </MobileWin>

        <MobileWin
          id="helpdesk"
          title="HELPDESK.EXE"
          titleClass="bg-[#008080]"
          open={open.helpdesk}
          onToggle={() => toggle("helpdesk")}
        >
          <ContactPanel />
        </MobileWin>

        <footer className="px-6 pt-4 pb-2 text-center font-mono text-[10px] leading-relaxed text-white/60">
          HACK47 © 2026 — Delhi&apos;s first hacker house.
          <br />
          Batch #001: Sept 15 – Oct 15 · More cities loading…
          <br />
          Co-conducted with{" "}
          <a
            href="https://www.variance.house"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-white/90 underline"
          >
            variance.house
          </a>
        </footer>
      </main>

      {showForm && <SoulForm onClose={() => setShowForm(false)} />}

      {/* ── XP taskbar — docked CTA + jump pills ── */}
      <nav className="fixed inset-x-0 bottom-0 z-[9500] flex items-center gap-1.5 bg-linear-to-b from-[#245edb] via-[#3f8cf3] to-[#245edb] px-2 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] shadow-[0_-2px_6px_rgba(0,0,0,0.45)]">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-9 shrink-0 items-center gap-1 rounded-[3px] bg-linear-to-b from-[#388e3c] via-[#4caf50] to-[#388e3c] px-2.5 text-white shadow-[inset_2px_2px_2px_rgba(255,255,255,0.35),inset_-2px_-2px_3px_rgba(0,0,0,0.25)] transition-all hover:brightness-110 active:brightness-90"
        >
          <ShieldCheck className="h-4 w-4 text-white brightness-200" />
          <span className="text-[12px] font-bold italic tracking-tight uppercase drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
            start
          </span>
        </button>
        <div className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto px-0.5">
          {[
            { id: "photos", label: "Photos" },
            { id: "offgrid", label: "Offgrid" },
            { id: "cities", label: "Nodes" },
            { id: "news", label: "News" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => openApp(t.id)}
              className="h-8 shrink-0 rounded-[2px] border border-white/30 border-r-black/40 border-b-black/40 bg-[#3c81f3] px-2.5 text-[11px] font-bold text-white uppercase transition-colors hover:bg-[#4a90e2] active:bg-[#2c6ecb]"
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-[3px] bg-[#e81123] px-3 text-[12px] font-bold tracking-wide text-white uppercase win-border-outset shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] transition-all hover:brightness-110 active:translate-y-px"
        >
          <Flame className="h-3.5 w-3.5" />
          Apply
        </button>
      </nav>
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
