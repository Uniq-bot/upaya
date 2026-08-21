"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UpayaLogo } from "@/components/UpayaLogo";
import { ShieldCheck, LogOut, Building2, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<{ id: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function loadSession() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();

        if (res.status === 401 || data.message === "Unauthorized" || data.error) {
          setSession(null);
          router.replace("/admin/login");
        } else {
          setSession(data);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      setSession(null);
      router.replace("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#84CC16] animate-spin" />
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Authenticating Super Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#09090B] flex flex-col font-sans selection:bg-[#84CC16] selection:text-white">
      {/* Admin Top Navigation */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <UpayaLogo size="sm" showTagline={false} theme="dark" />
            </Link>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-lime-500/20 text-[#84CC16] border border-[#84CC16]/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden sm:flex items-center gap-2">
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  pathname === "/admin"
                    ? "bg-slate-800 text-[#84CC16]"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Building2 className="w-4 h-4" /> Businesses
              </Link>
              <Link
                href="/dashboard"
                target="_blank"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" /> Business App Preview &rarr;
              </Link>
            </nav>

            {session && (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-white leading-none">{session.email}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{session.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 border border-slate-700 hover:border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  title="Sign out of Admin Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>UPAYA Loyalty Platform &bull; Super Admin Console</span>
          <span className="text-[11px] font-mono text-slate-400">System Time: {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}