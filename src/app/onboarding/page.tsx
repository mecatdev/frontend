"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingInput, bsector, bsize, revenue, goal, years } from "@/lib/onboarding/schemas";
import { submitOnboarding } from "@/api/v1/voice/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const stepFields: Record<number, (keyof OnboardingInput)[]> = {
    1: ["businessName"],
    2: ["businessSector"],
    3: ["businessSize"],
    4: ["yearsActive"],
    5: ["monthlyRevenue"],
    6: ["mainGoal"],
  };

  const nextStep = async () => {
    const isValid = await form.trigger(stepFields[step]);
    if (!isValid) return;

    setStep((prev) => prev + 1);
  };

  const onSubmit = async (data: OnboardingInput) => {
    await submitOnboarding(data);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl space-y-8">
        <Progress value={progress} />

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              placeholder="Business Name"
              className="h-14 text-lg rounded-xl"
              {...form.register("businessName")}
            />
            <p className="text-red-500 text-sm">
              {form.formState.errors.businessName?.message}
            </p>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <Select
              onValueChange={(value) =>
                form.setValue("businessSector", value as bsector, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-14 rounded-xl">
                <SelectValue placeholder="Business Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F&B">Food & Beverage</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Technology and Research">Technology and Research</SelectItem>
                <SelectItem value="Health and Wellness">Health and Wellness</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Creative and Design">Creative and Design</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-red-500 text-sm">
              {form.formState.errors.businessSector?.message}
            </p>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <Select
              onValueChange={(value) =>
                form.setValue("businessSize", value as bsize, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-14 rounded-xl">
                <SelectValue placeholder="Business Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="micro">Micro</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-red-500 text-sm">
              {form.formState.errors.businessSize?.message}
            </p>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <Select
              onValueChange={(value) =>
                form.setValue("yearsActive", value as years, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-14 rounded-xl">
                <SelectValue placeholder="Years in Operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<1">Less than a year</SelectItem>
                <SelectItem value="1-3">1-3 Years</SelectItem>
                <SelectItem value="3-5">3-5 Years</SelectItem>
                <SelectItem value="5+">More than 5 Years</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-red-500 text-sm">
              {form.formState.errors.yearsActive?.message}
            </p>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="space-y-4">
            <Select
              onValueChange={(value) =>
                form.setValue("monthlyRevenue", value as revenue, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-14 rounded-xl">
                <SelectValue placeholder="Monthly Revenue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<1000">Less than 1000$</SelectItem>
                <SelectItem value="1000-5000">1k-5k$</SelectItem>
                <SelectItem value="5000-10000">5k-10k$</SelectItem>
                <SelectItem value="10000+">More than 10k$</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-red-500 text-sm">
              {form.formState.errors.monthlyRevenue?.message}
            </p>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div className="space-y-4">
            <Select
              onValueChange={(value) =>
                form.setValue("mainGoal", value as goal, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-14 rounded-xl">
                <SelectValue placeholder="Primary Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="funding">Funding</SelectItem>
                <SelectItem value="business_deals">Make a business deals</SelectItem>
                <SelectItem value="finding_partners">Finding a partner</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-red-500 text-sm">
              {form.formState.errors.mainGoal?.message}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-14">
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={() => setStep((prev) => prev - 1)}
              className="py-5 px-20"
            >
              Back
            </Button>
          )}

          <div className="ml-auto">
            {step < totalSteps ? (
              <Button onClick={nextStep} className="py-5 px-20">
                Next
              </Button>
            ) : (
              <Button
                onClick={form.handleSubmit(onSubmit)}
                className="py-5 px-20"
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}