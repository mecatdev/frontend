import { apiFetch } from "@/lib/api";
import type { VerifyInput } from "@/lib/verify/schemas";

export interface VerifyBusinessResponse {
  businessId: string;
  verificationStatus: "PENDING" | "VERIFIED";
}

/**
 * POST /api/businesses/verify
 * Submit business verification documents after onboarding.
 * Business will stay isPublished: false until verified.
 */
export async function verifyBusiness(data: VerifyInput): Promise<VerifyBusinessResponse> {
  return apiFetch<VerifyBusinessResponse>("/businesses/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * GET /api/businesses/:idOrSlug
 * Get business detail by id or slug.
 */
export async function getBusiness(idOrSlug: string) {
  return apiFetch<{ id: string; name: string; isPublished: boolean; verificationStatus?: string }>(
    `/businesses/${idOrSlug}`
  );
}
