"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ArrowLeft, Video, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { BusinessDetail } from "@/types/business";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function BusinessDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch<BusinessDetail>(`/businesses/${encodeURIComponent(slug)}`)
      .then(setBusiness)
      .catch(() => setError(true));
  }, [slug]);

  if (error) notFound();

  if (!business) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const avatarUrl = business.owner.avatarUrl || "/logo.svg";

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative w-1/2 shrink-0">
        <Image
          src={avatarUrl}
          alt={business.owner.name}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-6 left-6 w-16 h-16 rounded-2xl bg-background border border-border overflow-hidden shadow-xl">
          {business.logoUrl ? (
            <Image
              src={business.logoUrl}
              alt={`${business.name} logo`}
              width={64}
              height={64}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
              {business.name.charAt(0)}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push(`/home`)}
          className="absolute top-6 left-6 flex items-center gap-2 text-white text-sm font-medium bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto px-12 py-12 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {business.stage && (
                <Badge variant="secondary" className="text-xs">
                  {business.stage}
                </Badge>
              )}
              {business.industry && (
                <Badge className="bg-primary/10 text-primary border-0 text-xs">
                  {business.industry}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {business.name}
            </h1>
            <p className="text-base text-muted-foreground">
              Founded by {business.owner.name}
            </p>
          </div>

          <hr className="border-border" />

          {business.description && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                About
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {business.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {business.industry && (
              <DetailItem label="Industry" value={business.industry} />
            )}
            {business.stage && (
              <DetailItem label="Stage" value={business.stage} />
            )}
            <DetailItem label="Founder" value={business.owner.name} />
            {business.fundingAsk && (
              <DetailItem
                label="Funding Ask"
                value={`${business.fundingCurrency ?? "IDR"} ${Number(business.fundingAsk).toLocaleString()}`}
              />
            )}
          </div>
        </div>

        <div className="shrink-0 px-12 py-8 border-t border-border">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={async () => {
              apiFetch(`/businesses/${business.id}/interview-started`, {
                method: "POST",
              }).catch(() => {});
              router.push(`/business/${slug}/avatar`);
            }}
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
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
