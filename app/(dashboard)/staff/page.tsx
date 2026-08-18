"use client";

import React, { useEffect, useState } from "react";
import { getStaffMembers, createStaffMember } from "@/lib/api/staff";
import { getBusinessMe } from "@/lib/api/auth";
import { StaffMember, UserRole } from "@/lib/api/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { UserCheck, UserPlus, Mail, Lock, ShieldAlert } from "lucide-react";

export default function StaffPage() {
  const { showSuccess, showError } = useToast();

  const [isOwner, setIsOwner] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add staff modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STAFF");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const meRes = await getBusinessMe();
    if (meRes.data?.role !== "OWNER") {
      setIsOwner(false);
      setLoading(false);
      return;
    }
    setIsOwner(true);

    const staffRes = await getStaffMembers();
    if (staffRes.error || !staffRes.data) {
      setError(staffRes.error || "Failed to retrieve staff members");
    } else {
      setStaff(staffRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setSubmitting(true);
    const res = await createStaffMember({
      staffEmail: email.trim(),
      staffFirstName: firstName.trim() || undefined,
      staffLastName: lastName.trim() || undefined,
      password,
      role,
    });

    if (res.error || !res.data) {
      showError("Failed to add staff member", res.error);
    } else {
      showSuccess("Staff member created successfully!");
      setModalOpen(false);
      setEmail("");
      setFirstName("");
      setLastName("");
      setPassword("");
      setRole("STAFF");
      loadData();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Staff Management" description="Manage team permissions and roles" />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="p-8 bg-amber-50/80 border border-amber-200 rounded-3xl text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-amber-950">Owner Permission Required</h3>
        <p className="text-xs text-amber-800 leading-relaxed">
          Staff management is restricted to business Owners. Managers and Staff members cannot add or view other team accounts.
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Invite and manage team members authorized to issue stamps and redeem rewards"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setModalOpen(true)}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Add Staff
          </Button>
        }
      />

      {staff.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-8 h-8 text-slate-400" />}
          title="No staff members added yet"
          description="Create staff accounts for your managers and register clerks so they can issue stamps."
          actionText="Add Staff"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {member.user?.firstName
                      ? `${member.user.firstName} ${member.user.lastName || ""}`
                      : "Staff User"}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{member.user?.email}</td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={member.role === "OWNER" ? "lime" : member.role === "MANAGER" ? "info" : "neutral"}
                      size="sm"
                    >
                      {member.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right text-xs text-slate-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Staff Member"
        description="Create credentials for a new manager or staff member."
      >
        <form onSubmit={handleCreateStaff} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="e.g. Aman"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              placeholder="e.g. Singh"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="staff@business.com"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { label: "STAFF (Add stamps & process redemptions)", value: "STAFF" },
              { label: "MANAGER (Customer & rewards management)", value: "MANAGER" },
            ]}
          />

          <div className="flex items-center justify-end gap-2.5 pt-4">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting} loadingText="Creating...">
              Add Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
