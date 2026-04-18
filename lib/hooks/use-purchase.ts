"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPurchaseGame, type PurchaseResult } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function usePurchaseGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gameId: number) => fetchPurchaseGame(gameId) as Promise<PurchaseResult>,
    onSuccess: (_data, gameId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.purchaseStatus(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
  });
}
