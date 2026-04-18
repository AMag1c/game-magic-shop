"use client";

import { GameRow } from "@/components/game-row";
import { useGames } from "@/lib/hooks/use-games";

interface RelatedGamesProps {
  categoryId: number;
  currentGameId: number;
}

export function RelatedGames({ categoryId, currentGameId }: RelatedGamesProps) {
  const { data, isLoading } = useGames({ categoryId, current: 1, size: 12 });
  const games = (data?.list ?? []).filter((g) => g.id !== currentGameId);

  if (!isLoading && games.length === 0) return null;

  return (
    <GameRow
      title="相关推荐"
      games={games}
      viewAllHref={`/category?categoryId=${categoryId}`}
      isLoading={isLoading}
    />
  );
}
