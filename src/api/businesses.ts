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

/** Read userId from localStorage (temporary until auth is implemented) */
function userIdHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const id = localStorage.getItem("mecat_user_id");
  return id ? { "x-user-id": id } : {};
}

/**
 * GET /api/businesses/me
 * Get current owner's business (verificationStatus, isPublished, etc.)
 */
export async function getMyBusiness(): Promise<MyBusiness> {
  return apiFetch<MyBusiness>("/businesses/me", {
    headers: userIdHeader(),
  });
}

/**
 * POST /api/businesses/verify
 * Submit verification form. Sets verificationStatus → PENDING.
 * Business stays isPublished: false until admin approves.
 */
export async function verifyBusiness(data: VerifyInput): Promise<VerifyBusinessResponse> {
  return apiFetch<VerifyBusinessResponse>("/businesses/verify", {
    method: "POST",
    headers: userIdHeader(),
    body: JSON.stringify(data),
  });
}

/**
 * GET /api/businesses/:idOrSlug
 * Public business detail.
 */
export async function getBusiness(idOrSlug: string): Promise<MyBusiness> {
  return apiFetch<MyBusiness>(`/businesses/${idOrSlug}`);
}