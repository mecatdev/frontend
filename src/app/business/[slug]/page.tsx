"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchBusiness } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

interface BusinessDetail {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  stage: string | null;
  logoUrl: string | null;
  fundingAsk: number | string | null;
  fundingCurrency: string | null;
  owner: { id: string; name: string; avatarUrl: string | null };
}

function formatFunding(amount: number | string | null, currency: string | null) {
  if (!amount) return null;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
    notation: "compact",
  }).format(num);
}

export default function BusinessDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { getToken } = useAuth();

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    getToken()
      .then((token) => fetchBusiness(slug, token))
      .then((b) => setBusiness(b as unknown as BusinessDetail))
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [slug, getToken]);

  if (missing) notFound();

  if (loading || !business) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const ownerPhoto = business.owner.avatarUrl
    ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(business.owner.name)}&background=random&size=800`;
  const logoSrc = business.logoUrl ?? "/logo.svg";
  const funding = formatFunding(business.fundingAsk, business.fundingCurrency);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left — photo panel */}
      <div className="relative w-1/2 shrink-0">
        <Image
          src={ownerPhoto}
          alt={business.owner.name}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-6 left-6 w-16 h-16 rounded-2xl bg-background border border-border overflow-hidden shadow-xl">
          <Image
            src={logoSrc}
            alt={`${business.name} logo`}
            width={64}
            height={64}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>

        <button
          onClick={() => router.push("/home")}
          className="absolute top-6 left-6 flex items-center gap-2 text-white text-sm font-medium bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      {/* Right — detail panel */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto px-12 py-12 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {business.stage && (
                <Badge variant="secondary" className="text-xs">{business.stage}</Badge>
              )}
              {business.industry && (
                <Badge className="bg-primary/10 text-primary border-0 text-xs">{business.industry}</Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{business.name}</h1>
            <p className="text-base text-muted-foreground">Founded by {business.owner.name}</p>
            {business.tagline && (
              <p className="text-sm italic text-muted-foreground">&quot;{business.tagline}&quot;</p>
            )}
          </div>

          <hr className="border-border" />

          {business.description && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider">About</h2>
              <p className="text-base text-muted-foreground leading-relaxed">{business.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {business.industry && <DetailItem label="Industry" value={business.industry} />}
            {business.stage && <DetailItem label="Stage" value={business.stage} />}
            {funding && <DetailItem label="Funding Ask" value={funding} />}
            <DetailItem label="Founder" value={business.owner.name} />
          </div>
        </div>

        <div className="shrink-0 px-12 py-8 border-t border-border">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => router.push(`/business/${slug}/avatar`)}
          >
            <Video size={16} />
            Go Interview
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
