import { z } from "zod";

export const businessAseanLocation = [
  "Indonesia",
  "Malaysia",
  "Singapore",
  "Thailand",
  "Philippines",
  "Vietnam",
  "Brunei",
  "Cambodia",
  "Laos",
  "Myanmar",
] as const;

export const businessStages = ["IDEA", "PRE_SEED", "SEED", "SERIES_A"] as const;
export type BusinessStage = (typeof businessStages)[number];

const imgTypes = ["image/jpeg", "image/png", "image/gif"] as const;
const knowledgeDocumentMimeTypes = ["application/pdf", "text/plain"] as const;
const knowledgeDocumentExtensions = [".pdf", ".txt"] as const;

export const verifySchema = z.object({
  ownerName: z.string().min(1, "Please tell us your name"),
  founderExperience: z
    .string()
    .min(10, "Founder background must be at least 10 characters")
    .max(1000, "Founder background must be less than 1000 characters"),
  teamSnapshot: z
    .string()
    .min(10, "Team snapshot must be at least 10 characters")
    .max(1000, "Team snapshot must be less than 1000 characters"),
  businessLocation: z.enum(businessAseanLocation, { 
    message: "Please select a valid country" 
  }),
  businessDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  businessModel: z
    .string()
    .min(3, "Business model must be at least 3 characters")
    .max(1000, "Business model must be less than 1000 characters"),
  readinessPlan: z
    .string()
    .min(10, "Readiness plan must be at least 10 characters")
    .max(1200, "Readiness plan must be less than 1200 characters"),
  tagline: z.string().max(160, "Tagline must be less than 160 characters").optional(),
  stage: z.enum(businessStages).optional(),
  fundingAsk: z
    .number({ error: "Funding ask must be a number" })
    .positive("Funding ask must be a positive number")
    .optional(),
  websiteUrl: z
    .string()
    .url("Must be a valid URL (e.g. https://example.com)")
    .optional()
    .or(z.literal("")),
  additionalDocuments: z.array(z.string()).max(5, "You can upload up to 5 documents maximum").optional(),
}).strict();

const maxsize = 2 * 1024 * 1024;
const maxKnowledgeDocumentSize = 10 * 1024 * 1024;

export const knowledgeDocumentFileSchema = z
  .instanceof(File, { message: "Document file is required" })
  .refine((file) => file.size <= maxKnowledgeDocumentSize, {
    message: "Document must be less than 10MB",
  })
  .refine((file) => {
    const normalizedName = file.name.toLowerCase();
    return knowledgeDocumentExtensions.some((extension) => normalizedName.endsWith(extension));
  }, {
    message: "Only PDF and TXT files are allowed",
  })
  .refine((file) => {
    if (!file.type) return true;
    return knowledgeDocumentMimeTypes.includes(file.type as (typeof knowledgeDocumentMimeTypes)[number]);
  }, {
    message: "Only PDF and TXT files are allowed",
  });

export const knowledgeDocumentFilesSchema = z.array(knowledgeDocumentFileSchema)
  .max(5, "You can upload up to 5 documents maximum");

export const logoImageSchema = z.object({
  image: z
    .instanceof(File, { message: "Logo image is required" })
    .refine((file) => file.size <= maxsize, {
      message: "Image must be less than 2MB",
    })
    .refine((file) => imgTypes.includes(file.type as any), {
      message: "Only JPEG, PNG, and GIF images are allowed",
    }),
}).strict();

export type VerifyInput = z.infer<typeof verifySchema>;
export type LogoImageInput = z.infer<typeof logoImageSchema>;