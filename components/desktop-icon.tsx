"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DesktopIconProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  /** win98-style colored tile behind the glyph (e.g. "bg-[#cc0000]") */
  tile?: string;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  icon: Icon,
  label,
  onClick,
  className,
  tile,
}) => {
  return (
    <div
      className={cn(
        "desktop-icon flex flex-col items-center justify-center w-20 p-1.5 cursor-pointer group hover:bg-white/20 hover:border hover:border-dashed hover:border-white transition-all",
        className
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "w-9 h-9 flex items-center justify-center border border-white/40 shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.45),inset_1px_1px_0_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform",
          tile ?? "bg-[#3a3a3a]"
        )}
      >
        <Icon className="w-5 h-5 text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,0.6)]" />
      </span>
      <span className="mt-1 text-[10px] text-white text-center leading-tight drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)] select-none">
        {label}
      </span>
    </div>
  );
};
