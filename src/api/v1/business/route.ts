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

export async function verifyBusiness(data: VerifyInput, businessId?: string): Promise<VerifyBusinessResponse> {
  return apiFetch<VerifyBusinessResponse>("/businesses/verify", {
    method: "POST",
    body: JSON.stringify({ ...data, businessId }),
  });
}

export async function getBusiness(idOrSlug: string): Promise<MyBusiness> {
  return apiFetch<MyBusiness>(`/businesses/${idOrSlug}`);
}

export async function getMyBusinesses(): Promise<MyBusiness[]> {
  try {
    const business = await getMyBusiness();
    return [business];
  } catch (e) {
    const status = (e as Error & { status?: number }).status;
    if (status === 404) {
      return [];
    }
    throw e;
  }
}