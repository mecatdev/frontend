"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import type { Business } from "@/types/business";

type Props = {
  business: Business;
};

export function BusinessCard({ business }: Props) {
  const router = useRouter();
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      className="w-full h-full"
    >
      <Card className="select-none w-full h-full overflow-hidden flex flex-col rounded-3xl shadow-xl relative bg-card">
        {/* padded + rounded image */}
        <div className="flex-1 min-h-0 p-3 pb-2">
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-muted">
            <Image
              src={business.ownerPhotoUrl}
              alt={business.ownerName}
              fill
              className="object-cover will-change-transform"
              draggable={false}
              unoptimized
            />
          </div>
        </div>

        {/* base info bar */}
        <div className="px-5 pb-5 pt-2 shrink-0 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted border border-border overflow-hidden shadow-sm shrink-0">
              <Image
                src={business.logoUrl}
                alt={`${business.name} logo`}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold leading-tight truncate">
                {business.name}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {business.ownerName}
              </p>
            </div>

            <Badge variant="secondary" className="shrink-0 text-xs">
              {business.stage}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-0 text-xs">
              {business.industry}
            </Badge>

            {business.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={10} />
                {business.location}
              </span>
            )}
          </div>
        </div>

        {/* hover overlay */}
        <motion.div
          className="absolute inset-0 bg-card rounded-3xl flex flex-col p-6 overflow-hidden will-change-transform"
          variants={{
            rest: { y: "100%" },
            hover: { y: 0 },
          }}
          transition={{
            duration: 0.28,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-muted border border-border overflow-hidden shadow-md shrink-0">
              <Image
                src={business.logoUrl}
                alt={`${business.name} logo`}
                width={56}
                height={56}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-tight">
                {business.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {business.ownerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-5">
            <Badge variant="secondary" className="text-xs">
              {business.stage}
            </Badge>

            <Badge className="bg-primary/10 text-primary border-0 text-xs">
              {business.industry}
            </Badge>

            {business.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={10} />
                {business.location}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed flex-1 overflow-y-auto">
            {business.description}
          </p>

          <Button className="w-full mt-6" size="lg" onClick={() => router.push(`/business/${business.slug}`)}>
            Go Interview
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
}