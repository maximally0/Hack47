"use client";

import { useEffect, useRef } from "react";

const GATE = 0.68;
const GATE_WIDTH = 0.13;
const CELLS = 16;
const PARTICLES_DESKTOP = 900;
const PARTICLES_MOBILE = 320;
const PRE_LIT = 6;

type Particle = { x: number; y: number; v: number; w: number; o: number };

function seed(p: Particle): Particle {
  p.x = Math.random();
  p.y = -Math.random() * 0.55;
  p.v = 0.002 + Math.random() * 0.0046;
  p.w = Math.random() < 0.1 ? 2.2 : 1.2;
  p.o = 0.22 + Math.random() * 0.6;
  return p;
}

/**
 * Forty thousand applications streaming down a funnel and absorbed into
 * sixteen lights. Drawn on canvas so the particle count stays cheap.
 */
export function SelectionFunnel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mobile = window.matchMedia("(max-width: 639.98px)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const PARTICLES = mobile ? PARTICLES_MOBILE : PARTICLES_DESKTOP;
    const dpr = Math.min(mobile ? 1.5 : 2, window.devicePixelRatio || 1);
    let width = 1;
    let height = 1;
    let frameId = 0;
    let running = false;
    let absorbed = 0;
    let nextCell = PRE_LIT;
    const lit = Array.from({ length: CELLS }, (_, i) => i < PRE_LIT);

    const particles: Particle[] = Array.from({ length: PARTICLES }, () => {
      const p = seed({} as Particle);
      p.y = Math.random() * GATE; // seed mid-flow so the funnel reads full at once
      return p;
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Under reduced motion the loop is off, so repaint the static frame
      // whenever the canvas is resized.
      if (reduceMotion) draw(false);
    };

    function draw(advance = true) {
      ctx!.clearRect(0, 0, width, height);
      const gateY = Math.round(height * GATE);
      const cx = width * 0.5;
      const halfGate = width * GATE_WIDTH * 0.5;

      // funnel walls
      ctx!.strokeStyle = "rgba(242,239,232,.26)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0.5, 0);
      ctx!.lineTo(cx - halfGate, gateY);
      ctx!.moveTo(width - 0.5, 0);
      ctx!.lineTo(cx + halfGate, gateY);
      ctx!.stroke();

      // falling applications
      for (const p of particles) {
        if (advance) {
          p.y += p.v;
          if (p.y >= GATE) {
            absorbed += 1;
            if (absorbed % 70 === 0 && nextCell < CELLS) {
              lit[nextCell] = true;
              nextCell += 1;
            }
            seed(p);
            continue;
          }
        }
        if (p.y <= 0 || p.y >= GATE) continue;
        const t = p.y / GATE;
        const eased = t * t;
        const x = cx + (p.x - 0.5) * width * (1 - eased * (1 - GATE_WIDTH));
        ctx!.fillStyle = `rgba(242,239,232,${(p.o * (0.4 + 0.6 * t)).toFixed(3)})`;
        ctx!.fillRect(x, p.y * height, p.w, p.w * 2.6);
      }

      // the gate
      ctx!.fillStyle = "rgba(242,239,232,.92)";
      ctx!.fillRect(cx - halfGate, gateY, halfGate * 2, 2);

      // sixteen lights
      const top = gateY + 30;
      const barHeight = Math.max(16, height - top - 26);
      const span = width * 0.88;
      const x0 = (width - span) / 2;
      const cellWidth = span / CELLS;
      for (let k = 0; k < CELLS; k += 1) {
        const bx = x0 + k * cellWidth + cellWidth * 0.2;
        const bw = cellWidth * 0.6;
        if (lit[k]) {
          ctx!.fillStyle = "rgba(242,239,232,.96)";
          ctx!.fillRect(bx, top, bw, barHeight);
        } else {
          ctx!.strokeStyle = "rgba(242,239,232,.32)";
          ctx!.strokeRect(
            Math.round(bx) + 0.5,
            top + 0.5,
            Math.round(bw),
            barHeight,
          );
        }
      }
    }

    const loop = () => {
      draw(true);
      frameId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      frameId = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    resize();
    window.addEventListener("resize", resize);

    // Under reduced motion: draw exactly one static frame and never loop.
    if (reduceMotion) {
      draw(false);
    }

    // Pause the RAF loop whenever the canvas is scrolled out of view so it
    // isn't redrawing at 60fps off-screen.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (visible) start();
        else stop();
      },
      { rootMargin: "120px" },
    );
    io.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative mt-10 mb-12 hidden min-h-[400px] flex-1 sm:block">
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        role="img"
        aria-label="Forty thousand applications narrowing through a gate into sixteen lights"
      />
      <div className="lbl absolute left-0 -top-1 text-chalk/62">
        forty thousand builders
      </div>
      <div className="lbl absolute right-0 -top-1 text-chalk/42">
        india · 2026
      </div>
      <div className="lbl absolute left-0 -bottom-0.5 text-chalk/62">
        sixteen lights
      </div>
      <div className="lbl absolute right-0 -bottom-0.5 text-chalk/42">
        the gate closes once
      </div>
    </div>
  );
}
