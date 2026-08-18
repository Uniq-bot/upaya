import { apiFetch } from "./client";
import { LoyaltyProgram } from "./types";

export async function getProgram() {
  return apiFetch<{ program: LoyaltyProgram | null }>("/api/business/program");
}

export async function createProgram(name: string, stampsRequired: number) {
  return apiFetch<{ message: string; program: LoyaltyProgram }>(
    "/api/business/program",
    {
      method: "POST",
      body: JSON.stringify({ name, stampsRequired }),
    }
  );
}

export async function updateProgram(payload: { name?: string; stampsRequired?: number }) {
  return apiFetch<{ message: string; program: LoyaltyProgram }>(
    "/api/business/program",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}
