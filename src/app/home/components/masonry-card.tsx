"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Video } from "lucide-react";
import type { Business } from "@/types/business";

const image_heights = [180, 220, 260, 300, 240, 200, 280];

function getImageHeight(id: string): number {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return image_heights[hash % image_heights.length];
}

type Props = {
  business: Business;
};

export function MasonryCard({ business }: Props) {
  const router = useRouter();
  const imageHeight = getImageHeight(business.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card
        className="group cursor-pointer overflow-hidden rounded-2xl transition-shadow shadow-lg"
        onClick={() => router.push(`/business/${business.slug}`)}
      >
        <div
          className="relative w-full overflow-hidden bg-muted"
          style={{ height: imageHeight }}
        >
          <Image
            src={business.ownerPhotoUrl}
            alt={business.ownerName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
              <Image
                src={business.logoUrl}
                alt={`${business.name} logo`}
                width={36}
                height={36}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold leading-tight truncate">
                {business.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {business.ownerName}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {business.description}
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-0 text-xs px-2.5 py-0.5">
              {business.industry}
            </Badge>
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
              {business.stage}
            </Badge>
            {business.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={10} />
                {business.location}
              </span>
            )}
          </div>

          <Button
            size="sm"
            className="w-full h-8 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/business/${business.slug}`);
            }}
          >
            <Video size={12} />
            Go Interview
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
