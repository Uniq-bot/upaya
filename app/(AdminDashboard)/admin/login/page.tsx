"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UpayaLogo } from "@/components/UpayaLogo";
import { ShieldCheck, Lock, Mail, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.message || "Invalid credentials or unauthorized access");
      }
    } catch {
      setError("Unable to connect to the authentication server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#09090B] flex flex-col justify-center items-center p-4 font-sans selection:bg-[#84CC16] selection:text-white relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#84CC16]/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <UpayaLogo size="sm" showTagline={false} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-[#84CC16] text-[11px] font-extrabold tracking-widest uppercase border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Portal
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Sign In</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authenticate to manage platform businesses, owners, and system configurations.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-semibold flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@upaya.io"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#09090B] font-medium outline-none transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#09090B] font-medium outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Access Admin Console
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>Secure Cookie JWT Session Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}