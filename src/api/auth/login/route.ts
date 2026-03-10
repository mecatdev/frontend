import { apiFetch } from "@/lib/api";

export type UserRole = "INVESTOR" | "FOUNDER";

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  hasBusiness: boolean;
  business: {
    id: string;
    slug: string;
    verificationStatus: string;
  } | null;
}

export async function syncAfterLogin(): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/me");
}
