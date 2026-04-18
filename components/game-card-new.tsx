"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameItem } from "@/lib/api";

interface GameCardProps {
  game: GameItem;
  variant?: "capsule" | "portrait" | "featured";
  className?: string;
}

function getImg(game: GameItem) {
  return game.coverImage || "/game-sample.jpg";
}

/**
 * Steam 风格游戏卡片
 * - capsule: 横向胶囊 (默认，用于列表和行)
 * - portrait: 纵向 (用于网格)
 * - featured: 大横幅 (用于精选区)
 */
export function GameCardNew({ game, variant = "capsule", className }: GameCardProps) {
  // 横向胶囊卡片 -- Steam 主力卡片样式
  if (variant === "capsule") {
    return (
      <Link
        href={`/game/${game.id}`}
        className={cn(
          "group flex bg-steam-light/30 hover:bg-steam-light/60 rounded transition-all cursor-pointer overflow-hidden",
          className
        )}
      >
        {/* 封面图 */}
        <div className="relative w-[184px] h-[69px] flex-shrink-0">
          <Image src={getImg(game)} alt={game.name} fill className="object-cover" />
        </div>
        {/* 信息区 */}
        <div className="flex-1 min-w-0 px-3 py-1.5 flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-medium text-steam-text truncate">{game.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-steam-text-dim bg-steam-light/50 px-1.5 py-0.5 rounded-sm">{game.category}</span>
              {game.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[11px] text-steam-text-dim bg-steam-light/50 px-1.5 py-0.5 rounded-sm hidden sm:inline">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-steam-text-dim">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {game.rating.toFixed(1)}
            </div>
            {game.price === 0 ? (
              <span className="text-[12px] font-medium text-steam-blue">免费</span>
            ) : (
              <div className="flex items-center gap-1.5">
                {game.memberPrice > 0 && game.memberPrice < game.price && (
                  <span className="text-[11px] bg-steam-green text-steam-sale font-bold px-1 rounded-sm">
                    -{Math.round((1 - game.memberPrice / game.price) * 100)}%
                  </span>
                )}
                {game.memberPrice > 0 && game.memberPrice < game.price && (
                  <span className="text-[11px] text-steam-text-dim line-through">{game.price}</span>
                )}
                <span className="text-[12px] text-steam-text flex items-center gap-0.5">
                  <Coins className="w-3 h-3" />
                  {game.memberPrice > 0 && game.memberPrice < game.price ? game.memberPrice : game.price}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // 纵向卡片 -- 用于网格视图
  if (variant === "portrait") {
    return (
      <Link
        href={`/game/${game.id}`}
        className={cn(
          "group block rounded overflow-hidden bg-steam-light/20 hover:bg-steam-light/40 transition-all cursor-pointer",
          className
        )}
      >
        <div className="relative aspect-[2/3]">
          <Image src={getImg(game)} alt={game.name} fill className="object-cover" />
          {/* 底部信息渐变 */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-2 px-2">
            <h3 className="text-[13px] font-medium text-white truncate">{game.name}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-white/60">{game.category}</span>
              {game.price === 0 ? (
                <span className="text-[11px] text-steam-blue font-medium">免费</span>
              ) : (
                <span className="text-[11px] text-white/80 flex items-center gap-0.5">
                  <Coins className="w-3 h-3" />
                  {game.memberPrice > 0 && game.memberPrice < game.price ? game.memberPrice : game.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // featured -- 大横幅
  return (
    <Link
      href={`/game/${game.id}`}
      className={cn(
        "group block relative rounded overflow-hidden cursor-pointer",
        className
      )}
    >
      <div className="relative aspect-[16/7]">
        <Image src={getImg(game)} alt={game.name} fill className="object-cover group-hover:brightness-110 transition-all" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 max-w-md">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{game.name}</h2>
          {game.description && (
            <p className="text-sm text-white/70 line-clamp-2 mb-3">{game.description}</p>
          )}
          <div className="flex items-center gap-3">
            {game.price === 0 ? (
              <span className="text-sm font-medium text-steam-blue">免费游玩</span>
            ) : (
              <span className="text-sm text-white flex items-center gap-1">
                <Coins className="w-4 h-4" />
                {game.price} 游戏币
              </span>
            )}
            <span className="text-xs text-white/50">|</span>
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {game.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
