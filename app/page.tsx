"use client";

import React from "react";
import Link from "next/link";
import { UpayaLogo } from "@/components/UpayaLogo";
import { Store, Smartphone, ArrowRight, ShieldCheck, Sparkles, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#09090B] flex flex-col justify-between font-sans selection:bg-[#84CC16] selection:text-white">
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <UpayaLogo size="sm" showTagline={false} />
          <Link
            href="/login"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
          >
            <Store className="w-3.5 h-3.5" /> Business Sign In
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-12 my-auto">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-50 border border-lime-200 text-[#65a30d] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Modern Loyalty Platform for Business
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none">
            Digital Loyalty, <br className="hidden sm:block" />
            <span className="text-[#84CC16]">One NFC Tap Away</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
            Upaya connects businesses with customers seamlessly. Customers tap NFC tags to view reward programs and check stamp cards instantly.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Business Portal Link */}
          <Link href="/login" className="group">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-[#84CC16]/50 transition text-left space-y-4">
              <div className="p-3 bg-lime-50 text-[#65a30d] rounded-2xl w-fit border border-lime-200">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#84CC16] transition flex items-center justify-between">
                  Business Portal <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sign in to manage customers, issue stamps, create rewards, and view live dashboard metrics.
                </p>
              </div>
            </div>
          </Link>

          {/* Customer NFC Join Demo Link */}
          <Link href="/join/himalayan-coffee" className="group">
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xs hover:shadow-xl hover:border-[#84CC16] transition text-left space-y-4">
              <div className="p-3 bg-slate-800 text-[#84CC16] rounded-2xl w-fit border border-slate-700">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#84CC16] transition flex items-center justify-between">
                  Customer NFC Tap <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Try the public customer flow. Experience dynamic NFC check-in without needing a business account.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#84CC16]" />
          <span>Production Ready • Cookie JWT Authentication • Zero Hardcoded Data</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#84CC16]" />
            <span>UPAYA Loyalty Platform &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px] font-bold">
            <span>TAP . CONNECT . RETURN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}