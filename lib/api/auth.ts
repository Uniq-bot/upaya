import { apiFetch } from "./client";
import { UserSession } from "./types";

export async function loginBusiness(email: string, password: string) {
  return apiFetch<{ message: string; user: UserSession["user"]; business: UserSession["business"] }>(
    "/api/business/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function logoutBusiness() {
  return apiFetch<{ message: string }>("/api/business/auth/logout", {
    method: "POST",
  });
}

export async function getBusinessMe() {
  return apiFetch<UserSession>("/api/business/me");
}
