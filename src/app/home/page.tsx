"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MasonryGrid } from "./components/masonry-grid";
import { fetchBusinessPage } from "./data";
import { businessSectors, type bsector } from "@/lib/onboarding/schemas";
import { cn } from "@/lib/utils";
import type { Business } from "@/types/business";

const lazy_fetch = 400;

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sector, setSector] = useState<bsector | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setBusinesses([]);
    setPage(0);
    setHasMore(true);
    setIsLoading(true);

    const timer = setTimeout(() => {
      if (cancelled) return;
      const result = fetchBusinessPage(0, sector, debouncedQuery);
      setBusinesses(result.businesses);
      setHasMore(result.hasMore);
      setIsLoading(false);
    }, lazy_fetch);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sector, debouncedQuery]);

  const loadMore = useCallback(() => {
    if (!hasMore || isFetchingMore || isLoading) return;
    setIsFetchingMore(true);

    const nextPage = page + 1;
    setTimeout(() => {
      const result = fetchBusinessPage(nextPage, sector, debouncedQuery);
      setBusinesses((prev) => [...prev, ...result.businesses]);
      setPage(nextPage);
      setHasMore(result.hasMore);
      setIsFetchingMore(false);
    }, lazy_fetch);
  }, [hasMore, isFetchingMore, isLoading, page, sector, debouncedQuery]);

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
