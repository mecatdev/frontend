"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Video } from "lucide-react";
import type { Business } from "@/types/business";

const SKELETON_ROWS = 5;

export function BusinessTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Name</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead className="w-36" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="w-7 h-7 rounded-lg" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
            <TableCell />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BusinessRow({ business }: { business: Business }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <TableRow
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TableCell>
        <div className="w-7 h-7 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
          <Image
            src="/logo.svg"
            alt={`${business.name} logo`}
            width={28}
            height={28}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
      </TableCell>
      <TableCell className="font-medium text-foreground">{business.name}</TableCell>
      <TableCell>
        <Badge className="bg-primary/10 text-primary border-0 text-xs font-normal">
          {business.industry}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={10} />
          {business.location}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs font-normal">
          {business.stage}
        </Badge>
      </TableCell>
      <TableCell className="text-right w-36">
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => router.push(`/business/${business.slug}`)}>
                <Video size={11} />
                Go Interview
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </TableCell>
    </TableRow>
  );
}

type Props = {
  businesses: Business[];
};

export function BusinessTable({ businesses }: Props) {
  if (businesses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        No businesses match your search.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Name</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead className="w-36" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {businesses.map((b) => (
          <BusinessRow key={b.id} business={b} />
        ))}
      </TableBody>
    </Table>
  );
}
