import { apiFetch } from "@/lib/api";
import type { VerifyInput } from "@/lib/verify/schemas";

export type BusinessVerificationStatus = "DRAFT" | "PENDING" | "VERIFIED" | "REJECTED";

export interface MyBusiness {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logoUrl: string | null;
  industry: string | null;
  stage: string | null;
  fundingAsk: number | null;
  fundingCurrency: string | null;
  isPublished: boolean;
  verificationStatus: BusinessVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyBusinessResponse {
  id: string;
  verificationStatus: BusinessVerificationStatus;
}

export async function getMyBusiness(): Promise<MyBusiness> {
  return apiFetch<MyBusiness>("/businesses/me");
}

export async function verifyBusiness(data: VerifyInput): Promise<VerifyBusinessResponse> {
  return apiFetch<VerifyBusinessResponse>("/businesses/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBusiness(idOrSlug: string): Promise<MyBusiness> {
  return apiFetch<MyBusiness>(`/businesses/${idOrSlug}`);
}