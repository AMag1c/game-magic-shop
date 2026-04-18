"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGameCategories, type GameCategory } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => fetchGameCategories() as Promise<GameCategory[]>,
    staleTime: 5 * 60 * 1000,
  });
}
