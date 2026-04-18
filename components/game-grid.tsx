"use client";

import { GameCardNew } from "@/components/game-card-new";
import { SkeletonCard } from "@/components/skeleton-card";
import { Button } from "@/components/ui/button";
import type { GameItem } from "@/lib/api";

interface GameGridProps {
  games: GameItem[];
  total?: number;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function GameGrid({ games, total, isLoading, hasMore, onLoadMore }: GameGridProps) {
  if (isLoading && games.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} variant="portrait" />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => (
          <GameCardNew key={game.id} game={game} variant="portrait" />
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && onLoadMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading ? "加载中..." : "加载更多"}
          </Button>
          {total !== undefined && (
            <p className="text-xs text-muted-foreground mt-2">
              已显示 {games.length} / 共 {total} 款
            </p>
          )}
        </div>
      )}
    </div>
  );
}
