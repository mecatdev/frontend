"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema, VerifyInput, businessAseanLocation, businessStages } from "@/lib/verify/schemas";
import { verifyBusiness, type BusinessVerificationStatus } from "@/api/v1/business/route";
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
import Image from "next/image";
import { TriangleAlert } from "lucide-react";

const statusBadge: Partial<Record<BusinessVerificationStatus, { label: string; color: string }>> = {
  PENDING:  { label: "Under review",              color: "text-yellow-600 bg-yellow-50" },
  REJECTED: { label: "Rejected — please resubmit", color: "text-red-600 bg-red-50"     },
};

export function VerificationForm({ status }: { status: BusinessVerificationStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VerifyInput>({
    resolver: zodResolver(verifySchema),
    mode: "onChange",
  });

  const onSubmit = async (data: VerifyInput) => {
    setLoading(true);
    setError(null);
    try {
      await verifyBusiness(data);
      router.refresh();
      router.push("/dashboard");
      return;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const badge = statusBadge[status];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-1">
          <Image src="/logo.svg" alt="" width={50} height={50} className="mb-6" />
          <h1 className="text-2xl font-bold">Verify your business</h1>
          <p className="text-muted-foreground text-sm">
            Complete verification so your business can appear on the marketplace.
          </p>
          {badge && (
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </div>

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
