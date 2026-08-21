"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/Toast";
import { UpayaLogo } from "@/components/UpayaLogo";
import { getBusinessMe, logoutBusiness } from "@/lib/api/auth";
import { UserSession } from "@/lib/api/types";
import { Badge } from "@/components/ui/Badge";
import {
  LayoutDashboard,
  Award,
  Gift,
  Users,
  Receipt,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const res = await getBusinessMe();
      if (res.error || !res.data) {
        router.replace("/login");
      } else {
        setSession(res.data);
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  const handleLogout = async () => {
    await logoutBusiness();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 selection:bg-[#84CC16] selection:text-white">
        <div className="w-10 h-10 border-4 border-[#84CC16] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading business dashboard...</p>
      </div>
    );
  }

  if (!session) return null;

  const role = session.role;
  const isOwner = role === "OWNER";
  const isManagerOrOwner = role === "OWNER" || role === "MANAGER";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: true },
    { name: "Program", href: "/program", icon: Award, show: isManagerOrOwner },
    { name: "Rewards", href: "/rewards", icon: Gift, show: true },
    { name: "Customers", href: "/customers", icon: Users, show: true },
    { name: "Redemptions", href: "/redemptions", icon: Receipt, show: true },
    { name: "Staff", href: "/staff", icon: UserCheck, show: isManagerOrOwner },
    { name: "Settings", href: "/settings", icon: Settings, show: isOwner },
  ].filter((item) => item.show);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-[#84CC16] selection:text-white">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 min-h-screen">
          {/* Header Branding */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <UpayaLogo size="sm" theme="dark" showTagline={false} />
          </div>

          {/* Business Info Header */}
          <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-1">
            <h4 className="text-xs font-bold text-white tracking-wide truncate">{session.business.name}</h4>
            <div className="flex items-center gap-2">
              <Badge variant={isOwner ? "lime" : isManagerOrOwner ? "info" : "neutral"} size="sm">
                {role}
              </Badge>
              <span className="text-[11px] text-slate-400 truncate">
                {session.user.firstName || session.user.email}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#84CC16] text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Logout */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header Navigation */}
        <div className="md:hidden sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
          <UpayaLogo size="sm" theme="dark" showTagline={false} />

          <div className="flex items-center gap-3">
            <Badge variant={isOwner ? "lime" : isManagerOrOwner ? "info" : "neutral"} size="sm">
              {role}
            </Badge>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800 border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[57px] z-30 bg-slate-900 border-b border-slate-800 p-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="p-3 bg-slate-800 rounded-xl mb-3 border border-slate-700">
              <p className="text-xs font-bold text-white">{session.business.name}</p>
              <p className="text-[11px] text-slate-400">{session.user.email}</p>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                      isActive ? "bg-[#84CC16] text-white" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-bold text-rose-400 hover:bg-rose-950/30 rounded-xl transition mt-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
