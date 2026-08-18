"use client";

import React, { useEffect, useState } from "react";
import { getRewards, createReward, updateReward } from "@/lib/api/rewards";
import { LoyaltyReward } from "@/lib/api/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { Gift, Plus, Power, CheckCircle2 } from "lucide-react";

export default function RewardsPage() {
  const { showSuccess, showError } = useToast();

  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stampsRequired, setStampsRequired] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getRewards();
    if (res.error || !res.data) {
      setError(res.error || "Failed to load rewards");
    } else {
      setRewards(res.data.rewards || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !stampsRequired || Number(stampsRequired) <= 0) return;

    setSubmitting(true);
    const res = await createReward({
      name: name.trim(),
      description: description.trim() || undefined,
      stampsRequired: Number(stampsRequired),
    });

    if (res.error || !res.data) {
      showError("Failed to create reward", res.error);
    } else {
      showSuccess("Reward created successfully!");
      setModalOpen(false);
      setName("");
      setDescription("");
      setStampsRequired("10");
      loadData();
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (reward: LoyaltyReward) => {
    const newStatus = reward.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setTogglingId(reward.id);

    const res = await updateReward(reward.id, { status: newStatus });

    if (res.error) {
      showError("Failed to update status", res.error);
    } else {
      showSuccess(`Reward marked as ${newStatus}`);
      setRewards((prev) =>
        prev.map((r) => (r.id === reward.id ? { ...r, status: newStatus } : r))
      );
    }
    setTogglingId(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rewards" description="Manage claimable customer rewards" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rewards Catalog"
        description="Create and manage rewards customers unlock with stamps"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Reward
          </Button>
        }
      />

      {rewards.length === 0 ? (
        <EmptyState
          icon={<Gift className="w-8 h-8 text-slate-400" />}
          title="No rewards created yet"
          description="Create a reward such as 'Free Coffee' or '$10 Discount' that customers earn when filling their stamp card."
          actionText="Add Reward"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const isActive = reward.status === "ACTIVE";
            return (
              <Card key={reward.id} className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{reward.name}</h3>
                    <Badge variant={isActive ? "success" : "neutral"} size="sm">
                      {isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  {reward.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{reward.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Required
                    </span>
                    <span className="text-sm font-mono font-black text-slate-900">
                      {reward.stampsRequired} Stamps
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(reward)}
                    isLoading={togglingId === reward.id}
                    icon={<Power className="w-3.5 h-3.5" />}
                  >
                    {isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Reward Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Reward"
        description="Define a new reward customers can redeem using their earned stamps."
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input
            label="Reward Name"
            required
            placeholder="e.g. Free Artisanal Coffee"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Applicable for any medium espresso drink"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Stamps Required"
            type="number"
            min="1"
            required
            placeholder="10"
            value={stampsRequired}
            onChange={(e) => setStampsRequired(e.target.value)}
            helperText="Number of stamps deducted from customer balance upon redemption."
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
              Create Reward
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
