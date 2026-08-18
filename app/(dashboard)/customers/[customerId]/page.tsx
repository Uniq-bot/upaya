"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getCustomer, addStamp } from "@/lib/api/customers";
import { redeemReward } from "@/lib/api/redemptions";
import { Customer, StampLedger, RewardRedemption, LoyaltyReward } from "@/lib/api/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StampProgress } from "@/components/ui/StampProgress";
import { SkeletonCard, SkeletonTable } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, PlusCircle, Gift, Phone, Mail, Award, CheckCircle2, History, Receipt } from "lucide-react";

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = use(params);
  const { showSuccess, showError } = useToast();

  const [customerData, setCustomerData] = useState<{
    customer: Customer & {
      program: {
        id: string;
        name: string;
        stampsRequired: number;
        rewards: LoyaltyReward[];
      };
      stamps: StampLedger[];
      redemptions: (RewardRedemption & { reward: { name: string; stampsRequired: number } })[];
    };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add stamp modal state
  const [addStampOpen, setAddStampOpen] = useState(false);
  const [stampAmount, setStampAmount] = useState(1);
  const [stampDescription, setStampDescription] = useState("");
  const [addingStamp, setAddingStamp] = useState(false);

  // Redeem modal state
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redemptionCodeResult, setRedemptionCodeResult] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getCustomer(customerId);
    if (res.error || !res.data) {
      setError(res.error || "Failed to load customer details");
    } else {
      setCustomerData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [customerId]);

  const handleAddStampSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stampAmount <= 0) return;

    setAddingStamp(true);
    const res = await addStamp(customerId, stampAmount, stampDescription.trim() || undefined);

    if (res.error || !res.data) {
      showError("Failed to add stamp", res.error);
    } else {
      showSuccess(`Added ${stampAmount} stamp${stampAmount > 1 ? "s" : ""} to customer!`);
      setAddStampOpen(false);
      setStampAmount(1);
      setStampDescription("");
      loadData();
    }
    setAddingStamp(false);
  };

  const handleRedeemSubmit = async () => {
    if (!selectedReward) return;

    setRedeeming(true);
    const res = await redeemReward(customerId, selectedReward.id);

    if (res.error || !res.data) {
      showError("Redemption failed", res.error);
    } else {
      const code = `CODE-${res.data.redemption.id.slice(-6).toUpperCase()}`;
      setRedemptionCodeResult(code);
      showSuccess("Reward redeemed successfully!");
      loadData();
    }
    setRedeeming(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (error || !customerData) {
    return <ErrorState message={error || "Customer not found"} onRetry={loadData} />;
  }

  const { customer } = customerData;
  const program = customer.program;
  const activeRewards = program.rewards || [];

  return (
    <div className="space-y-6">
      {/* Back Button Header */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
        </Link>
        <PageHeader
          title={customer.name || customer.phone}
          description={`Customer profile & loyalty activity for ${program.name}`}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setAddStampOpen(true)}
                icon={<PlusCircle className="w-4 h-4" />}
              >
                + Add Stamp
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setRedeemOpen(true)}
                icon={<Gift className="w-4 h-4 text-[#84CC16]" />}
              >
                Redeem Reward
              </Button>
            </div>
          }
        />
      </div>

      {/* Customer Info Card & Stamp Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Sidebar Card */}
        <Card className="lg:col-span-1 space-y-4">
          <CardHeader title="Customer Details" />

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Name</span>
              <span className="font-bold text-slate-900">{customer.name || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Phone</span>
              <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
              </span>
            </div>

            {customer.email && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Email</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Joined Date</span>
              <span className="font-bold text-slate-800">
                {new Date(customer.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 font-medium block mb-1">Current Stamp Balance</span>
              <div className="p-3 bg-lime-50 rounded-xl border border-lime-200 flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-[#65a30d]">
                  {customer.stampBalance}
                </span>
                <Award className="w-6 h-6 text-[#65a30d]" />
              </div>
            </div>
          </div>
        </Card>

        {/* Large Stamp Visual Progress */}
        <Card className="lg:col-span-2">
          <CardHeader title="Loyalty Card Progress" subtitle={`${program.name} (${program.stampsRequired} stamps required)`} />
          <div className="pt-4">
            <StampProgress currentStamps={customer.stampBalance} requiredStamps={program.stampsRequired} showGrid={true} />
          </div>
        </Card>
      </div>

      {/* History Tabs / Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stamp Ledger History */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#84CC16]" /> Stamp History
              </div>
            }
          />
          {customer.stamps.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">No stamps added yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs font-medium">
              {customer.stamps.map((stamp) => (
                <div key={stamp.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className={`font-bold ${stamp.amount > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {stamp.amount > 0 ? `+${stamp.amount} Stamp` : `${stamp.amount} Stamp`}
                    </span>
                    {stamp.description && <p className="text-[11px] text-slate-500 mt-0.5">{stamp.description}</p>}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(stamp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Redemption History */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" /> Redemption Log
              </div>
            }
          />
          {customer.redemptions.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">No rewards redeemed yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs font-medium">
              {customer.redemptions.map((red) => (
                <div key={red.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{red.reward.name}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{red.stampsUsed} stamps used</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(red.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Stamp Modal */}
      <Modal
        isOpen={addStampOpen}
        onClose={() => setAddStampOpen(false)}
        title="Add Stamp"
        description={`Award stamps to ${customer.name || customer.phone}`}
      >
        <form onSubmit={handleAddStampSubmit} className="space-y-4 pt-2">
          <Input
            label="Stamp Amount"
            type="number"
            min="1"
            required
            value={stampAmount}
            onChange={(e) => setStampAmount(Number(e.target.value))}
          />

          <Input
            label="Description / Note (Optional)"
            placeholder="e.g. Purchased espresso & croissant"
            value={stampDescription}
            onChange={(e) => setStampDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-4">
            <Button variant="outline" size="sm" onClick={() => setAddStampOpen(false)} disabled={addingStamp}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={addingStamp} loadingText="Adding...">
              + Add {stampAmount} Stamp
            </Button>
          </div>
        </form>
      </Modal>

      {/* Redeem Reward Modal */}
      <Modal
        isOpen={redeemOpen}
        onClose={() => {
          setRedeemOpen(false);
          setSelectedReward(null);
          setRedemptionCodeResult(null);
        }}
        title="Redeem Reward"
        description={`Exchange stamps for an active reward for ${customer.name || customer.phone}`}
      >
        {redemptionCodeResult ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Reward Redeemed!</h3>
            <p className="text-xs text-slate-500">Show this redemption code to staff or customer:</p>

            <div className="p-4 bg-slate-900 text-white rounded-2xl font-mono text-xl font-black tracking-widest">
              {redemptionCodeResult}
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full mt-2"
              onClick={() => {
                setRedeemOpen(false);
                setSelectedReward(null);
                setRedemptionCodeResult(null);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 font-medium">Select a reward to redeem:</p>

            {activeRewards.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active rewards available in program.</p>
            ) : (
              <div className="space-y-2">
                {activeRewards.map((reward) => {
                  const hasEnoughStamps = customer.stampBalance >= reward.stampsRequired;
                  const isSelected = selectedReward?.id === reward.id;

                  return (
                    <div
                      key={reward.id}
                      onClick={() => hasEnoughStamps && setSelectedReward(reward)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? "bg-lime-50/80 border-[#84CC16] ring-2 ring-[#84CC16]/20"
                          : hasEnoughStamps
                          ? "bg-white border-slate-200 hover:border-slate-300"
                          : "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{reward.name}</h4>
                        {reward.description && <p className="text-[11px] text-slate-500">{reward.description}</p>}
                      </div>
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl ${
                        hasEnoughStamps ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                      }`}>
                        {reward.stampsRequired} Stamps
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedReward && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                ⚠️ <strong>{selectedReward.stampsRequired} stamps</strong> will be deducted from customer balance upon confirmation.
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-4">
              <Button variant="outline" size="sm" onClick={() => setRedeemOpen(false)} disabled={redeeming}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRedeemSubmit}
                disabled={!selectedReward || redeeming}
                isLoading={redeeming}
                loadingText="Redeeming..."
              >
                Confirm Redemption
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
