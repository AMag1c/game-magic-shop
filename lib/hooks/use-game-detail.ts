"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGameDetail, fetchPurchaseStatus, type GameItem, type PurchaseStatus } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useGameDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.games.detail(id),
    queryFn: () => fetchGameDetail(id) as Promise<GameItem>,
    enabled: !!id,
  });
}

export function usePurchaseStatus(id: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.games.purchaseStatus(id),
    queryFn: () => fetchPurchaseStatus(id) as Promise<PurchaseStatus>,
    enabled: !!id && enabled,
  });
}
