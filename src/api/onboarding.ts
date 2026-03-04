import { apiFetch } from "@/lib/api";
import type { OnboardingInput } from "@/lib/onboarding/schemas";

export interface OnboardingResponse {
  businessId: string;
  slug: string;
  userId: string;
}

/**
 * POST /api/onboarding
 * Submit initial business onboarding form.
 * Creates business with isPublished: false.
 * After this, user is redirected to /dashboard for verification.
 */
export async function submitOnboarding(data: OnboardingInput): Promise<OnboardingResponse> {
  const result = await apiFetch<OnboardingResponse>("/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });
  // Store userId so subsequent requests can send x-user-id header
  if (typeof window !== "undefined" && result.userId) {
    localStorage.setItem("mecat_user_id", result.userId);
  }
  return result;
}
