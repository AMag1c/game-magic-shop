"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Download, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { GameItem } from "@/lib/api";

function getGameImage(game: GameItem) {
  return game.coverImage || "/game-sample.jpg";
}

interface GameCardProps {
  game: GameItem;
  /** 显示价格标签（会员价/免费） */
  showPriceBadge?: boolean;
  /** 可选择模式（收藏页） */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
  /** 删除回调（收藏页） */
  onRemove?: (id: number) => void;
}

export function GameCard({
  game,
  showPriceBadge = false,
  selectable = false,
  selected = false,
  onSelect,
  onRemove,
}: GameCardProps) {
  return (
    <div
      className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all h-72 flex flex-col overflow-hidden relative ${
        selectable && selected ? "ring-2 ring-primary" : ""
      }`}
    >
      {selectable && (
        <div
          className="absolute top-2 left-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSelect?.(game.id);
          }}
        >
          <Checkbox checked={selected} />
        </div>
      )}

      <Link href={`/game/${game.id}`} className="relative flex-[3] bg-gray-100 block">
        <Image
          src={getGameImage(game)}
          alt={game.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {showPriceBadge && game.price === 0 && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white text-xs">免费</Badge>
          </div>
        )}
        {showPriceBadge && game.memberPrice > 0 && game.memberPrice < game.price && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-500 text-yellow-900 text-xs">会员价</Badge>
          </div>
        )}
      </Link>

      <div className="flex-[2] p-3">
        <Badge variant="secondary" className="text-xs mb-2">
          {game.category}
        </Badge>
        <Link href={`/game/${game.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {game.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {game.rating.toFixed(1)}
          </span>
          {onRemove ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                onRemove(game.id);
              }}
              className="text-red-400 hover:text-red-600 transition-colors"
              title="取消收藏"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {game.downloads}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
