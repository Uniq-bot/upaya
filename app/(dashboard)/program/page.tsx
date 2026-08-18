"use client";

import React, { useEffect, useState } from "react";
import { getProgram, createProgram, updateProgram } from "@/lib/api/program";
import { LoyaltyProgram } from "@/lib/api/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { Award, Plus, Edit2, CheckCircle2 } from "lucide-react";

export default function ProgramPage() {
  const { showSuccess, showError } = useToast();

  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/Edit form states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [stampsRequired, setStampsRequired] = useState("10");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getProgram();
    if (res.error) {
      setError(res.error);
    } else {
      setProgram(res.data?.program || null);
      if (res.data?.program) {
        setName(res.data.program.name);
        setStampsRequired(String(res.data.program.stampsRequired));
      }
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
    const res = await createProgram(name.trim(), Number(stampsRequired));

    if (res.error || !res.data) {
      showError("Failed to create program", res.error);
    } else {
      setProgram(res.data.program);
      showSuccess("Loyalty program created successfully!");
    }
    setSubmitting(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !stampsRequired || Number(stampsRequired) <= 0) return;

    setSubmitting(true);
    const res = await updateProgram({
      name: name.trim(),
      stampsRequired: Number(stampsRequired),
    });

    if (res.error || !res.data) {
      showError("Failed to update program", res.error);
    } else {
      setProgram(res.data.program);
      setIsEditing(false);
      showSuccess("Loyalty program updated successfully!");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loyalty Program" description="Manage your business stamp card rules" />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loyalty Program"
        description="Configure customer stamp requirements and program settings"
      />

      {!program ? (
        /* Create Program Initial View */
        <Card className="max-w-xl">
          <CardHeader
            title="Create your loyalty program"
            subtitle="Set up your business stamp card so customers can earn rewards."
          />
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <Input
              label="Program Name"
              required
              placeholder="e.g. Himalayan Coffee Club"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Stamps Required per Reward"
              type="number"
              min="1"
              required
              placeholder="10"
              value={stampsRequired}
              onChange={(e) => setStampsRequired(e.target.value)}
              helperText="Number of stamps a customer must accumulate to complete one full card."
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              loadingText="Creating..."
              icon={<Plus className="w-4 h-4" />}
            >
              Create Program
            </Button>
          </form>
        </Card>
      ) : isEditing ? (
        /* Edit Program Form */
        <Card className="max-w-xl">
          <CardHeader title="Edit Loyalty Program" subtitle="Update program name or stamp requirements." />
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <Input
              label="Program Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Stamps Required per Reward"
              type="number"
              min="1"
              required
              value={stampsRequired}
              onChange={(e) => setStampsRequired(e.target.value)}
            />

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={submitting}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
              <Button variant="outline" size="md" onClick={() => setIsEditing(false)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* Program Overview Card */
        <Card className="max-w-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-lime-50 text-[#65a30d] rounded-2xl border border-lime-200">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{program.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Active Loyalty Stamp Card</p>
              </div>
            </div>

            <Badge variant="success" size="sm">
              <CheckCircle2 className="w-3 h-3" /> ACTIVE
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stamps Required</span>
              <span className="text-2xl font-black font-mono text-slate-900">{program.stampsRequired}</span>
              <span className="text-xs text-slate-500 block">per reward cycle</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Created</span>
              <span className="text-sm font-bold text-slate-800">
                {new Date(program.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            icon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Program Details
          </Button>
        </Card>
      )}
    </div>
  );
}
