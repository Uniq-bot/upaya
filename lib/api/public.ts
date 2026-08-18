import { apiFetch } from "./client";
import { LoyaltyReward, Customer } from "./types";

export interface PublicBusinessInfo {
  business: {
    id: string;
    name: string;
    slug: string;
  };
  program: {
    id: string;
    name: string;
    stampsRequired: number;
  };
  rewards: LoyaltyReward[];
}

export async function getPublicBusinessRewards(slug: string) {
  return apiFetch<PublicBusinessInfo>(`/api/customer/rewards?slug=${encodeURIComponent(slug)}`);
}

export async function getPublicBusinessBySlug(slug: string) {
  return apiFetch<{
    business: {
      id: string;
      name: string;
      slug: string;
      program?: { id: string; name: string; stampsRequired: number } | null;
    };
  }>(`/api/business/join/${encodeURIComponent(slug)}`);
}

export async function checkOrRegisterCustomer(slug: string, phone: string) {
  return apiFetch<{
    message: string;
    customer?: Customer;
    business?: { id: string; name: string };
    program?: { id: string; name: string };
  }>("/api/customer", {
    method: "POST",
    body: JSON.stringify({ slug, phone }),
  });
}
