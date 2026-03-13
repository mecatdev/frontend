"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  allowLoopWhenExhausted?: boolean;
  onLoadMore: () => void;
};

export function MasonryGrid({
  businesses,
  isLoading,
  isFetchingMore,
  hasMore,
  allowLoopWhenExhausted = false,
  onLoadMore,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);
  const appendLockRef = useRef(0);
  const [loopedBusinesses, setLoopedBusinesses] = useState<Business[]>(businesses);

  loadMoreRef.current = onLoadMore;

  const useMasonryLayout = businesses.length > 5;
  const canLoopInfinitely =
    allowLoopWhenExhausted && useMasonryLayout && businesses.length > 0 && !hasMore;

  useEffect(() => {
    setLoopedBusinesses(businesses);
  }, [businesses]);

  const displayedBusinesses = useMasonryLayout ? loopedBusinesses : businesses;

  const columns = useMemo(
    () => distributeToColumns(displayedBusinesses, column_count),
    [displayedBusinesses],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || isFetchingMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (hasMore) {
          loadMoreRef.current();
          return;
        }

        if (!canLoopInfinitely) return;

        const now = Date.now();
        if (now - appendLockRef.current < 350) return;

        appendLockRef.current = now;
        setLoopedBusinesses((prev) => [...prev, ...businesses]);
      },
      { rootMargin: "220px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [businesses, canLoopInfinitely, hasMore, isFetchingMore, isLoading]);

  if (isLoading) {
    return <MasonryGridSkeleton />;
  }

  if (businesses.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No businesses found.
      </p>
    );
  }

  if (!useMasonryLayout) {
    return (
      <div className="w-full">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {businesses.map((business) => (
            <MasonryCard key={business.id} business={business} mode="standard" />
          ))}
        </div>

        <div ref={sentinelRef} className="flex w-full justify-center py-8">
          {isFetchingMore && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
          {!hasMore && (
            <p className="text-xs text-muted-foreground">No more businesses to show</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4">
            {col.map((business, itemIdx) => (
              <MasonryCard
                key={`${business.id}-${colIdx}-${itemIdx}`}
                business={business}
                mode="masonry"
              />
            ))}
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="flex w-full justify-center py-8">
        {isFetchingMore && (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function MasonryGridSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: column_count }).map((_, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, rowIdx) => {
            const i = colIdx * 2 + rowIdx;
            return (
              <div
                key={rowIdx}
                className="overflow-hidden rounded-2xl border bg-card"
              >
                <div
                  className="w-full animate-pulse bg-muted"
                  style={{ height: skeleton_heights[i % skeleton_heights.length] }}
                />
                <div className="space-y-3 p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
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
