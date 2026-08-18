import { apiFetch } from "./client";
import { StaffMember, UserRole } from "./types";

export async function getStaffMembers() {
  return apiFetch<StaffMember[]>("/api/business/staffs");
}

export async function createStaffMember(payload: {
  staffEmail: string;
  staffFirstName?: string;
  staffLastName?: string;
  password: string;
  role: UserRole;
}) {
  return apiFetch<StaffMember>("/api/business/staffs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
