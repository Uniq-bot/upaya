"use client";

import React, { useEffect, useState } from "react";
import { getBusinessMe } from "@/lib/api/auth";
import { updateBusinessProfile } from "@/lib/api/business";
import { UserSession } from "@/lib/api/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { Store, User, Smartphone, Copy, Check, Save } from "lucide-react";

export default function SettingsPage() {
  const { showSuccess, showError } = useToast();

  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Business profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getBusinessMe();
    if (res.error || !res.data) {
      setError(res.error || "Failed to load business profile");
    } else {
      setSession(res.data);
      setName(res.data.business.name || "");
      setEmail(res.data.business.email || "");
      setPhone(res.data.business.phone || "");
      setAddress(res.data.business.address || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const res = await updateBusinessProfile({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });

    if (res.error) {
      showError("Failed to update settings", res.error);
    } else {
      showSuccess("Business settings updated successfully!");
      loadData();
    }
    setSaving(false);
  };

  const getJoinUrl = () => {
    if (typeof window !== "undefined" && session?.business.slug) {
      return `${window.location.origin}/join/${session.business.slug}`;
    }
    return `https://upaya.com/join/${session?.business.slug || "business"}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getJoinUrl());
    setCopied(true);
    showSuccess("NFC Tap URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Business Settings" description="Manage your business information and NFC tag URL" />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !session) {
    return <ErrorState message={error || "Could not load settings"} onRetry={loadData} />;
  }

  const isOwner = session.role === "OWNER";

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Business Settings"
        description="Configure business contact information and public NFC customer tap link"
      />

      {/* Public NFC Tap Link Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#84CC16] uppercase tracking-wider">
            <Smartphone className="w-4 h-4" /> NFC Tag Public Join Link
          </div>
          <Badge variant="lime" size="sm">
            NO AUTH REQUIRED
          </Badge>
        </div>

        <div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Program your NFC physical tags with this URL. When customers tap their phones, they open this dynamic business card directly:
          </p>

          <div className="flex items-center gap-2 p-3 bg-slate-800/90 rounded-xl border border-slate-700 font-mono text-xs text-slate-200">
            <span className="truncate flex-1">{getJoinUrl()}</span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 bg-[#84CC16] hover:bg-[#7bbd15] text-white rounded-lg transition shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Card>

      {/* Business Information Card */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#84CC16]" /> Business Profile
            </div>
          }
          subtitle="Update public business profile information"
        />

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
          <Input
            label="Business Name"
            required
            disabled={!isOwner}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Phone"
              disabled={!isOwner}
              placeholder="+1 555-0122"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Business Email"
              type="email"
              disabled={!isOwner}
              placeholder="contact@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Input
            label="Address"
            disabled={!isOwner}
            placeholder="123 Main Street, Suite 400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {isOwner && (
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={saving}
                loadingText="Saving..."
                icon={<Save className="w-4 h-4" />}
              >
                Save Settings
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Account Info Card */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-sky-600" /> Account Profile
            </div>
          }
        />
        <div className="space-y-3 pt-2 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">User Email</span>
            <span className="font-bold text-slate-900 font-mono">{session.user.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Assigned Role</span>
            <Badge variant={isOwner ? "lime" : "info"} size="sm">
              {session.role}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
