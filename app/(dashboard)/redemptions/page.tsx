"use client";

import React, { useEffect, useState } from "react";
import { getRedemptions } from "@/lib/api/redemptions";
import { RewardRedemption } from "@/lib/api/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Receipt, CheckCircle2, Award } from "lucide-react";

export default function RedemptionsPage() {
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getRedemptions();
    if (res.error || !res.data) {
      setError(res.error || "Failed to retrieve redemptions log");
    } else {
      setRedemptions(res.data.redemptions || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reward Redemptions Log" description="Track completed customer reward redemptions" />
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
        title="Redemptions Log"
        description="Audit completed customer reward redemptions and generated codes"
      />

      {redemptions.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8 text-slate-400" />}
          title="No reward redemptions yet"
          description="When customers redeem rewards using their accumulated stamps, completed redemption codes will appear here."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Reward Redeemed</th>
                <th className="px-5 py-3.5">Stamps Used</th>
                <th className="px-5 py-3.5">Redemption Code</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {redemptions.map((red) => {
                const code = `CODE-${red.id.slice(-6).toUpperCase()}`;
                return (
                  <tr key={red.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{red.customer?.name || red.customer?.phone || "Customer"}</div>
                      <div className="text-xs text-slate-400 font-mono">{red.customer?.phone}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">{red.reward?.name || "Reward"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#65a30d] bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200">
                        <Award className="w-3.5 h-3.5" /> {red.stampsUsed} Stamps
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 w-fit">
                      {code}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3" /> {red.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-slate-500 font-mono">
                      {new Date(red.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
