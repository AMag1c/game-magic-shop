"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GameCardNew } from "@/components/game-card-new";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameItem } from "@/lib/api";

interface GameRowProps {
  title: string;
  games: GameItem[];
  viewAllHref?: string;
  isLoading?: boolean;
  className?: string;
}

export function GameRow({ title, games, viewAllHref, isLoading, className }: GameRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [games]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.scrollLeft + (dir === "left" ? -600 : 600), behavior: "smooth" });
  };

  return (
    <section className={className}>
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-steam-text uppercase tracking-wide">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs text-steam-text-dim hover:text-steam-blue transition-colors">
            查看更多 &gt;
          </Link>
        )}
      </div>

      {/* 滚动容器 */}
      <div className="relative group/row">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-[40px] top-0 h-full w-[40px] flex items-center justify-center
              hover:bg-steam-light/20 transition-colors cursor-pointer opacity-0 group-hover/row:opacity-100 z-10"
          >
            <ChevronLeft className="w-8 h-8 text-steam-text-dim" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-[40px] top-0 h-full w-[40px] flex items-center justify-center
              hover:bg-steam-light/20 transition-colors cursor-pointer opacity-0 group-hover/row:opacity-100 z-10"
          >
            <ChevronRight className="w-8 h-8 text-steam-text-dim" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-none w-[320px]">
                  <Skeleton className="w-full h-[69px] rounded" />
                </div>
              ))
            : games.map((game) => (
                <div key={game.id} className="flex-none w-[320px]">
                  <GameCardNew game={game} variant="capsule" />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
