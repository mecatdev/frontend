"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        businessName: "",
        industry: "",
        companySize: "",
        yearsActive: "",
        goal: "",
    });
}