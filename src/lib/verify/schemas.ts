import { z } from "zod";

export const businessAseanLocation = [
  "INDONESIA",
  "MALAYSIA",
  "SINGAPORE",
  "THAILAND",
  "PHILIPPINES",
  "VIETNAM",
  "BRUNEI",
  "CAMBODIA",
  "LAOS",
  "MYANMAR",
] as const;

const imgTypes = ["image/jpeg", "image/png", "image/gif"] as const;

export const verifySchema = z.object({
    ownerName: z.string(),
    businessLocation: z.enum(businessAseanLocation, "Please select a valid country"),
    businessDescription: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
    businessModel: z.string().min(3, "Business model must be at least 3 characters").max(1000, "Business model must be less than 1000 characters"),
    additionalDocuments: z.array(z.string()).max(5, "You can upload up to 5 documents maximum"),
}).strict();

const maxsize = 2 * 1024 * 1024;

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