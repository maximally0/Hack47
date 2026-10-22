"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface TaskbarProps {
  activeTasks: { id: string; title: string }[];
  onTaskClick?: (id: string) => void;
  onStartClick?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  activeTasks,
  onTaskClick,
  onStartClick,
}) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit",
          hour12: true 
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="taskbar fixed bottom-0 left-0 w-full h-[34px] bg-linear-to-b from-[#245edb] via-[#3f8cf3] 10% to-[#245edb] 90% flex items-center p-0 z-[9999] shadow-[0_-2px_6px_rgba(0,0,0,0.4)]">
      <button
        onClick={onStartClick}
        className="start-btn flex items-center gap-1.5 h-full px-4 bg-linear-to-b from-[#388e3c] via-[#4caf50] 50% to-[#388e3c] border-none rounded-tr-[10px] rounded-br-[10px] shadow-[inset_-2px_0_5px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,0.4)] hover:brightness-110 active:brightness-90 transition-all cursor-pointer group"
      >
        <ShieldCheck className="w-5 h-5 text-white brightness-200 group-hover:scale-110 transition-transform" />
        <span className="text-white font-bold italic text-sm tracking-tight drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)] select-none uppercase">
          start
        </span>
      </button>

      <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto no-scrollbar">
        {activeTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskClick?.(task.id)}
            className="task-item flex items-center px-2.5 h-6 bg-[#3c81f3] border border-white/30 border-b-black/40 border-r-black/40 rounded-[2px] text-white text-[11px] min-w-[100px] max-w-[150px] truncate cursor-pointer hover:bg-[#4a90e2] active:bg-[#2c6ecb] transition-colors select-none"
          >
            {task.title}
          </div>
        ))}
      </div>

      <div className="taskbar-clock ml-auto h-full flex items-center px-4 bg-[#0997ff] text-white text-[11px] shadow-[inset_2px_0_5px_rgba(0,0,0,0.3)] select-none border-l border-black/20 font-sans">
        {time}
      </div>
    </div>
  );
};
