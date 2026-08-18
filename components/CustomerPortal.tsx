"use client";

import React, { useState } from "react";
import { UpayaLogo } from "./UpayaLogo";
import { Smartphone, Zap, Gift, CheckCircle2, RefreshCw, Sparkles, Award } from "lucide-react";

export const CustomerPortal: React.FC = () => {
  const [slug, setSlug] = useState("coffee-house");
  const [phone, setPhone] = useState("9800000000");
  const [loading, setLoading] = useState(false);
  const [isTapping, setIsTapping] = useState(false);
  const [customerData, setCustomerData] = useState<{
    customer?: {
      id: string;
      name?: string;
      phone: string;
      stampBalance: number;
    };
    business?: { id: string; name: string };
    program?: { id: string; name: string; stampsRequired?: number };
    message?: string;
  } | null>(null);

  const [rewards, setRewards] = useState<
    Array<{
      id: string;
      name: string;
      description?: string;
      stampsRequired: number;
    }>
  >([]);

  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setCustomerData(data);
        if (data.customer) {
          setFeedback({ type: "success", text: `Welcome back! Stamp Balance: ${data.customer.stampBalance}` });
        } else {
          setFeedback({ type: "error", text: "Phone registered to business, but no active stamps yet. Ask staff to stamp your tap!" });
        }
        // Fetch active rewards
        fetchRewards(slug);
      } else {
        setFeedback({ type: "error", text: data.message || "Business or customer not found" });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async (businessSlug: string) => {
    try {
      const res = await fetch(`/api/customer/rewards?slug=${encodeURIComponent(businessSlug)}`);
      const data = await res.json();
      if (res.ok && data.rewards) {
        setRewards(data.rewards);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateNFCTap = async () => {
    setIsTapping(true);
    setTimeout(async () => {
      await handleCheckIn();
      setIsTapping(false);
    }, 1000);
  };

  const handleRedeemReward = async (rewardId: string, rewardName: string) => {
    if (!customerData?.customer?.id) return;
    setRedeemingId(rewardId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/business/rewards/${customerData.customer.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: `🎉 Successfully redeemed: ${rewardName}!` });
        // Refresh customer data
        handleCheckIn();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to redeem reward" });
      }
    } catch {
      setFeedback({ type: "error", text: "Redemption failed" });
    } finally {
      setRedeemingId(null);
    }
  };

  const totalRequiredStamps = customerData?.program?.stampsRequired || 10;
  const currentStamps = customerData?.customer?.stampBalance || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Customer Tap Header Card */}
      <div className="card-elevated rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <UpayaLogo size="sm" showTagline={false} theme="light" />
        </div>

        <h2 className="text-xl font-black text-[#09090B] tracking-tight">
          Customer NFC Loyalty Tap
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Tap your phone on the UPAYA NFC reader or enter your mobile details below to track digital stamps & redeem rewards.
        </p>

        {/* Form Inputs */}
        <form onSubmit={handleCheckIn} className="mt-6 space-y-4 max-w-md mx-auto text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Business Handle / Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#09090B] focus:outline-none focus:border-[#84CC16]"
              placeholder="e.g. coffee-house"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Customer Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#09090B] focus:outline-none focus:border-[#84CC16]"
              placeholder="e.g. 9800000000"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-[#84CC16]" /> : <Smartphone className="w-4 h-4 text-[#84CC16]" />}
              Check In
            </button>

            <button
              type="button"
              onClick={handleSimulateNFCTap}
              disabled={isTapping || loading}
              className={`flex-1 font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 text-white ${
                isTapping ? "bg-[#84CC16] nfc-wave-light" : "bg-[#84CC16] hover:bg-[#65a30d] glow-lime-sm"
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              {isTapping ? "Tapping NFC..." : "Simulate NFC Tap"}
            </button>
          </div>
        </form>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-semibold border ${
              feedback.type === "success"
                ? "bg-[#84CC16]/10 border-[#84CC16]/40 text-[#4d7c0f]"
                : "bg-red-500/10 border-red-500/30 text-red-600"
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* Customer Loyalty Stamp Card View */}
      {customerData && (
        <div className="card-elevated rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#65a30d] uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Active Loyalty Card
              </span>
              <h3 className="text-xl font-black text-[#09090B] mt-1">
                {customerData.business?.name || slug}
              </h3>
              <p className="text-xs text-slate-500">
                {customerData.program?.name || "Standard Rewards Card"}
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-[#65a30d]">
                {currentStamps} <span className="text-xs font-normal text-slate-500">/ {totalRequiredStamps} Stamps</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Phone: {phone}</span>
            </div>
          </div>

          {/* Interactive Stamp Card Grid */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" /> Digital Stamp Balance Card
            </h4>

            <div className="grid grid-cols-5 sm:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              {Array.from({ length: Math.max(totalRequiredStamps, 10) }).map((_, idx) => {
                const isStamped = idx < currentStamps;
                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 relative border ${
                      isStamped
                        ? "bg-[#84CC16]/20 border-[#84CC16] text-[#4d7c0f] scale-105 shadow-sm font-bold"
                        : "bg-white border-slate-200 text-slate-300"
                    }`}
                  >
                    {isStamped ? (
                      <CheckCircle2 className="w-6 h-6 text-[#84CC16]" />
                    ) : (
                      <span className="text-xs font-mono font-bold">{idx + 1}</span>
                    )}
                    <span className="text-[9px] mt-1 font-mono uppercase tracking-tighter">
                      {isStamped ? "Stamped" : "Empty"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Rewards Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-[#84CC16]" /> Available Rewards to Redeem
            </h4>

            {rewards.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                No active rewards found for this program.
              </div>
            ) : (
              <div className="grid gap-3">
                {rewards.map((reward) => {
                  const canRedeem = currentStamps >= reward.stampsRequired;
                  return (
                    <div
                      key={reward.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 flex items-center justify-between transition shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#65a30d]">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-[#09090B]">{reward.name}</h5>
                          {reward.description && (
                            <p className="text-xs text-slate-500">{reward.description}</p>
                          )}
                          <span className="text-[11px] font-mono text-[#65a30d] font-semibold mt-0.5 inline-block">
                            Requires {reward.stampsRequired} Stamps
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRedeemReward(reward.id, reward.name)}
                        disabled={!canRedeem || redeemingId === reward.id}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          canRedeem
                            ? "bg-[#84CC16] hover:bg-[#65a30d] text-white glow-lime-sm"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        }`}
                      >
                        {redeemingId === reward.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Gift className="w-3.5 h-3.5" />
                        )}
                        {canRedeem ? "Redeem" : "Need Stamps"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
