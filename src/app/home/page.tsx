"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { MasonryGrid } from "./components/masonry-grid";
import { businessSectors, type bsector } from "@/lib/onboarding/schemas";
import { cn } from "@/lib/utils";
import type { Business } from "@/types/business";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const PAGE_SIZE = 12;

interface ApiBusinessItem {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  industry: string | null;
  stage: string | null;
  logoUrl: string | null;
  owner: { id: string; name: string; avatarUrl: string | null };
}

function toBusinessCard(b: ApiBusinessItem): Business {
  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    industry: b.industry ?? "Other",
    description: b.tagline ?? "",
    logoUrl: b.logoUrl ?? "/logo.svg",
    ownerPhotoUrl: b.owner.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(b.owner.name)}&background=random`,
    ownerName: b.owner.name,
    location: "",
    stage: b.stage ?? "—",
  };
}

export default function HomePage() {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sector, setSector] = useState<bsector | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  async function fetchPage(pageNum: number, reset: boolean) {
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });
      if (sector) params.set("industry", sector);
      if (debouncedQuery) params.set("search", debouncedQuery);

      const res = await fetch(`${BACKEND_URL}/api/businesses?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const items: Business[] = (json.data as ApiBusinessItem[]).map(toBusinessCard);
      const total: number = json.total;

      if (reset) {
        setBusinesses(items);
      } else {
        setBusinesses((prev) => [...prev, ...items]);
      }

      setHasMore(pageNum * PAGE_SIZE < total);
      setPage(pageNum);
    } catch {
      // silently fail
    }
  }

  // Reset & reload when filter/search changes
  useEffect(() => {
    let cancelled = false;
    setBusinesses([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(true);

    const timer = setTimeout(async () => {
      if (cancelled) return;
      await fetchPage(1, true);
      if (!cancelled) setIsLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sector, debouncedQuery]); // eslint-disable-line

  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingMore || isLoading) return;
    setIsFetchingMore(true);
    await fetchPage(page + 1, false);
    setIsFetchingMore(false);
  }, [hasMore, isFetchingMore, isLoading, page, sector, debouncedQuery]); // eslint-disable-line

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 px-12 py-4 mx-auto w-full">
      <div className="w-full rounded-xl border flex gap-2 bg-secondary px-4 py-2 items-center">
        <Search size={15} />
        <Input
          placeholder="Search by name, industry, or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-none shadow-none"
        />
      </div>

      <div className="w-full flex gap-2 flex-wrap">
        {businessSectors.map((s) => (
          <button
            key={s}
            onClick={() => setSector((prev) => (prev === s ? null : s))}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              sector === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:bg-primary/20 hover:border-primary/40 hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <MasonryGrid
        businesses={businesses}
        isLoading={isLoading}
        isFetchingMore={isFetchingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
