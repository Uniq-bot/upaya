"use client";

import React, { useEffect, useState } from "react";
import { getDashboardData } from "@/lib/api/business";
import { getBusinessMe } from "@/lib/api/auth";
import { DashboardStats, ActivityItem, UserSession } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard, SkeletonTable } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Users, Award, Gift, Receipt, Sparkles, Activity, Clock } from "lucide-react";

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const [meRes, dashRes] = await Promise.all([getBusinessMe(), getDashboardData()]);

    if (meRes.data) {
      setSession(meRes.data);
    }

    if (dashRes.error || !dashRes.data) {
      setError(dashRes.error || "Failed to load dashboard data");
    } else {
      setStats(dashRes.data.stats);
      setActivities(dashRes.data.activities || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = session?.user.firstName || session?.user.email.split("@")[0] || "Team";
  const businessName = session?.business.name || "Business";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-md w-64 animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded-md w-36 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-50 border border-lime-200 rounded-full text-[#65a30d] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Dashboard Overview
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {getGreeting()}, <span className="text-[#84CC16]">{firstName}</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500">{businessName}</p>
      </div>

      {/* Main Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customers Card */}
        <Card className="hover:border-[#84CC16]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customers</span>
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {stats?.customers || 0}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Total enrolled members</p>
          </div>
        </Card>

        {/* Stamps Issued Card */}
        <Card className="hover:border-[#84CC16]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stamps Issued</span>
            <div className="p-2.5 bg-lime-50 text-[#65a30d] rounded-xl border border-lime-200">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {stats?.stampsIssued || 0}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Total stamps awarded</p>
          </div>
        </Card>

        {/* Active Rewards Card */}
        <Card className="hover:border-[#84CC16]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Rewards</span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-200">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {stats?.activeRewards || 0}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Active claimable rewards</p>
          </div>
        </Card>

        {/* Total Redemptions Card */}
        <Card className="hover:border-[#84CC16]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Redemptions</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {stats?.redemptions || 0}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Total processed rewards</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#84CC16]" /> Recent Activity
          </h3>
          <span className="text-xs text-slate-400 font-medium">Real-time log</span>
        </div>

        {activities.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-6 h-6 text-slate-400" />}
            title="No recent activity"
            description="Activity such as new customers, earned stamps, and redeemed rewards will appear here."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
            {activities.map((act) => (
              <div key={act.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl text-xs font-bold ${
                    act.type === "STAMP"
                      ? "bg-lime-50 text-[#65a30d] border border-lime-200"
                      : act.type === "REDEMPTION"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    {act.type === "STAMP" ? <Award className="w-4 h-4" /> : act.type === "REDEMPTION" ? <Receipt className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">{act.description}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-medium shrink-0 ml-2">
                  {formatTimeAgo(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
