"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFavorites, fetchAddFavorite, fetchRemoveFavorite, type GameItem } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useFavorites(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.favorites.all,
    queryFn: async () => {
      const res = await fetchFavorites() as any;
      return (res?.list ?? []) as GameItem[];
    },
    enabled,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gameId: number) => fetchAddFavorite(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gameId: number) => fetchRemoveFavorite(gameId),
    onMutate: async (gameId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.all });
      const previous = queryClient.getQueryData<GameItem[]>(queryKeys.favorites.all);
      queryClient.setQueryData<GameItem[]>(queryKeys.favorites.all, (old) =>
        old?.filter((g) => g.id !== gameId) ?? []
      );
      return { previous };
    },
    onError: (_err, _gameId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.favorites.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
}
