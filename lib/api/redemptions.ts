import { apiFetch } from "./client";
import { RewardRedemption, Customer } from "./types";

export async function getRedemptions() {
  return apiFetch<{ redemptions: RewardRedemption[] }>("/api/business/redemptions");
}

export async function redeemReward(customerId: string, rewardId: string) {
  return apiFetch<{
    message: string;
    redemption: RewardRedemption;
    customer: Customer;
  }>(`/api/business/rewards/${customerId}`, {
    method: "POST",
    body: JSON.stringify({ rewardId }),
  });
}
