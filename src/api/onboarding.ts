import { apiFetch } from "@/lib/api";
import type { OnboardingInput } from "@/lib/onboarding/schemas";

export interface OnboardingResponse {
  businessId: string;
  slug: string;
}

/**
 * POST /api/onboarding
 * Creates a business for the authenticated FOUNDER.
 * After this, user is redirected to /dashboard for verification.
 */
export async function submitOnboarding(data: OnboardingInput): Promise<OnboardingResponse> {
  return apiFetch<OnboardingResponse>("/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
