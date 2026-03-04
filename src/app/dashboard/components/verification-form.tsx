"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema, VerifyInput, businessAseanLocation } from "@/lib/verify/schemas";
import { verifyBusiness, type BusinessVerificationStatus } from "@/api/businesses";
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

const statusBadge: Partial<Record<BusinessVerificationStatus, { label: string; color: string }>> = {
  PENDING:  { label: "Under review",              color: "text-yellow-600 bg-yellow-50" },
  REJECTED: { label: "Rejected — please resubmit", color: "text-red-600 bg-red-50"     },
};

export function VerificationForm({ status }: { status: BusinessVerificationStatus }) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
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
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Verification submitted!</h2>
          <p className="text-muted-foreground">
            Your business will be reviewed and listed on the marketplace once verified.
          </p>
          <Button onClick={() => router.push("/dashboard/home")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const badge = statusBadge[status];

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
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
              placeholder="Owner full name"
              className="h-14 text-base rounded-xl"
              {...form.register("ownerName")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.ownerName?.message}</p>
          </div>

          <div>
            <Select
              onValueChange={(val) =>
                form.setValue("businessLocation", val as VerifyInput["businessLocation"], { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-14 rounded-xl">
                <SelectValue placeholder="Business Location" />
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
            <Textarea
              placeholder="Business description (min. 10 characters)"
              className="rounded-xl resize-none"
              rows={3}
              {...form.register("businessDescription")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.businessDescription?.message}</p>
          </div>

          <div>
            <Textarea
              placeholder="Business model (how do you make money?)"
              className="rounded-xl resize-none"
              rows={3}
              {...form.register("businessModel")}
            />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.businessModel?.message}</p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-between items-center pt-2">
          <Button
            variant="ghost"
            className="text-muted-foreground text-sm"
            onClick={() => router.push("/dashboard/home")}
          >
            Skip for now
          </Button>
          <Button className="py-5 px-20" disabled={loading} onClick={form.handleSubmit(onSubmit)}>
            {loading ? "Submitting..." : "Verify"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Skipping means your business won&apos;t be listed on the marketplace until verified.
        </p>
      </div>
    </div>
  );
}
