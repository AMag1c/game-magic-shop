"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVipStatus, fetchVipSubscribe, type VipStatus, type VipPlan } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useVipStatus(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.vip.status,
    queryFn: () => fetchVipStatus() as Promise<VipStatus>,
    enabled,
  });
}

export function useVipSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: VipPlan) => fetchVipSubscribe(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vip.status });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
  });
}
