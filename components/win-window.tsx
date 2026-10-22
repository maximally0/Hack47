"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { X, Minus, Square } from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

interface WinWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  titleBarClassName?: string;
  /** Pixel X computed by parent */
  startX?: number;
  /** Pixel Y computed by parent */
  startY?: number;
  isActive?: boolean;
  onActivate?: () => void;
  floating?: boolean;
  zIndex?: number;
}

export const WinWindow: React.FC<WinWindowProps> = ({
  id,
  title,
  children,
  onClose,
  className,
  titleBarClassName,
  startX = 50,
  startY = 50,
  isActive = false,
  onActivate,
  floating = true,
  zIndex,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);
  const floatTweenRef = useRef<gsap.core.Tween | null>(null);
  const draggableRef = useRef<Draggable[] | null>(null);

  useEffect(() => {
    if (!windowRef.current || !titleBarRef.current) return;

    const el = windowRef.current;

    gsap.set(el, { left: startX, top: startY });

    // Draggable
    draggableRef.current = Draggable.create(el, {
      handle: titleBarRef.current,
      bounds: ".desktop-environment",
      type: "left,top",
      onPress: () => {
        onActivate?.();
        floatTweenRef.current?.pause();
      },
      onRelease: () => {
        if (floating) floatTweenRef.current?.resume();
      },
    });

    // Entrance
    gsap.fromTo(el,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
    );

    // Floating bob
    if (floating) {
      floatTweenRef.current = gsap.to(el, {
        top: startY + 10,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 2,
      });
    }

    return () => {
      floatTweenRef.current?.kill();
      draggableRef.current?.[0]?.kill();
    };
  }, []);

  const computedZ = zIndex ?? (isActive ? 100 : 10);

  return (
    <div
      ref={windowRef}
      className={cn(
        "win-window absolute flex flex-col bg-[#c0c0c0] win-border-outset select-none shadow-[4px_4px_12px_rgba(0,0,0,0.3)]",
        className
      )}
      style={{ zIndex: computedZ, opacity: 1 }}
      onMouseDown={onActivate}
    >
      <div
        ref={titleBarRef}
        className={cn(
          "win-titlebar flex items-center justify-between p-1 bg-linear-to-r from-[#0058ee] to-[#3789f8] text-white cursor-grab active:cursor-grabbing shrink-0",
          !isActive && !titleBarClassName && "from-[#7a96c8] to-[#a0b8dc]",
          titleBarClassName
        )}
      >
        <div className="flex items-center gap-1.5 px-1 overflow-hidden">
          <span className="text-[11px] font-bold truncate text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)] leading-tight">
            {title}
          </span>
        </div>
        <div className="flex gap-[2px] shrink-0">
          <button
            aria-label="Minimize"
            className="win-btn w-[21px] h-[21px] bg-win-grey win-border-outset flex items-center justify-center active:translate-x-px active:translate-y-px"
          >
            <Minus className="w-3.5 h-3.5 text-black" strokeWidth={3} />
          </button>
          <button
            aria-label="Maximize"
            className="win-btn w-[21px] h-[21px] bg-win-grey win-border-outset flex items-center justify-center active:translate-x-px active:translate-y-px"
          >
            <Square className="w-2.5 h-2.5 text-black" strokeWidth={4} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            aria-label="Close"
            className="win-btn close w-[21px] h-[21px] bg-[#e81123] text-white win-border-outset flex items-center justify-center active:translate-x-px active:translate-y-px ml-0.5"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>
      <div className="win-content m-[3px] p-0.5 win-border-inset bg-[#ffffff] text-black overflow-y-auto max-h-[calc(100vh-120px)]">
        <div className="bg-[#ffffff] min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
};
