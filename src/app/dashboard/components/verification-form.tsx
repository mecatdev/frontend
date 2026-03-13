"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  verifySchema,
  VerifyInput,
  businessAseanLocation,
  businessStages,
  knowledgeDocumentFilesSchema,
} from "@/lib/verify/schemas";
import { verifyBusiness, type BusinessVerificationStatus } from "@/api/v1/business/route";
import { uploadKnowledgeFile } from "@/api/v1/knowledge/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { TriangleAlert, Upload } from "lucide-react";

type VerificationFormProps = {
  status: BusinessVerificationStatus;
  businessId?: string;
  redirectPath?: string;
  onSuccess?: () => void | Promise<void>;
};

export function VerificationForm({ status, businessId, redirectPath = "/dashboard", onSuccess }: VerificationFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const form = useForm<VerifyInput>({
    resolver: zodResolver(verifySchema),
    mode: "onChange",
  });

  const onSubmit = async (data: VerifyInput) => {
    setLoading(true);
    setError(null);
    try {
      if (documentFiles.length > 0) {
        if (!businessId) {
          throw new Error("Document upload requires a business id");
        }

        const token = await getToken();
        for (const file of documentFiles) {
          await uploadKnowledgeFile(businessId, file, file.name, token);
        }
      }

      await verifyBusiness(data, businessId);
      await onSuccess?.();
      window.location.assign(redirectPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentsChange = (files: FileList | null) => {
    const nextFiles = files ? Array.from(files) : [];
    const parsed = knowledgeDocumentFilesSchema.safeParse(nextFiles);

    if (!parsed.success) {
      setDocumentFiles([]);
      setError(parsed.error.issues[0]?.message ?? "Invalid document upload");
      return;
    }

    setError(null);
    setDocumentFiles(parsed.data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-1">
          <Image src="/logo.svg" alt="" width={50} height={50} className="mb-6" />
          <h1 className="text-2xl font-bold">Verify your business</h1>
          <p className="text-muted-foreground text-sm">
            Complete verification so your business can appear on the marketplace.
          </p>
        </div>

        {status === "REJECTED" && (
          <Card className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-none">
            Your previous submission did not pass verification. Update the details below and submit again.
          </Card>
        )}

        <div className="space-y-4">
          <div>
            <Input
              label="You're the owner? State your name please"
              placeholder="e.g. John Doe"
              className="h-14 text-base rounded-xl"
              {...form.register("ownerName")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.ownerName?.message}</p>
          </div>
          <div>
            <Textarea
              label="Tell us your founder background"
              placeholder="e.g. 6 years in FMCG distribution, ex-operations manager, built 2 local outlets"
              className="rounded-xl resize-none"
              rows={3}
              {...form.register("founderExperience")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.founderExperience?.message}</p>
          </div>
          <div>
            <Textarea
              label="Describe your team structure"
              placeholder="e.g. 5 people: founder, sales lead, operations, product, finance"
              className="rounded-xl resize-none"
              rows={3}
              {...form.register("teamSnapshot")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.teamSnapshot?.message}</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Business Location</label>
            <Select
              onValueChange={(val) =>
                form.setValue("businessLocation", val as VerifyInput["businessLocation"], { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-14 rounded-xl">
                <SelectValue placeholder="Business location" />
              </SelectTrigger>
              <SelectContent>
                {businessAseanLocation.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.businessLocation?.message}</p>
          </div>
          <div>
            <Input
              label="Have a tagline? Share it with us it will help us understand your business better"
              placeholder="State your business tagline"
              className="h-14 text-base rounded-xl"
              {...form.register("tagline")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.tagline?.message}</p>
          </div>
          <div>
            <Textarea
              label="Describe your business in a few words"
              placeholder="e.g. We are a startup that provides a platform for businesses to manage X"
              className="rounded-xl resize-none"
              rows={3}
              {...form.register("businessDescription")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.businessDescription?.message}</p>
          </div>
          <div>
            <Textarea
              label="How do you make money?"
              placeholder="e.g. We sell X to Y"
              className="rounded-xl resize-none"
              rows={3}
              {...form.register("businessModel")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.businessModel?.message}</p>
          </div>
          <div>
            <Textarea
              label="How ready is your operating structure?"
              placeholder="Share your customer validation, channel plan, operations, compliance, and next 90-day execution plan"
              className="rounded-xl resize-none"
              rows={4}
              {...form.register("readinessPlan")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.readinessPlan?.message}</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Where are your business currently at?</label>
            <Select
              onValueChange={(val) =>
                form.setValue("stage", val as VerifyInput["stage"], { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-14 rounded-xl">
                <SelectValue placeholder="Business stage" />
              </SelectTrigger>
              <SelectContent>
                {businessStages.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.stage?.message}</p>
          </div>
          <div>
            <Input
              label="How much are you looking for? (in dollars)"
              placeholder="e.g. $100,000"
              className="h-14 text-base rounded-xl"
              {...form.register("fundingAsk", { valueAsNumber: true })}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.fundingAsk?.message}</p>
          </div>
          <div>
            <Input
              label="Have a website? Share it with us"
              placeholder="e.g. https://example.com"
              className="h-14 text-base rounded-xl"
              {...form.register("websiteUrl")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.websiteUrl?.message}</p>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">Upload supporting documents</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl px-6 py-8 text-center transition hover:border-primary/40">
              <Input
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                multiple
                onChange={(event) => handleDocumentsChange(event.target.files)}
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-4 h-auto"/>
                <span className="text-sm font-medium">
                  Click to upload documents
                </span>
                <span className="text-xs text-muted-foreground">
                  PDF or TXT • Maximum 5 files
                </span>
              </label>
            </div>
            {documentFiles.length > 0 && (
              <div className="space-y-2">
                {documentFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDocumentFiles((prev) => prev.filter((_, index) => index !== i))
                      }
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Optional. Uploaded documents are used by the AI verification system to
              analyze your business credibility.
            </p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-between items-center pt-2">
          <Button
            variant="ghost"
            className="text-muted-foreground text-sm"
            onClick={() => router.push("/dashboard")}
          >
            Skip for now
          </Button>
          <Button className="py-5 px-20" disabled={loading} onClick={form.handleSubmit(onSubmit)}>
            {loading ? "Submitting..." : "Verify"}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 pt-6">
          <TriangleAlert className="w-3 text-muted-foreground shrink-0 opacity-50" />
          <p className="text-xs text-muted-foreground opacity-50 text-center">
            Skipping means your business won&apos;t be listed on the marketplace until verified.
          </p>
        </div>
      </div>
    </div>
  );
}
