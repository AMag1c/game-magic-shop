"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGameList, type GameItem, type PageResponse } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

interface GameFilters {
  categoryId?: number;
  keyword?: string;
  current?: number;
  size?: number;
}

export function useGames(filters: GameFilters = {}) {
  return useQuery({
    queryKey: queryKeys.games.list(filters),
    queryFn: async () => {
      const res = await fetchGameList(filters);
      const data = res as any;
      return {
        list: (data?.list ?? data ?? []) as GameItem[],
        total: data?.total ?? 0,
        page: data?.page ?? 1,
        size: data?.size ?? 20,
      };
    },
    placeholderData: (prev) => prev,
  });
}

export function useAllGames(size = 100) {
  return useGames({ current: 1, size });
}
