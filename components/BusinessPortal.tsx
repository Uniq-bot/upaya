"use client";

import React, { useState, useEffect } from "react";
import { UpayaLogo } from "./UpayaLogo";
import { PosTerminal } from "./PosTerminal";
import {
  Store,
  UserCheck,
  Plus,
  Award,
  Users,
  PlusCircle,
  RefreshCw,
  Stamp,
  CheckCircle2,
  Shield,
  CreditCard,
} from "lucide-react";

export const BusinessPortal: React.FC = () => {
  // Login State
  const [email, setEmail] = useState("owner@business.com");
  const [password, setPassword] = useState("password123");
  const [session, setSession] = useState<{
    user?: { id: string; email: string; firstName?: string; lastName?: string; role: string };
    business?: { id: string; name: string; slug: string };
  } | null>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Apply dark mode class to document body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active Sub-tab
const [activeTab, setActiveTab] = useState<"pos" | "stamps" | "program" | "rewards" | "staff">("pos");

// Determine accessible tabs based on role
const userRole = session?.user?.role ?? "";
const allowedTabs: Array<"pos" | "stamps" | "program" | "rewards" | "staff"> =
  userRole === "STAFF"
    ? ["pos", "stamps"]
    : ["pos", "stamps", "program", "rewards", "staff"];

  useEffect(() => {
    if (session && !allowedTabs.includes(activeTab)) {
      setActiveTab("pos");
    }
  }, [session, activeTab, userRole]);

  // Program State
  const [programName, setProgramName] = useState("VIP Coffee Club");
  const [stampsRequired, setStampsRequired] = useState(10);

  // Rewards State
  const [rewardName, setRewardName] = useState("Free Cappuccino");
  const [rewardDesc, setRewardDesc] = useState("Get 1 free premium coffee drink");
  const [rewardStamps, setRewardStamps] = useState(5);
  const [rewardsList, setRewardsList] = useState<Array<{ id: string; name: string; description?: string; stampsRequired: number }>>([]);

  // Customer Management & Stamp Issuance
  const [custPhone, setCustPhone] = useState("9800000000");
  const [custName, setCustName] = useState("John Doe");
  const [custEmail, setCustEmail] = useState("john@example.com");
  const [stampAmount, setStampAmount] = useState(1);
  const [stampReason, setStampReason] = useState("Store Visit Purchase");
  const [customersList, setCustomersList] = useState<Array<{ id: string; name?: string; phone: string; stampBalance: number }>>([]);

  // Staff State
  const [staffEmail, setStaffEmail] = useState("staff1@business.com");
  const [staffFirstName, setStaffFirstName] = useState("Alice");
  const [staffLastName, setStaffLastName] = useState("Smith");
  const [staffPassword, setStaffPassword] = useState("staffpass123");
  const [staffRole, setStaffRole] = useState<"STAFF" | "MANAGER" | "OWNER">("STAFF");
  const [staffList, setStaffList] = useState<Array<{ id: string; role: string; user: { email: string; firstName?: string; lastName?: string } }>>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/business/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data);
        setFeedback({ type: "success", text: `Logged in as ${data.user.email} (${data.user.role})` });
      } else {
        setFeedback({ type: "error", text: data.message || "Invalid credentials" });
      }
    } catch {
      setFeedback({ type: "error", text: "Login request failed" });
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessData = async () => {
    // Fetch customers
    try {
      const cRes = await fetch("/api/business/customers");
      const cData = await cRes.json();
      if (cRes.ok && cData.customers) {
        setCustomersList(cData.customers);
      }
    } catch (e) {
      console.error(e);
    }

    // Fetch rewards
    try {
      const rRes = await fetch("/api/business/rewards");
      const rData = await rRes.json();
      if (rRes.ok && rData.rewards) {
        setRewardsList(rData.rewards);
      }
    } catch (e) {
      console.error(e);
    }

    // Fetch staff
    try {
      const sRes = await fetch("/api/business/staffs");
      const sData = await sRes.json();
      if (sRes.ok && Array.isArray(sData)) {
        setStaffList(sData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session) {
      fetchBusinessData();
    }
  }, [session]);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/business/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: programName, stampsRequired: Number(stampsRequired) }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: "Loyalty program created successfully!" });
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to create program" });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to connect" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/business/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: custName, phone: custPhone, email: custEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: `Customer ${custName} registered successfully!` });
        fetchBusinessData();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to add customer" });
      }
    } catch {
      setFeedback({ type: "error", text: "Error creating customer" });
    } finally {
      setLoading(false);
    }
  };

  const handleIssueStamp = async (customerId: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/business/customers/${customerId}/stamps`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(stampAmount), description: stampReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: `Issued ${stampAmount} stamp(s) to customer!` });
        fetchBusinessData();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to issue stamps" });
      }
    } catch {
      setFeedback({ type: "error", text: "Stamp issuance error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/business/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rewardName,
          description: rewardDesc,
          stampsRequired: Number(rewardStamps),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: "Reward created successfully!" });
        fetchBusinessData();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to create reward" });
      }
    } catch {
      setFeedback({ type: "error", text: "Reward creation failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/business/staffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffEmail,
          staffFirstName,
          staffLastName,
          password: staffPassword,
          role: staffRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: `Staff member ${staffEmail} added!` });
        fetchBusinessData();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to add staff" });
      }
    } catch {
      setFeedback({ type: "error", text: "Add staff error" });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto card-elevated rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <UpayaLogo size="sm" showTagline={false} theme="light" />
        </div>
        <h2 className="text-xl font-black text-[#09090B] tracking-tight">Business Portal Login</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Log in with your UPAYA Business Owner or Staff account credentials.
        </p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#09090B] focus:outline-none focus:border-[#84CC16]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#09090B] focus:outline-none focus:border-[#84CC16]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 glow-lime-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
            Sign In to Business Dashboard
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b]">
      <div className="max-w-5xl mx-auto space-y-6">

      {/* Business Header Bar */}
      <div className="card-elevated rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#84CC16]/15 border border-[#84CC16]/30 flex items-center justify-center text-[#84CC16]">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#09090B]">{session.business?.name || "Business Dashboard"}</h2>
            <p className="text-xs text-slate-500">
              Slug: <span className="text-[#65a30d] font-mono font-bold">{session.business?.slug}</span> | Role:{" "}
              <span className="text-[#09090B] font-bold">{session.user?.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 transition"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            type="button"
            onClick={() => setSession(null)}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 transition"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {allowedTabs.includes("pos") && (
          <button
            onClick={() => setActiveTab("pos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "pos"
                ? "bg-[#84CC16] text-white glow-lime-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" /> POS Register
          </button>
        )}
        {allowedTabs.includes("stamps") && (
          <button
            onClick={() => setActiveTab("stamps")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "stamps"
                ? "bg-[#84CC16] text-white glow-lime-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Stamp className="w-4 h-4" /> Customers & Manual Stamps
          </button>
        )}
        {allowedTabs.includes("program") && (
          <button
            onClick={() => setActiveTab("program")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "program"
                ? "bg-[#84CC16] text-white glow-lime-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Award className="w-4 h-4" /> Loyalty Program
          </button>
        )}
        {allowedTabs.includes("rewards") && (
          <button
            onClick={() => setActiveTab("rewards")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "rewards"
                ? "bg-[#84CC16] text-white glow-lime-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Rewards Catalog
          </button>
        )}
        {allowedTabs.includes("staff") && (
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "staff"
                ? "bg-[#84CC16] text-white glow-lime-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4" /> Staff Management
          </button>
        )}
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

      {/* Tab 0: POS Terminal Register */}
      {activeTab === "pos" && <PosTerminal />}

      {/* Tab 1: Stamp Issuance & Customers */}
      {activeTab === "stamps" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Customer Form */}
          <div className="card-elevated rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#09090B] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#84CC16]" /> Register New Customer
            </h3>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-600">Customer Name</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600">Phone Number</label>
                <input
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600">Email (Optional)</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Customer
              </button>
            </form>
          </div>

          {/* Customers List & Stamp Button */}
          <div className="card-elevated rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#09090B] flex items-center gap-2">
              <Stamp className="w-4 h-4 text-[#84CC16]" /> Customer Directory & Quick Stamp
            </h3>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={stampAmount}
                onChange={(e) => setStampAmount(Number(e.target.value))}
                className="w-20 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-[#09090B]"
              />
              <input
                type="text"
                value={stampReason}
                onChange={(e) => setStampReason(e.target.value)}
                placeholder="Reason / Note"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-[#09090B]"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {customersList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No customers registered yet.</p>
              ) : (
                customersList.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#09090B]">{c.name || "Anonymous"}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{c.phone}</p>
                      <span className="text-[10px] text-[#65a30d] font-bold">
                        Balance: {c.stampBalance} Stamps
                      </span>
                    </div>

                    <button
                      onClick={() => handleIssueStamp(c.id)}
                      disabled={loading}
                      className="bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1"
                    >
                      <Stamp className="w-3.5 h-3.5" /> +{stampAmount} Stamp
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Program Setup */}
      {activeTab === "program" && (
        <div className="card-elevated rounded-2xl p-6 max-w-lg mx-auto">
          <h3 className="text-sm font-bold text-[#09090B] mb-2">Configure Loyalty Program</h3>
          <p className="text-xs text-slate-500 mb-4">
            Set up the master loyalty program parameters for your business location.
          </p>

          <form onSubmit={handleCreateProgram} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Program Name</label>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-[#09090B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Stamps Required for Master Reward</label>
              <input
                type="number"
                min="1"
                value={stampsRequired}
                onChange={(e) => setStampsRequired(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-[#09090B]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 glow-lime-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Loyalty Program
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Rewards Catalog */}
      {activeTab === "rewards" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-elevated rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#09090B] flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#84CC16]" /> Add New Loyalty Reward
            </h3>
            <form onSubmit={handleCreateReward} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-600">Reward Title</label>
                <input
                  type="text"
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600">Description</label>
                <input
                  type="text"
                  value={rewardDesc}
                  onChange={(e) => setRewardDesc(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600">Stamps Required</label>
                <input
                  type="number"
                  min="1"
                  value={rewardStamps}
                  onChange={(e) => setRewardStamps(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Reward
              </button>
            </form>
          </div>

          <div className="card-elevated rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#09090B] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#84CC16]" /> Active Rewards List
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {rewardsList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active rewards created yet.</p>
              ) : (
                rewardsList.map((r) => (
                  <div key={r.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <h4 className="text-xs font-bold text-[#09090B]">{r.name}</h4>
                    {r.description && <p className="text-[11px] text-slate-500">{r.description}</p>}
                    <span className="text-[10px] font-mono font-bold text-[#65a30d] mt-1 inline-block">
                      Requires {r.stampsRequired} Stamps
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Staff Management */}
      {activeTab === "staff" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-elevated rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#09090B] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#84CC16]" /> Add Staff Member
            </h3>
            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-600">Staff Email</label>
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600">First Name</label>
                  <input
                    type="text"
                    value={staffFirstName}
                    onChange={(e) => setStaffFirstName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600">Last Name</label>
                  <input
                    type="text"
                    value={staffLastName}
                    onChange={(e) => setStaffLastName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600">Password</label>
                <input
                  type="password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600">Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as "STAFF" | "MANAGER" | "OWNER")}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#09090B]"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="OWNER">OWNER</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Register Staff
              </button>
            </form>
          </div>

          <div className="card-elevated rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#09090B] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#84CC16]" /> Registered Staff Members
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {staffList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No staff members found.</p>
              ) : (
                staffList.map((s) => (
                  <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#09090B]">{s.user.email}</h4>
                      <p className="text-[11px] text-slate-500">
                        {s.user.firstName} {s.user.lastName}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#84CC16]/20 text-[#4d7c0f] px-2 py-1 rounded border border-[#84CC16]/30">
                      {s.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
      )}
      </div>
    </div>
  );
};
