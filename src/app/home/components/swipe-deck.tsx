"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "./business-card";
import type { Business } from "@/types/business";

export type SwipeDeckHandle = {
  advance: (direction: "left" | "right") => void;
};

type Props = {
  businesses: Business[];
  cardHeight?: number;
  compact?: boolean;
};

const SWIPE_THRESHOLD = 90;
const EXIT_DISTANCE = 800;
const DEFAULT_CARD_HEIGHT = 640;
const STACK_SCALE = 0.04;
const STACK_Y = 10;

const STACK_SLOTS_DEFAULT = [
  { x: 200, rotate: 4 },
  { x: -200, rotate: -4 },
];

const STACK_SLOTS_COMPACT = [
  { x: 60, rotate: 3 },
  { x: -60, rotate: -3 },
];

type AnimState = "idle" | "exiting-left" | "exiting-right";

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export const SwipeDeck = forwardRef<SwipeDeckHandle, Props>(function SwipeDeck(
  { businesses, cardHeight = DEFAULT_CARD_HEIGHT, compact = false },
  ref
) {
  const STACK_SLOTS = compact ? STACK_SLOTS_COMPACT : STACK_SLOTS_DEFAULT;
  const [index, setIndex] = useState(0);
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const dragProgress = clamp(Math.abs(dragOffset) / SWIPE_THRESHOLD, 0, 1);
  const tilt = clamp(dragOffset * 0.08, -15, 15);

  const total = businesses.length;
  const visibleCards = [0, 1, 2].map((i) => businesses[(index + i) % total]);

  const advance = useCallback(
    (direction: "left" | "right") => {
      if (animState !== "idle") return;
      // when triggered without a drag, inject a synthetic offset so back-card
      // animations run identically to a completed manual swipe (dragProgress → 1)
      if (dragOffset === 0) {
        setDragOffset(direction === "right" ? SWIPE_THRESHOLD + 1 : -(SWIPE_THRESHOLD + 1));
      }
      setAnimState(direction === "right" ? "exiting-right" : "exiting-left");
    },
    [animState, dragOffset]
  );

  useImperativeHandle(ref, () => ({ advance }), [advance]);

  useEffect(() => {
    if (animState === "idle") return;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % businesses.length);
      setAnimState("idle");
      setDragOffset(0);
    }, 320);
    return () => clearTimeout(timer);
  }, [animState, businesses.length]);

  function onPointerDown(e: React.PointerEvent) {
    if (animState !== "idle") return;
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    startX.current = e.clientX;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return;
    setDragOffset(e.clientX - startX.current);
  }

  function onPointerUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragOffset > SWIPE_THRESHOLD) {
      advance("right");
    } else if (dragOffset < -SWIPE_THRESHOLD) {
      advance("left");
    } else {
      setDragOffset(0);
    }
  }

  const displayIndex = (index % businesses.length) + 1;

  function getTopCardStyle(): React.CSSProperties {
    if (animState === "exiting-right") {
      return {
        transform: `translateX(${EXIT_DISTANCE}px) rotate(30deg)`,
        transition: "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        opacity: 0,
        pointerEvents: "none",
      };
    }
    if (animState === "exiting-left") {
      return {
        transform: `translateX(-${EXIT_DISTANCE}px) rotate(-30deg)`,
        transition: "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        opacity: 0,
        pointerEvents: "none",
      };
    }
    if (dragOffset !== 0) {
      return {
        transform: `translateX(${dragOffset}px) rotate(${tilt}deg)`,
        transition: "none",
        cursor: "grabbing",
      };
    }
    return { cursor: "grab", transition: "transform 0.2s ease" };
  }

  function getBackStyle(stackIndex: number): React.CSSProperties {
    const slot = STACK_SLOTS[stackIndex - 1] ?? STACK_SLOTS[STACK_SLOTS.length - 1];
    const scale = 1 - STACK_SCALE * stackIndex;
    const ty = STACK_Y * stackIndex;

    const lerpedX = slot.x * (1 - dragProgress);
    const lerpedY = ty * (1 - dragProgress * 0.5);
    const lerpedScale = scale + (1 - scale) * dragProgress * 0.7;
    const lerpedRotate = slot.rotate * (1 - dragProgress);

    const baseOpacity = 1 - stackIndex * 0.18;
    const lerpedOpacity = baseOpacity + (1 - baseOpacity) * dragProgress;
    const baseBlur = stackIndex * 2;
    const lerpedBlur = baseBlur * (1 - dragProgress);

    return {
      transform: `translateX(${lerpedX}px) translateY(${lerpedY}px) scale(${lerpedScale}) rotate(${lerpedRotate}deg)`,
      transition: isDragging.current ? "none" : "transform 0.25s ease, opacity 0.25s ease, filter 0.25s ease",
      zIndex: 10 - stackIndex,
      transformOrigin: "bottom center",
      opacity: lerpedOpacity,
      filter: `blur(${lerpedBlur}px)`,
    };
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div
        className="relative w-full"
        style={{ height: cardHeight + STACK_Y * 2 }}
      >
        {[...visibleCards].reverse().map((business, reversedIdx) => {
          const stackIndex = visibleCards.length - 1 - reversedIdx;
          const isTop = stackIndex === 0;

          return (
            <div
              key={business.id}
              className="absolute inset-0"
              style={{
                height: cardHeight,
                ...(isTop ? { ...getTopCardStyle(), zIndex: 20 } : getBackStyle(stackIndex)),
              }}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? onPointerUp : undefined}
            >
              <BusinessCard business={business} />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 bg-secondary border-none"
          onClick={() => advance("left")}
          disabled={animState !== "idle"}
          aria-label="Previous"
        >
          <ChevronLeft size={20} className="text-primary"/>
        </Button>

        <span className="text-xs text-muted-foreground tabular-nums w-14 text-center">
          {displayIndex} / {businesses.length}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 bg-secondary border-none"
          onClick={() => advance("right")}
          disabled={animState !== "idle"}
          aria-label="Next"
        >
          <ChevronRight size={20} className="text-primary"/>
        </Button>
      </div>
    </div>
  );
});
