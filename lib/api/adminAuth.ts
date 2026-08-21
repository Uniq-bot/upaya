import { apiFetch } from "./client";
import { UserSession } from "./types";

export async function getAdminMe() {
  return apiFetch<UserSession>("/api/admin/auth/me");
}
