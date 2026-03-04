import { z } from "zod";

const businessSectors = 
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
  "product_operational",
] as const;

export type bsector = typeof businessSectors[number];
export type bsize = typeof businessSizes[number];
export type years = typeof yearsActive[number];
export type revenue = typeof monthlyRevenue[number];
export type goal = typeof mainGoals[number];

export const businessNameSchema = z.string().min(3, "Business name must be at least 3 characters").max(100);

export const businessSectorSchema = z.enum(businessSectors, "Please select a valid business sector");

export const businessSizeSchema = z.enum(businessSizes, "Please select a valid business size")

export const yearsActiveSchema = z.enum(yearsActive, "Please select a valid range for years active")

export const monthlyRevenueSchema = z.enum(monthlyRevenue, "Please select a valid monthly revenue range");

export const mainGoalSchema = z.enum(mainGoals, "Please select a valid main goal");


export const onboardingSchema = z.object({
  businessName: businessNameSchema,
  businessSector: businessSectorSchema,
  businessSize: businessSizeSchema,
  yearsActive: yearsActiveSchema,
  monthlyRevenue: monthlyRevenueSchema,
  mainGoal: mainGoalSchema,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;