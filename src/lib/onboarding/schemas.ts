import { z } from "zod";

export const businessSectors = 
[
    "F&B",
    "Retail",
    "Technology and Research",
    "Health and Wellness",
    "Education",
    "Creative and Design",
    "Manufacturing",
    "Agriculture",
    "Other",
] as const;

export const businessSizes = [
  "micro",
  "small",
  "medium",
] as const;

export const yearsActive = [
  "<1",
  "1-3",
  "3-5",
  "5+",
] as const;

export const monthlyRevenue = [
  "<1000",
  "1000-5000",
  "5000-10000",
  "10000+",
] as const;

export const mainGoals = [
  "funding",
  "business_deals",
  "finding_partners",
] as const;

export type bsector = typeof businessSectors[number];
export type bsize = typeof businessSizes[number];
export type years = typeof yearsActive[number];
export type revenue = typeof monthlyRevenue[number];
export type goal = typeof mainGoals[number];

export const onboardingSchema = z.object({
  businessName:   z.string().min(3, "Business name must be at least 3 characters").max(100),
  businessSector: z.enum(businessSectors, { message: "Please select a valid business sector" }),
  businessSize:   z.enum(businessSizes,   { message: "Please select a valid business size" }),
  yearsActive:    z.enum(yearsActive,     { message: "Please select a valid range" }),
  monthlyRevenue: z.enum(monthlyRevenue,  { message: "Please select a valid monthly revenue range" }),
  mainGoal:       z.enum(mainGoals,       { message: "Please select a valid main goal" }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
