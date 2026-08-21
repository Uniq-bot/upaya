"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Ticket,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Copy,
  Check,
  Mail,
  Phone,
  MapPin,
  Lock,
  UserCheck,
  Sparkles,
  Award,
} from "lucide-react";

interface Owner {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: Owner | null;
  counts: {
    customers: number;
    rewards: number;
    stamps: number;
    members: number;
  };
}

interface SystemStats {
  totalBusinesses: number;
  totalOwners: number;
  totalCustomers: number;
  totalStampsIssued: number;
  totalRedemptions: number;
}

export default function AdminDashboardPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessItem | null>(null);
  const [deletingBusiness, setDeletingBusiness] = useState<BusinessItem | null>(null);

  // Form states - Provisioning
  const [pName, setPName] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pAddress, setPAddress] = useState("");
  const [pOwnerEmail, setPOwnerEmail] = useState("");
  const [pOwnerFirstName, setPOwnerFirstName] = useState("");
  const [pOwnerLastName, setPOwnerLastName] = useState("");
  const [pOwnerPassword, setPOwnerPassword] = useState("");
  const [submittingProvision, setSubmittingProvision] = useState(false);

  // Form states - Editing
  const [eName, setEName] = useState("");
  const [eSlug, setESlug] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eAddress, setEAddress] = useState("");
  const [eOwnerFirstName, setEOwnerFirstName] = useState("");
  const [eOwnerLastName, setEOwnerLastName] = useState("");
  const [eOwnerEmail, setEOwnerEmail] = useState("");
  const [eOwnerPassword, setEOwnerPassword] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Form states - Deleting
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Copy state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Fetch Businesses & Stats
  const fetchData = useCallback(async (query: string = "") => {
    setLoading(true);
    try {
      const [bizRes, statsRes] = await Promise.all([
        fetch(`/api/admin/business${query ? `?q=${encodeURIComponent(query)}` : ""}`),
        fetch("/api/admin/stats"),
      ]);

      if (bizRes.ok) {
        const bizData = await bizRes.json();
        setBusinesses(bizData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setFeedback({ type: "error", message: "Failed to connect to backend service" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(searchQuery);
  }, [searchQuery, fetchData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Open Edit Modal
  const handleOpenEdit = (biz: BusinessItem) => {
    setEditingBusiness(biz);
    setEName(biz.name);
    setESlug(biz.slug);
    setEEmail(biz.email || "");
    setEPhone(biz.phone || "");
    setEAddress(biz.address || "");
    setEOwnerFirstName(biz.owner?.firstName || "");
    setEOwnerLastName(biz.owner?.lastName || "");
    setEOwnerEmail(biz.owner?.email || "");
    setEOwnerPassword("");
  };

  // Provision Business Handler
  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProvision(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: pName,
          businessEmail: pEmail,
          businessPhone: pPhone,
          businessAddress: pAddress,
          ownerEmail: pOwnerEmail,
          ownerFirstName: pOwnerFirstName,
          ownerLastName: pOwnerLastName,
          ownerPassword: pOwnerPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: "success",
          message: `Business '${data.business.name}' provisioned successfully!`,
        });
        setShowProvisionModal(false);
        // Reset Form
        setPName("");
        setPEmail("");
        setPPhone("");
        setPAddress("");
        setPOwnerEmail("");
        setPOwnerFirstName("");
        setPOwnerLastName("");
        setPOwnerPassword("");
        fetchData(searchQuery);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to provision business" });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while provisioning business" });
    } finally {
      setSubmittingProvision(false);
    }
  };

  // Edit Business Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    setSubmittingEdit(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/business/${editingBusiness.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eName,
          slug: eSlug,
          email: eEmail,
          phone: ePhone,
          address: eAddress,
          ownerFirstName: eOwnerFirstName,
          ownerLastName: eOwnerLastName,
          ownerEmail: eOwnerEmail,
          ownerPassword: eOwnerPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: "success",
          message: `Business '${data.business.name}' updated successfully!`,
        });
        setEditingBusiness(null);
        fetchData(searchQuery);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to update business" });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while updating business" });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete Business Handler
  const handleDeleteSubmit = async () => {
    if (!deletingBusiness) return;

    setSubmittingDelete(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/business/${deletingBusiness.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFeedback({
          type: "success",
          message: `Business '${deletingBusiness.name}' and its data deleted successfully!`,
        });
        setDeletingBusiness(null);
        fetchData(searchQuery);
      } else {
        const data = await res.json();
        setFeedback({ type: "error", message: data.error || "Failed to delete business" });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while deleting business" });
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Copy Slug URL
  const copyNfcUrl = (slug: string) => {
    const url = `${window.location.origin}/join/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-50 text-[#65a30d] text-[11px] font-extrabold uppercase tracking-wider border border-lime-200">
            <Sparkles className="w-3.5 h-3.5" /> Platform Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Business Operations & Provisioning
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Provision new client businesses, assign owner accounts, and monitor network-wide loyalty stats.
          </p>
        </div>

        <button
          onClick={() => setShowProvisionModal(true)}
          className="bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" /> Provision New Business
        </button>
      </div>

      {/* Global Alert Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Businesses</span>
            <div className="p-2.5 bg-lime-50 text-[#65a30d] rounded-2xl border border-lime-200">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats ? stats.totalBusinesses : "..."}</p>
          <p className="text-[11px] text-slate-500 font-medium">Active tenant organizations</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Owners</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats ? stats.totalOwners : "..."}</p>
          <p className="text-[11px] text-slate-500 font-medium">Provisioned admin users</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats ? stats.totalCustomers : "..."}</p>
          <p className="text-[11px] text-slate-500 font-medium">Enrolled customer members</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stamps Issued</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats ? stats.totalStampsIssued : "..."}</p>
          <p className="text-[11px] text-slate-500 font-medium">Stamps awarded via NFC</p>
        </div>
      </div>

      {/* Main Content Area: Business Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#84CC16]" /> Registered Businesses
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Showing {businesses.length} tenant businesses
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search business, slug, or owner..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-900 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => fetchData(searchQuery)}
              disabled={loading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#84CC16]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Business Table */}
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-7 h-7 text-[#84CC16] animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No Businesses Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No business matches '${searchQuery}'. Try clearing your filter.`
                  : "No businesses have been provisioned yet. Click '+ Provision New Business' to get started."}
              </p>
            </div>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-[#65a30d] hover:underline"
              >
                Clear Search Filter
              </button>
            ) : (
              <button
                onClick={() => setShowProvisionModal(true)}
                className="inline-flex items-center gap-2 bg-[#84CC16] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" /> Provision First Business
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Business</th>
                  <th className="py-3.5 px-4">Owner Account</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-center">Customers</th>
                  <th className="py-3.5 px-4 text-center">Stamps</th>
                  <th className="py-3.5 px-4 text-center">Rewards</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {businesses.map((biz) => {
                  const ownerName = biz.owner
                    ? `${biz.owner.firstName || ""} ${biz.owner.lastName || ""}`.trim() || biz.owner.email
                    : "No Owner";

                  return (
                    <tr key={biz.id} className="hover:bg-slate-50/80 transition">
                      {/* Business Name & Slug */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {biz.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-[#65a30d] bg-lime-50 border border-lime-200 px-2 py-0.5 rounded-md">
                              /{biz.slug}
                            </span>
                            <button
                              onClick={() => copyNfcUrl(biz.slug)}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                              title="Copy Customer NFC Join Link"
                            >
                              {copiedSlug === biz.slug ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <Link
                              href={`/join/${biz.slug}`}
                              target="_blank"
                              className="text-slate-400 hover:text-[#84CC16]"
                              title="Open Public NFC View"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Owner Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-[#84CC16]" />
                            {ownerName}
                          </p>
                          {biz.owner?.email && (
                            <p className="text-[11px] text-slate-500 font-mono">{biz.owner.email}</p>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-slate-600 text-[11px]">
                          {biz.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-slate-400" /> {biz.email}
                            </div>
                          )}
                          {biz.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {biz.phone}
                            </div>
                          )}
                          {biz.address && (
                            <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-[180px]">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {biz.address}
                            </div>
                          )}
                          {!biz.email && !biz.phone && !biz.address && (
                            <span className="text-slate-400 italic">No contact specified</span>
                          )}
                        </div>
                      </td>

                      {/* Customer Count */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-100">
                          <Users className="w-3 h-3" /> {biz.counts.customers}
                        </span>
                      </td>

                      {/* Stamp Count */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[11px] border border-amber-100">
                          <Ticket className="w-3 h-3" /> {biz.counts.stamps}
                        </span>
                      </td>

                      {/* Rewards Count */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-extrabold text-[11px] border border-purple-100">
                          <Award className="w-3 h-3" /> {biz.counts.rewards}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(biz)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] transition flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>

                          <button
                            onClick={() => setDeletingBusiness(biz)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                            title="Delete Business"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PROVISION BUSINESS MODAL */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-lime-500/20 text-[#84CC16] rounded-xl border border-[#84CC16]/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Provision New Business</h3>
                  <p className="text-xs text-slate-400">Create tenant business & owner admin account</p>
                </div>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Business Details Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#65a30d] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Building2 className="w-4 h-4" /> 1. Business Profile
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Business Name *</label>
                    <input
                      type="text"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Kathmandu Coffee Co."
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Business Email</label>
                    <input
                      type="email"
                      value={pEmail}
                      onChange={(e) => setPEmail(e.target.value)}
                      placeholder="info@kathmanducoffee.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Business Phone</label>
                    <input
                      type="text"
                      value={pPhone}
                      onChange={(e) => setPPhone(e.target.value)}
                      placeholder="+977 9800000000"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Business Address</label>
                    <input
                      type="text"
                      value={pAddress}
                      onChange={(e) => setPAddress(e.target.value)}
                      placeholder="Thamel, Kathmandu"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Account Section */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#65a30d] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <UserCheck className="w-4 h-4" /> 2. Business Owner Account
                </h4>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Owner Email Address *</label>
                  <input
                    type="email"
                    value={pOwnerEmail}
                    onChange={(e) => setPOwnerEmail(e.target.value)}
                    placeholder="owner@kathmanducoffee.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Owner First Name</label>
                    <input
                      type="text"
                      value={pOwnerFirstName}
                      onChange={(e) => setPOwnerFirstName(e.target.value)}
                      placeholder="Ram"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Owner Last Name</label>
                    <input
                      type="text"
                      value={pOwnerLastName}
                      onChange={(e) => setPOwnerLastName(e.target.value)}
                      placeholder="Sharma"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Initial Owner Password *</label>
                  <input
                    type="password"
                    value={pOwnerPassword}
                    onChange={(e) => setPOwnerPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProvision}
                  className="px-5 py-2.5 bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submittingProvision ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Provision Business & Owner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BUSINESS MODAL */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-lime-500/20 text-[#84CC16] rounded-xl border border-[#84CC16]/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Edit Business Details</h3>
                  <p className="text-xs text-slate-400">Update organization settings & owner info</p>
                </div>
              </div>
              <button
                onClick={() => setEditingBusiness(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#65a30d] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Building2 className="w-4 h-4" /> Business Profile
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Business Name</label>
                    <input
                      type="text"
                      value={eName}
                      onChange={(e) => setEName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">URL Slug</label>
                    <input
                      type="text"
                      value={eSlug}
                      onChange={(e) => setESlug(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium font-mono text-[#65a30d] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Business Email</label>
                    <input
                      type="email"
                      value={eEmail}
                      onChange={(e) => setEEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Business Phone</label>
                    <input
                      type="text"
                      value={ePhone}
                      onChange={(e) => setEPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Business Address</label>
                  <input
                    type="text"
                    value={eAddress}
                    onChange={(e) => setEAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Owner Account Edit */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#65a30d] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <UserCheck className="w-4 h-4" /> Owner Account Settings
                </h4>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Owner Email</label>
                  <input
                    type="email"
                    value={eOwnerEmail}
                    onChange={(e) => setEOwnerEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Owner First Name</label>
                    <input
                      type="text"
                      value={eOwnerFirstName}
                      onChange={(e) => setEOwnerFirstName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Owner Last Name</label>
                    <input
                      type="text"
                      value={eOwnerLastName}
                      onChange={(e) => setEOwnerLastName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Reset Owner Password <span className="text-slate-400 font-normal">(Leave blank to keep current password)</span>
                  </label>
                  <input
                    type="password"
                    value={eOwnerPassword}
                    onChange={(e) => setEOwnerPassword(e.target.value)}
                    placeholder="New owner password..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#84CC16] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2.5 bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submittingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Business Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">Delete Business</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">{deletingBusiness.name}</span>?
                This action will permanently delete all associated customer profiles, loyalty programs, rewards, and stamp logs.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBusiness(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submittingDelete}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {submittingDelete ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Delete Business
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}