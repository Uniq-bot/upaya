"use client";

import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 animate-pulse">
      <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
      <div className="h-8 bg-slate-200 rounded-lg w-1/2"></div>
      <div className="h-3 bg-slate-100 rounded-md w-2/3"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 border-b border-slate-100 px-4 flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/6"></div>
        </div>
      ))}
    </div>
  );
}
