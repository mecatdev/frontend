import { apiFetch } from "@/lib/api";

export interface UserProfile {
  id: string;
  clerkId: string | null;
  email: string;
  name: string;
  role: "FOUNDER" | "INVESTOR";
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    ownedBusinesses: number;
    investorDeals: number;
  };
}

export async function getMyProfile(token?: string | null): Promise<UserProfile> {
  return apiFetch<UserProfile>("/auth/profile", {}, token);
}
