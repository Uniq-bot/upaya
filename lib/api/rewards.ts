import { apiFetch } from "./client";
import { LoyaltyReward } from "./types";

export async function getRewards() {
  return apiFetch<{ rewards: LoyaltyReward[] }>("/api/business/rewards");
}

export async function createReward(payload: {
  name: string;
  description?: string;
  stampsRequired: number;
}) {
  return apiFetch<{ message: string; reward: LoyaltyReward }>(
    "/api/business/rewards",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function updateReward(
  rewardId: string,
  payload: {
    name?: string;
    description?: string;
    stampsRequired?: number;
    status?: "ACTIVE" | "INACTIVE";
  }
) {
  return apiFetch<{ message: string; reward: LoyaltyReward }>(
    `/api/business/rewards/item/${rewardId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}
