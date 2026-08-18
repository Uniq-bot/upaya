import { apiFetch } from "./client";
import { Customer, StampLedger, RewardRedemption, LoyaltyReward } from "./types";

export async function getCustomers() {
  return apiFetch<{ customers: Customer[] }>("/api/business/customers");
}

export async function getCustomer(customerId: string) {
  return apiFetch<{
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
  }>(`/api/business/customers/${customerId}`);
}

export async function createCustomer(payload: {
  phone: string;
  name?: string;
  email?: string;
}) {
  return apiFetch<{ message: string; customer: Customer }>(
    "/api/business/customers",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function addStamp(
  customerId: string,
  amount: number,
  description?: string
) {
  return apiFetch<{ message: string; stamp: StampLedger; customer: Customer }>(
    `/api/business/customers/${customerId}/stamps`,
    {
      method: "PATCH",
      body: JSON.stringify({ amount, description }),
    }
  );
}
