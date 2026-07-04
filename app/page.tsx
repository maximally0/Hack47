"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Monitor, Trash2, Globe, Folder, AlertTriangle, Users } from "lucide-react";
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

/**
 * Compute window positions as a 2x2 grid with gutters.
 * Takes the available viewport minus the icon column (80px) and taskbar (36px).
 * Returns pixel positions for each of the 4 windows.
 */
function computeWindowLayout() {
  if (typeof window === "undefined") {
    return { main: { x: 100, y: 30 }, perks: { x: 550, y: 30 }, photos: { x: 550, y: 350 }, error: { x: 100, y: 400 }, soul: { x: 350, y: 180 }, team: { x: 250, y: 100 }, residents: { x: 350, y: 120 }, specs: { x: 300, y: 200 } };
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

  // Extra windows cascade from center
  const centerX = iconCol + Math.floor(availW / 3);
  const centerY = Math.floor(availH / 4);

  // Soul window: dead center of the screen
  const soulX = iconCol + Math.floor(availW / 2) - 130;
  const soulY = Math.floor(availH / 2) - 80;

  return {
    main: { x: col1X, y: row1Y },
    perks: { x: col2X, y: row1Y },
    photos: { x: col2X, y: row2Y },
    error: { x: col1X, y: row2Y },
    soul: { x: soulX, y: soulY },
    team: { x: centerX - 20, y: centerY },
    residents: { x: centerX + 30, y: centerY + 40 },
    specs: { x: centerX + 60, y: centerY + 80 },
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
    return <MobileBlock />;
  }

  return <DesktopView />;
}

function MobileBlock() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 text-center font-mono">
      <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at center, #4a0000 0%, transparent 70%)" }} />
      <div className="relative z-10">
        <p className="text-5xl mb-6">👹</p>
        <p className="text-red-500 text-xl font-bold uppercase tracking-widest mb-4">ACCESS DENIED</p>
        <p className="text-white text-sm leading-relaxed mb-6 max-w-xs">
          The devil does not negotiate with mobile users.
        </p>
        <p className="text-gray-400 text-xs leading-relaxed mb-6 max-w-xs">
          This experience was forged for real screens. Desktops. Laptops. Tablets. Machines with keyboards and ambition.
        </p>
        <p className="text-gray-400 text-xs leading-relaxed mb-8 max-w-xs">
          You want to join a hacker house but you can&apos;t be bothered to open a laptop? Go get your computer. We&apos;ll wait.
        </p>
        <div className="border border-red-900/50 p-4 max-w-xs">
          <p className="text-red-400/80 text-[10px] leading-relaxed">
            &gt; ERROR: screen.width too pathetic<br/>
            &gt; MINIMUM_REQUIREMENT: 768px<br/>
            &gt; YOUR_SCREEN: disappointing<br/>
            &gt; SOLUTION: use a real computer<br/>
            &gt; STATUS: waiting for you to try harder
          </p>
        </div>
        <p className="text-gray-600 text-[9px] mt-6 italic">Hack47 respects builders who put in effort. This is the first test.</p>
      </div>
    </div>
  );
}

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
  });
  const [windowOrder, setWindowOrder] = useState<string[]>(["soul", "main", "perks", "photos", "error", "team", "residents", "specs"]);
  const [clippyVisible, setClippyVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [layout, setLayout] = useState(computeWindowLayout);

  const desktopRef = useRef<HTMLDivElement>(null);

  // Recompute layout on mount (SSR → client)
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

      {/* Desktop Icons */}
      <div className="desktop-icons absolute top-4 left-3 flex flex-col gap-3 z-20">
        <DesktopIcon icon={Monitor} label="My Computer" onClick={() => toggleWindow("specs", true)} />
        <DesktopIcon icon={Trash2} label="Recycle Bin" onClick={() => alert("Emptying bin...")} />
        <DesktopIcon icon={Globe} label="The Devils" onClick={() => toggleWindow("team", true)} />
        <DesktopIcon icon={Folder} label="House_Photos" onClick={() => toggleWindow("photos", true)} />
        <DesktopIcon icon={Users} label="Residents" onClick={() => toggleWindow("residents", true)} />
        <DesktopIcon icon={Globe} label="LinkedIn" onClick={() => window.open("https://www.linkedin.com/company/hack47", "_blank")} />
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
          className="w-[40vw] min-w-[280px] max-w-[360px]"
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
        {/* Rishul */}
        <div className="flex gap-3 items-start p-2 border border-gray-300 bg-[#f8f8f8]">
          <img
            src="/rishul.jpeg"
            alt="Rishul Chanana"
            className="w-16 h-16 object-cover border-2 border-red-800"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[11px]">Rishul Chanana</p>
            <p className="text-[9px] text-red-700 uppercase tracking-wider mb-1.5">Archdemon I</p>
            <div className="flex gap-2">
              <a href="https://www.linkedin.com/in/rishul-chanana/" target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 hover:underline">LinkedIn ↗</a>
              <a href="https://x.com/rishhul" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-700 hover:underline">𝕏 ↗</a>
            </div>
          </div>
        </div>

        {/* Pratyush */}
        <div className="flex gap-3 items-start p-2 border border-gray-300 bg-[#f8f8f8]">
          <img
            src="/pratyush.jpeg"
            alt="Pratyush Pandey"
            className="w-16 h-16 object-cover border-2 border-red-800"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[11px]">Pratyush Pandey</p>
            <p className="text-[9px] text-red-700 uppercase tracking-wider mb-1.5">Archdemon II</p>
            <div className="flex gap-2">
              <a href="https://www.linkedin.com/in/pratyush-pandey-09b35b219" target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 hover:underline">LinkedIn ↗</a>
              <a href="https://x.com/P_Pratyush7" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-700 hover:underline">𝕏 ↗</a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-300 text-center">
        <p className="text-[8px] text-gray-400 italic">These two traded their souls first. Now they collect yours.</p>
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
        // Strip spaces, dashes, parens for validation
        const digits = v.replace(/[\s\-().+]/g, "");
        if (!/^\d{7,15}$/.test(digits)) return "Enter a valid phone number (7-15 digits).";
        return null;

      case "instagram":
        // Accept @handle or full URL
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
        // Accept @handle or x.com/... or twitter.com/...
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
      <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-4">
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
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
      // Continuous horizontal drift
      gsap.to(cloud, {
        x: dir * (window.innerWidth * 0.5 + Math.random() * 200),
        duration: 25 + Math.random() * 30,
        repeat: -1,
        yoyo: true,
        ease: "none",
      });
      // Vertical float
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
