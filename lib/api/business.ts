import { apiFetch } from "./client";
import { DashboardStats, ActivityItem, UserSession } from "./types";

export async function getDashboardData() {
  return apiFetch<{ stats: DashboardStats; activities: ActivityItem[] }>(
    "/api/business/dashboard"
  );
}

export async function getBusinessProfile() {
  return apiFetch<{ business: UserSession["business"] }>("/api/business/profile");
}

export async function updateBusinessProfile(payload: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  return apiFetch<{ message: string; business: UserSession["business"] }>(
    "/api/business/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}
