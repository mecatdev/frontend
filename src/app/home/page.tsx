"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SwipeDeck, type SwipeDeckHandle } from "./components/swipe-deck";
import { BusinessTable, BusinessTableSkeleton } from "./components/business-table";
import { DISCOVERY_BUSINESSES, TRENDING_BUSINESSES, ALL_BUSINESSES } from "./data";
import { businessSectors, type bsector } from "@/lib/onboarding/schemas";
import { cn } from "@/lib/utils";

type DeckId = "discovery" | "trending";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sector, setSector] = useState<bsector | null>(null);
  const [activeDeckId, setActiveDeckId] = useState<DeckId>("discovery");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const isSearching = query.trim().length > 0;
  const isLoadingSearch = isSearching && debouncedQuery !== query;

  const discoveryRef = useRef<SwipeDeckHandle>(null);
  const trendingRef = useRef<SwipeDeckHandle>(null);

  const deckRefs: Record<DeckId, React.RefObject<SwipeDeckHandle | null>> = {
    discovery: discoveryRef,
    trending: trendingRef,
  };

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const direction = e.key === "ArrowRight" ? "right" : "left";
      deckRefs[activeDeckId].current?.advance(direction);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  // deckRefs is stable (object of stable refs) — activeDeckId is the real dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDeckId]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_BUSINESSES.filter((b) => {
      const matchesQuery =
        b.name.toLowerCase().includes(q) ||
        b.industry.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q);
      const matchesSector = !sector || b.industry === sector;
      return matchesQuery && matchesSector;
    });
  }, [debouncedQuery, sector]);

  const discoveryFiltered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q) return DISCOVERY_BUSINESSES;
    return DISCOVERY_BUSINESSES.filter((b) => {
      const matchesSector = !sector || b.industry === sector;
      return matchesSector;
    });
  }, [debouncedQuery, sector]);

  return (
    <div className="min-h-screen flex flex-col items-center px-10 py-8 gap-6 max-w-5xl mx-auto w-full">
      <div className="w-full space-y-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Hello, Welcome!</h1>
        <p className="text-sm text-muted-foreground">
          Discover businesses looking for investment.
        </p>
      </div>

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
                : "bg-secondary text-muted-foreground border-border hover:bg-primary/20 hover:border-primary/40 hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {isSearching ? (
        <div className="w-full rounded-2xl border bg-card p-4">
          {isLoadingSearch ? (
            <BusinessTableSkeleton />
          ) : (
            <BusinessTable businesses={filtered} />
          )}
        </div>
      ) : (
        <>
          {/* discovery deck */}
          <DeckSection
            label="Discovery"
            isActive={activeDeckId === "discovery"}
            onActivate={() => setActiveDeckId("discovery")}
          >
            <SwipeDeck
              ref={discoveryRef}
              businesses={discoveryFiltered.length > 0 ? discoveryFiltered : DISCOVERY_BUSINESSES}
              key={`discovery-${sector}`}
            />
          </DeckSection>

          {/* trending deck */}
          <DeckSection
            label="Trending"
            isActive={activeDeckId === "trending"}
            onActivate={() => setActiveDeckId("trending")}
          >
            <SwipeDeck
              ref={trendingRef}
              businesses={TRENDING_BUSINESSES}
              key="trending"
            />
          </DeckSection>

          <p className="text-xs text-muted-foreground">
            Hover a section then use{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">←</kbd>{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">→</kbd>{" "}
            to navigate the active deck
          </p>
        </>
      )}
    </div>
  );
}

type DeckSectionProps = {
  label: string;
  isActive: boolean;
  onActivate?: () => void;
  children: React.ReactNode;
};

function DeckSection({ label, isActive, onActivate, children }: DeckSectionProps) {
  return (
    <section
      className="w-full flex flex-col gap-4 p-4"
      onMouseEnter={onActivate}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
        {isActive && onActivate && (
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            active
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
