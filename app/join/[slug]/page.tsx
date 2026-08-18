"use client";

import React, { useState, useEffect, use } from "react";
import { UpayaLogo } from "@/components/UpayaLogo";
import { getPublicBusinessRewards, checkOrRegisterCustomer } from "@/lib/api/public";
import { Customer, LoyaltyReward } from "@/lib/api/types";
import { Smartphone, Award, Gift, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function PublicJoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [business, setBusiness] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [program, setProgram] = useState<{ id: string; name: string; stampsRequired: number } | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);

  // Customer form & status
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const res = await getPublicBusinessRewards(slug);
    if (res.error || !res.data) {
      setError(res.error || "Business loyalty program not found");
    } else {
      setBusiness(res.data.business);
      setProgram(res.data.program);
      setRewards(res.data.rewards || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setSubmitting(true);
    setStatusMessage(null);

    const res = await checkOrRegisterCustomer(slug, phone.trim());

    if (res.error || !res.data) {
      setStatusMessage(res.error || "Failed to process request");
    } else {
      if (res.data.customer) {
        setCustomer(res.data.customer);
        setStatusMessage("Welcome back! Here is your current stamp card.");
      } else {
        setStatusMessage(res.data.message || "Checking status...");
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 selection:bg-[#84CC16] selection:text-white">
        <div className="w-12 h-12 border-4 border-[#84CC16] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading business loyalty card...</p>
      </div>
    );
  }

  if (error || !business || !program) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Loyalty Program Unavailable</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error || "Could not find a loyalty program for this business tag."}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center p-4 sm:p-6 font-sans selection:bg-[#84CC16] selection:text-white">
      {/* Brand Header */}
      <header className="w-full max-w-md flex items-center justify-between py-4">
        <UpayaLogo size="sm" showTagline={false} />
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          NFC TAP
        </span>
      </header>

      <main className="w-full max-w-md space-y-6 my-auto py-6">
        {/* Business Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#84CC16]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#84CC16]">
              Digital Loyalty Card
            </span>

            <h1 className="text-2xl font-black tracking-tight">{business.name}</h1>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <Award className="w-4 h-4 text-[#84CC16]" />
              <span className="text-xs font-semibold text-slate-300">{program.name}</span>
              <span className="ml-auto text-xs font-mono font-bold text-slate-400">
                {program.stampsRequired} Stamps required
              </span>
            </div>
          </div>
        </div>

        {/* Customer Interaction Section */}
        {customer ? (
          /* Customer Active Card View */
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{customer.name || customer.phone}</h3>
                <p className="text-xs text-slate-500">Phone: {customer.phone}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#65a30d] text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Member
              </span>
            </div>

            {/* Stamp Display */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Stamp Balance</span>
                <span className="text-lg font-mono font-black text-[#84CC16]">
                  {customer.stampBalance} / {program.stampsRequired}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: program.stampsRequired }).map((_, idx) => {
                  const isEarned = idx < customer.stampBalance;
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-2xl border flex items-center justify-center font-mono text-xs font-bold transition-all ${isEarned
                        ? "bg-[#84CC16] text-white border-[#7bbd15] shadow-xs"
                        : "bg-slate-50 text-slate-300 border-slate-200"
                        }`}
                    >
                      {isEarned ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Redeem Button */}
            {
              customer.stampBalance >= program.stampsRequired && (
                <button
                  disabled
                  className="mt-2 w-full bg-slate-200 text-slate-600 font-bold py-1.5 rounded-lg text-xs transition cursor-not-allowed"
                >
                  Congratulations! You can claim your reward.
                </button>
              )
            }

            {/* Available Rewards */}
            {rewards.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#84CC16]" /> Program Rewards
                </h4>

                <div className="space-y-2">
                  {rewards.map((r) => {
                    const isUnlockable = customer.stampBalance >= r.stampsRequired;
                    return (
                      <div
                        key={r.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition ${isUnlockable
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-slate-50 border-slate-200 opacity-80"
                          }`}
                      >
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{r.name}</h5>
                          {r.description && <p className="text-[11px] text-slate-500">{r.description}</p>}
                        </div>
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl ${isUnlockable ? "bg-[#84CC16] text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                          {r.stampsRequired} Stamps
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setCustomer(null)}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-900 transition pt-2"
            >
              Check another phone number
            </button>
          </div>
        ) : (
          /* Join / Lookup Form */
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Join or Check Loyalty Status</h2>
              <p className="text-xs text-slate-500 mt-1">Enter your phone number to earn stamps and claim rewards at {business.name}.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Smartphone className="w-4 h-4 absolute left-3.5 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="Enter phone number..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20 transition"
                  />
                </div>
              </div>

              {statusMessage && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-3 rounded-xl border border-rose-200">
                  {statusMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !phone.trim()}
                className="w-full py-3 px-4 bg-[#84CC16] hover:bg-[#77b812] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>Checking status...</span>
                ) : (
                  <>
                    <span>Join Loyalty Program</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Active Rewards Preview */}
            {rewards.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#84CC16]" /> Available Rewards
                </h4>
                <div className="space-y-2">
                  {rewards.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{r.name}</h5>
                        {r.description && <p className="text-[11px] text-slate-500">{r.description}</p>}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#65a30d] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        {r.stampsRequired} Stamps
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-[11px] text-slate-600 py-4 font-mono">
        POWERED BY UPAYA LOYALTY PLATFORM
      </footer>
    </div>
  );
}
