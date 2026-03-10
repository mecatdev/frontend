import { apiFetch } from "@/lib/api";

export type UserRole = "INVESTOR" | "FOUNDER";

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function syncAfterRegister(
  role: UserRole,
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register-role", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}
