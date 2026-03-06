"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { use } from "react";
import { ArrowLeft, MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBusinessBySlug } from "@/app/home/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function BusinessDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const business = getBusinessBySlug(slug);

  if (!business) notFound();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* left — photo panel */}
      <div className="relative w-1/2 shrink-0">
        <Image
          src={business.ownerPhotoUrl}
          alt={business.ownerName}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        {/* gradient for logo legibility */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

        {/* logo overlay */}
        <div className="absolute bottom-6 left-6 w-16 h-16 rounded-2xl bg-background border border-border overflow-hidden shadow-xl">
          <Image
            src={business.logoUrl}
            alt={`${business.name} logo`}
            width={64}
            height={64}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>

        {/* back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 flex items-center gap-2 text-white text-sm font-medium bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      {/* right — detail panel */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-12 py-12 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{business.stage}</Badge>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">{business.industry}</Badge>
              {business.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={10} />
                  {business.location}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{business.name}</h1>
            <p className="text-base text-muted-foreground">Founded by {business.ownerName}</p>
          </div>

          <hr className="border-border" />

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">About</h2>
            <p className="text-base text-muted-foreground leading-relaxed">{business.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <DetailItem label="Industry" value={business.industry} />
            <DetailItem label="Stage" value={business.stage} />
            <DetailItem label="Location" value={business.location} />
            <DetailItem label="Founder" value={business.ownerName} />
          </div>
        </div>

        {/* pinned footer */}
        <div className="shrink-0 px-12 py-8 border-t border-border bg-background">
          <Button size="lg" className="w-full gap-2">
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
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
