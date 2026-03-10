"use client";

import { useEffect, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import { MasonryCard } from "./masonry-card";
import type { Business } from "@/types/business";

const skeleton_heights = [180, 240, 200, 260, 220, 280, 190, 250];
const column_count = 4;

function distributeToColumns(items: Business[], cols: number): Business[][] {
  const columns: Business[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => {
    columns[i % cols].push(item);
  });
  return columns;
}

type Props = {
  businesses: Business[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

export function MasonryGrid({
  businesses,
  isLoading,
  isFetchingMore,
  hasMore,
  onLoadMore,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  const columns = useMemo(
    () => distributeToColumns(businesses, column_count),
    [businesses],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || isFetchingMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreRef.current();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isFetchingMore, isLoading]);

  if (isLoading) {
    return <MasonryGridSkeleton />;
  }

  if (businesses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        No businesses found.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4">
            {col.map((business) => (
              <MasonryCard key={business.id} business={business} />
            ))}
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="w-full py-8 flex justify-center">
        {isFetchingMore && (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        )}
        {!hasMore && businesses.length > 0 && (
          <p className="text-xs text-muted-foreground">
            No more businesses to show
          </p>
        )}
      </div>
    </div>
  );
}

function MasonryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {Array.from({ length: column_count }).map((_, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, rowIdx) => {
            const i = colIdx * 2 + rowIdx;
            return (
              <div
                key={rowIdx}
                className="rounded-2xl border bg-card overflow-hidden"
              >
                <div
                  className="w-full bg-muted animate-pulse"
                  style={{ height: skeleton_heights[i % skeleton_heights.length] }}
                />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-3.5 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-full bg-muted rounded animate-pulse" />
                    <div className="h-3.5 w-3/4 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-5 w-14 bg-muted rounded-full animate-pulse" />
                    <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
