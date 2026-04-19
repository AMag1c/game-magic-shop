"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameItem } from "@/lib/api";

interface SpecialOffersProps {
  games: GameItem[];
  isLoading?: boolean;
}

function getImg(g: GameItem) {
  return g.coverImage || "/game-sample.jpg";
}

function getDiscount(g: GameItem) {
  if (!g.originalPrice || g.originalPrice <= g.price) return 0;
  return Math.round((1 - g.price / g.originalPrice) * 100);
}

// 大聚光灯卡片
function SpotlightCard({ game }: { game: GameItem }) {
  const pct = getDiscount(game);
  return (
    <Link href={`/game/${game.id}`} className="block bg-steam-medium rounded overflow-hidden hover:brightness-110 transition cursor-pointer">
      <div className="relative aspect-[16/7]">
        <Image src={getImg(game)} alt={game.name} fill className="object-cover" />
      </div>
      <div className="p-2.5 space-y-1">
        <span className="text-[11px] text-steam-blue font-medium">限时特惠</span>
        <p className="text-xs text-steam-text-dim truncate">{game.name}</p>
        {pct > 0 ? (
          <div className="flex items-center gap-2">
            <span className="bg-steam-green text-white text-xs font-bold px-1.5 py-0.5 rounded">-{pct}%</span>
            <span className="text-[11px] text-steam-text-dim line-through">{game.originalPrice} 游戏币</span>
            <span className="text-xs text-steam-sale font-medium">{game.price} 游戏币</span>
          </div>
        ) : game.price === 0 ? (
          <span className="text-xs text-steam-blue font-medium">免费开玩</span>
        ) : (
          <span className="text-xs text-steam-text">{game.price} 游戏币</span>
        )}
      </div>
    </Link>
  );
}

// 小胶囊卡片
function CapsuleCard({ game }: { game: GameItem }) {
  const pct = getDiscount(game);
  return (
    <Link href={`/game/${game.id}`} className="block bg-steam-medium rounded overflow-hidden hover:brightness-110 transition cursor-pointer">
      <div className="relative aspect-[292/136]">
        <Image src={getImg(game)} alt={game.name} fill className="object-cover" />
      </div>
      <div className="px-2 py-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] text-steam-blue flex-shrink-0">今日特惠</span>
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

// 一列两个胶囊
function CapsuleCol({ games }: { games: GameItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {games.map((g) => <CapsuleCard key={g.id} game={g} />)}
    </div>
  );
}

export function SpecialOffers({ games, isLoading }: SpecialOffersProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // 筛选有折扣的游戏，按折扣力度排序
  const discountGames = games
    .filter((g) => g.originalPrice && g.originalPrice > g.price)
    .sort((a, b) => getDiscount(b) - getDiscount(a));

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="aspect-[4/3] rounded" />
          <Skeleton className="aspect-[4/3] rounded" />
          <Skeleton className="aspect-[4/3] rounded" />
        </div>
      </div>
    );
  }

  // 如果折扣游戏不够，用价格非零的游戏补充
  const allCandidates = discountGames.length >= 4
    ? discountGames
    : [...discountGames, ...games.filter((g) => g.price > 0 && getDiscount(g) === 0)].slice(0, 15);

  if (allCandidates.length < 4) return null;

  // 构建轮播页面
  const pages: { type: "double" | "single" | "capsules"; items: GameItem[] }[] = [];
  let idx = 0;

  // 第1页: 双聚光灯 (2 spotlight + 2 capsule = 4个)
  if (allCandidates.length >= idx + 4) {
    pages.push({ type: "double", items: allCandidates.slice(idx, idx + 4) });
    idx += 4;
  }
  // 第2页: 单聚光灯 (1 spotlight + 2~4 capsule)
  if (allCandidates.length >= idx + 3) {
    const count = Math.min(5, allCandidates.length - idx);
    pages.push({ type: "single", items: allCandidates.slice(idx, idx + count) });
    idx += count;
  }
  // 第3页: 纯胶囊 (3列各2)
  if (allCandidates.length >= idx + 4) {
    pages.push({ type: "capsules", items: allCandidates.slice(idx, idx + 6) });
  }

  if (pages.length === 0) return null;

  return (
    <div>
      {/* 标题 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-steam-text uppercase tracking-wide">折扣与活动</h2>
        <Link href="/category?sort=discount" className="text-xs text-steam-text-dim hover:text-steam-blue transition-colors">
          浏览更多 &gt;
        </Link>
      </div>

      {/* 轮播 */}
      <div className="relative group overflow-visible">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {pages.map((page, pi) => (
              <div key={pi} className="flex-[0_0_100%] min-w-0 pr-0">
                {page.type === "double" && (
                  // 双聚光灯: 2 spotlight + 1列2 capsule
                  <div className="grid grid-cols-3 gap-2">
                    <SpotlightCard game={page.items[0]} />
                    <SpotlightCard game={page.items[1]} />
                    <CapsuleCol games={page.items.slice(2, 4)} />
                  </div>
                )}
                {page.type === "single" && (
                  // 单聚光灯: 1 spotlight + 2列各2 capsule
                  <div className="grid grid-cols-3 gap-2">
                    <SpotlightCard game={page.items[0]} />
                    <CapsuleCol games={page.items.slice(1, 3)} />
                    <CapsuleCol games={page.items.slice(3, 5)} />
                  </div>
                )}
                {page.type === "capsules" && (
                  // 纯胶囊: 3列各2 capsule
                  <div className="grid grid-cols-3 gap-2">
                    <CapsuleCol games={page.items.slice(0, 2)} />
                    <CapsuleCol games={page.items.slice(2, 4)} />
                    <CapsuleCol games={page.items.slice(4, 6)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 左右箭头 - 在轮播外侧 */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute -left-[40px] top-0 h-[calc(100%-28px)] w-[40px] flex items-center justify-center
            hover:bg-steam-light/20 transition-colors cursor-pointer z-10"
        >
          <ChevronLeft className="w-8 h-8 text-steam-text-dim" />
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute -right-[40px] top-0 h-[calc(100%-28px)] w-[40px] flex items-center justify-center
            hover:bg-steam-light/20 transition-colors cursor-pointer z-10"
        >
          <ChevronRight className="w-8 h-8 text-steam-text-dim" />
        </button>

        {/* 底部导航点 */}
        <div className="flex justify-center gap-1.5 pt-3">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all cursor-pointer",
                selectedIndex === i
                  ? "bg-steam-blue"
                  : "bg-steam-text-dim/30 hover:bg-steam-text-dim/60"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
