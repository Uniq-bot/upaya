"use client";

import React, { useState } from "react";
import { UpayaLogo } from "./UpayaLogo";
import { ShieldCheck, Building2, Plus, RefreshCw, CheckCircle2 } from "lucide-react";

export const AdminPortal: React.FC = () => {
  const [adminEmail, setAdminEmail] = useState("upaya@admin.io");
  const [adminPassword, setAdminPassword] = useState("upaya123");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Business Onboarding Form State
  const [bName, setBName] = useState("Coffee House Kathmandu");
  const [bEmail, setBEmail] = useState("contact@coffeehouse.com");
  const [bPhone, setBPhone] = useState("+977-9800000000");
  const [bAddress, setBAddress] = useState("Thamel, Kathmandu");
  const [ownerEmail, setOwnerEmail] = useState("owner@coffeehouse.com");
  const [ownerFirstName, setOwnerFirstName] = useState("Ram");
  const [ownerLastName, setOwnerLastName] = useState("Sharma");
  const [ownerPassword, setOwnerPassword] = useState("ownerpass123");

  const [createdBusiness, setCreatedBusiness] = useState<{
    business: { id: string; name: string; slug: string };
    owner: { id: string; email: string };
  } | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsLoggedIn(true);
        setToken(data.token);
        setFeedback({ type: "success", text: "Super Admin authenticated successfully!" });
      } else {
        setFeedback({ type: "error", text: data.message || "Invalid admin credentials" });
      }
    } catch {
      setFeedback({ type: "error", text: "Login request failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: bName,
          businessEmail: bEmail,
          businessPhone: bPhone,
          businessAddress: bAddress,
          ownerEmail,
          ownerFirstName,
          ownerLastName,
          ownerPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedBusiness(data);
        setFeedback({ type: "success", text: `Business '${data.business.name}' created cleanly!` });
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to create business" });
      }
    } catch {
      setFeedback({ type: "error", text: "Business provisioning error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto card-elevated rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <UpayaLogo size="sm" showTagline={false} theme="light" />
        </div>
        <h2 className="text-xl font-black text-[#09090B] tracking-tight flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#84CC16]" /> Super Admin Login
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Authenticate to provision businesses and business owner accounts.
        </p>

        <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Admin Email</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#09090B] focus:outline-none focus:border-[#84CC16]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Admin Password</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#09090B] focus:outline-none focus:border-[#84CC16]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 glow-lime-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Authenticate Admin Session
          </button>
        </form>

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
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card-elevated rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#65a30d] uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Super Admin Console
            </span>
            <h3 className="text-xl font-black text-[#09090B] mt-1">Provision New Business</h3>
          </div>
          <Building2 className="w-8 h-8 text-[#84CC16]" />
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold border ${
              feedback.type === "success"
                ? "bg-[#84CC16]/10 border-[#84CC16]/40 text-[#4d7c0f]"
                : "bg-red-500/10 border-red-500/30 text-red-600"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleCreateBusiness} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Business Name</label>
              <input
                type="text"
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#09090B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Business Email</label>
              <input
                type="email"
                value={bEmail}
                onChange={(e) => setBEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#09090B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Business Phone</label>
              <input
                type="text"
                value={bPhone}
                onChange={(e) => setBPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#09090B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Business Address</label>
              <input
                type="text"
                value={bAddress}
                onChange={(e) => setBAddress(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#09090B]"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Business Owner User Account
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Owner Email</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#09090B]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Owner First Name</label>
                <input
                  type="text"
                  value={ownerFirstName}
                  onChange={(e) => setOwnerFirstName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#09090B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Owner Last Name</label>
                <input
                  type="text"
                  value={ownerLastName}
                  onChange={(e) => setOwnerLastName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#09090B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Owner Password</label>
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#09090B]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 glow-lime-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Provision Business & Owner
          </button>
        </form>

        {createdBusiness && (
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-[#65a30d] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Business Successfully Provisioned
            </h4>
            <p className="text-xs text-slate-700">
              Business: <span className="font-bold text-[#09090B]">{createdBusiness.business.name}</span>
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Slug: <span className="text-[#65a30d]">{createdBusiness.business.slug}</span>
            </p>
            <p className="text-xs text-slate-500">
              Owner Email: <span className="text-[#09090B] font-semibold">{createdBusiness.owner.email}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
