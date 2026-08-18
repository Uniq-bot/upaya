"use client";

import React from "react";
import { Award, CheckCircle } from "lucide-react";

export interface StampProgressProps {
  currentStamps: number;
  requiredStamps: number;
  showGrid?: boolean;
}

export function StampProgress({
  currentStamps,
  requiredStamps,
  showGrid = true,
}: StampProgressProps) {
  const percentage = Math.min(100, Math.round((currentStamps / Math.max(1, requiredStamps)) * 100));
  const isRewardReady = currentStamps >= requiredStamps;

  return (
    <div className="space-y-4">
      {/* Visual Header & Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className={`w-5 h-5 ${isRewardReady ? "text-[#84CC16]" : "text-slate-400"}`} />
          <span className="text-sm font-bold text-slate-800">Stamp Progress</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-sm font-black">
          <span className={isRewardReady ? "text-[#84CC16]" : "text-slate-900"}>{currentStamps}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">{requiredStamps}</span>
          <span className="text-xs text-slate-400 font-normal ml-1">stamps</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isRewardReady ? "bg-[#84CC16]" : "bg-slate-900"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Interactive / Visual Stamp Grid */}
      {showGrid && (
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
          {Array.from({ length: Math.max(requiredStamps, 10) }).map((_, idx) => {
            const isStamped = idx < currentStamps;
            const isTarget = idx === requiredStamps - 1;

            return (
              <div
                key={idx}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isStamped
                    ? "bg-[#84CC16] text-white border-[#75b813] shadow-xs"
                    : isTarget
                    ? "bg-amber-50 text-amber-600 border-amber-300 border-dashed"
                    : "bg-slate-50 text-slate-300 border-slate-200"
                }`}
              >
                {isStamped ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-[11px] font-mono font-bold">{idx + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isRewardReady && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>🎉 Reward unlocked! Customer has enough stamps.</span>
        </div>
      )}
    </div>
  );
}
