"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getCustomers, createCustomer } from "@/lib/api/customers";
import { Customer } from "@/lib/api/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { Users, Search, UserPlus, Phone, Mail, Award, ChevronRight } from "lucide-react";

export default function CustomersPage() {
  const { showSuccess, showError } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add customer modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getCustomers();
    if (res.error || !res.data) {
      setError(res.error || "Failed to retrieve customers");
    } else {
      setCustomers(res.data.customers || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(query)) ||
        c.phone.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query))
    );
  }, [customers, searchQuery]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setSubmitting(true);
    const res = await createCustomer({
      phone: phone.trim(),
      name: name.trim() || undefined,
      email: email.trim() || undefined,
    });

    if (res.error || !res.data) {
      showError("Failed to add customer", res.error);
    } else {
      showSuccess("Customer created successfully!");
      setModalOpen(false);
      setPhone("");
      setName("");
      setEmail("");
      loadData();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customers Directory" description="Search and manage business loyalty members" />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers Directory"
        description="Lookup members, manage stamps, and track redemption activity"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setModalOpen(true)}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Add Customer
          </Button>
        }
      />

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Search by customer name or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-slate-400" />}
          title={searchQuery ? "No matching customers found" : "No customers registered yet"}
          description={
            searchQuery
              ? `No customer matches "${searchQuery}". Try a different name or phone number.`
              : "Customers who join via your NFC tag or staff entry will appear here."
          }
          actionText={searchQuery ? undefined : "Add Customer"}
          onAction={searchQuery ? undefined : () => setModalOpen(true)}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Stamp Balance</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <Link href={`/customers/${cust.id}`} className="font-bold text-slate-900 hover:text-[#84CC16] transition">
                        {cust.name || "Unnamed Customer"}
                      </Link>
                      {cust.email && <div className="text-xs text-slate-400 font-normal">{cust.email}</div>}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">{cust.phone}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#65a30d] bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200">
                        <Award className="w-3.5 h-3.5" /> {cust.stampBalance} Stamps
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(cust.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/customers/${cust.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#84CC16] hover:underline"
                      >
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Responsive View */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.map((cust) => (
              <Link key={cust.id} href={`/customers/${cust.id}`} className="block">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{cust.name || "Unnamed Customer"}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <Phone className="w-3 h-3" /> {cust.phone}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#65a30d] bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200">
                      <Award className="w-3.5 h-3.5" /> {cust.stampBalance}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Customer"
        description="Register a new member to your business loyalty program."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 pt-2">
          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="e.g. +1 555-0199"
            icon={<Phone className="w-4 h-4" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Customer Name (Optional)"
            placeholder="e.g. Rohit Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="rohit@example.com"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-4">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              loadingText="Creating..."
            >
              Add Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
