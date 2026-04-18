"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Eye, Download, Heart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameItem } from "@/lib/api";

interface HeroCarouselProps {
  games: GameItem[];
  isLoading?: boolean;
}

function getImg(game: GameItem) {
  return game.coverImage || "/game-sample.jpg";
}

function formatNumber(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + "w";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function HeroCarousel({ games, isLoading }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (isLoading) {
    return <Skeleton className="w-full h-[353px] rounded-none" />;
  }

  if (games.length === 0) return null;

  return (
    <div className="relative group">
      {/* 整体轮播：每个 slide = 左封面 + 右信息面板 */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {games.map((game) => {
            const screenshots = game.screenshots?.slice(0, 4) ?? [];
            const hasDiscount = game.originalPrice && game.originalPrice > game.price;
            const discountPct = hasDiscount
              ? Math.round((1 - game.price / game.originalPrice!) * 100)
              : 0;

            return (
              <div key={game.id} className="flex-[0_0_100%] min-w-0">
                <div className="flex h-[353px]">
                  {/* 左侧 2/3 封面图 */}
                  <Link
                    href={`/game/${game.id}`}
                    className="relative w-2/3 block flex-shrink-0 cursor-pointer"
                  >
                    <Image
                      src={getImg(game)}
                      alt={game.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </Link>

                  {/* 右侧 1/3 信息面板 */}
                  <div className="w-1/3 flex flex-col bg-steam-medium p-4 overflow-hidden">
                    {/* 游戏名称 */}
                    <Link href={`/game/${game.id}`}>
                      <h3 className="text-base font-bold text-steam-text hover:text-white transition-colors truncate">
                        {game.name}
                      </h3>
                    </Link>

                    {/* 4张截图 2x2 */}
                    {screenshots.length > 0 && (
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {screenshots.map((ss, i) => (
                          <div key={i} className="relative aspect-video rounded-sm overflow-hidden bg-steam-dark">
                            <Image src={ss} alt="" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 标签 */}
                    {game.tags && game.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {game.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] leading-tight px-1.5 py-0.5 rounded bg-steam-light/50 text-steam-text-dim"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 价格 */}
                    <div className="flex items-center gap-2 mt-3">
                      {hasDiscount && (
                        <span className="bg-steam-green text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          -{discountPct}%
                        </span>
                      )}
                      {game.price === 0 ? (
                        <span className="text-sm text-steam-blue font-medium">免费开玩</span>
                      ) : hasDiscount ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-steam-text-dim line-through">
                            {game.originalPrice} 游戏币
                          </span>
                          <span className="text-sm text-steam-sale font-medium">
                            {game.price} 游戏币
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-steam-text">{game.price} 游戏币</span>
                      )}
                    </div>

                    {/* 底部统计信息 */}
                    <div className="mt-auto pt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-steam-text-dim">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />{formatNumber(game.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />{formatNumber(game.downloads)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />{formatNumber(game.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{formatDate(game.releaseDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 左右箭头 - 在轮播图外侧 */}
      <button
        onClick={scrollPrev}
        className="absolute -left-[40px] top-0 h-[353px] w-[40px] flex items-center justify-center
          hover:bg-steam-light/20 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 z-10"
      >
        <ChevronLeft className="w-8 h-8 text-steam-text-dim" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute -right-[40px] top-0 h-[353px] w-[40px] flex items-center justify-center
          hover:bg-steam-light/20 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 z-10"
      >
        <ChevronRight className="w-8 h-8 text-steam-text-dim" />
      </button>

      {/* 底部导航点 */}
      <div className="flex justify-center gap-1.5 py-2 bg-steam-dark/60">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all cursor-pointer",
              selectedIndex === index
                ? "bg-steam-blue scale-110"
                : "bg-steam-text-dim/40 hover:bg-steam-text-dim/70"
            )}
          />
        ))}
      </div>
    </div>
  );
}
