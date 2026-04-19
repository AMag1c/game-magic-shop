"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameItem } from "@/lib/api";

interface GameRowProps {
  title: string;
  games: GameItem[];
  viewAllHref?: string;
  isLoading?: boolean;
  className?: string;
}

function getImg(g: GameItem) {
  return g.coverImage || "/game-sample.jpg";
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 纵向卡片：上图 + 下方单行（左时间 / 右价格）
function RowCard({ game }: { game: GameItem }) {
  const pct = game.originalPrice && game.originalPrice > game.price
    ? Math.round((1 - game.price / game.originalPrice) * 100)
    : 0;
  const time = formatDate(game.releaseDate) || formatDate(game.createTime);

  return (
    <Link
      href={`/game/${game.id}`}
      className="block bg-steam-medium rounded-md overflow-hidden shadow-md shadow-black/50 cursor-pointer"
    >
      <div className="relative aspect-[292/136]">
        <Image src={getImg(game)} alt={game.name} fill className="object-cover" sizes="292px" />
      </div>
      <div className="px-2 h-10 flex items-center justify-between gap-2">
        <span className="text-[11px] text-steam-text-dim flex-shrink-0">{time}</span>
        {pct > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="bg-steam-green text-white text-[11px] font-bold px-1.5 py-0.5 rounded">-{pct}%</span>
            <div className="flex flex-col items-end leading-tight">
              <span className="text-[10px] text-steam-text-dim line-through">{game.originalPrice} 游戏币</span>
              <span className="text-[11px] text-steam-sale font-medium">{game.price} 游戏币</span>
            </div>
          </div>
        ) : game.price === 0 ? (
          <span className="text-[11px] text-steam-blue font-medium">免费</span>
        ) : (
          <span className="text-[11px] text-steam-text">{game.price} 游戏币</span>
        )}
      </div>
    </Link>
  );
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
    // 一屏正好 4 张：content 宽 = 4*cardW + 3*gap
    // 下一屏起点需跨过 4 张 + 4 个 gap = content 宽 + gap
    const cs = getComputedStyle(el);
    const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    const gap = parseFloat(cs.columnGap) || 0;
    const step = el.clientWidth - padX + gap;
    el.scrollTo({ left: el.scrollLeft + (dir === "left" ? -step : step), behavior: "smooth" });
  };

  return (
    <section className={cn("relative", className)}>
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-steam-text uppercase tracking-wide">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs text-steam-text-dim hover:text-steam-blue transition-colors">
            查看更多 &gt;
          </Link>
        )}
      </div>

      {/* 左右箭头 - 覆盖整个 section 高度 */}
      <button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        aria-label="向左滚动"
        className="absolute -left-[40px] inset-y-0 w-[40px] flex items-center justify-center
          hover:bg-steam-light/20 transition-colors cursor-pointer z-10
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <ChevronLeft className="w-8 h-8 text-steam-text-dim" />
      </button>
      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        aria-label="向右滚动"
        className="absolute -right-[40px] inset-y-0 w-[40px] flex items-center justify-center
          hover:bg-steam-light/20 transition-colors cursor-pointer z-10
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <ChevronRight className="w-8 h-8 text-steam-text-dim" />
      </button>

      {/* 滚动容器 */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-6 -mx-2 px-2 scroll-px-2"
        style={{ scrollbarWidth: "none" }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-none w-[calc((100%-36px)/4)] snap-start">
                <Skeleton className="w-full aspect-[292/136] rounded" />
              </div>
            ))
          : games.map((game) => (
              <div key={game.id} className="flex-none w-[calc((100%-36px)/4)] snap-start">
                <RowCard game={game} />
              </div>
            ))}
      </div>
    </section>
  );
}
