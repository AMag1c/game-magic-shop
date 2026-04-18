"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSignInStatus, fetchSignIn, type SignInStatus, type SignInResult } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useSignInStatus(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.signIn.status,
    queryFn: () => fetchSignInStatus() as Promise<SignInStatus>,
    enabled,
  });
}

export function useSignInAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchSignIn() as Promise<SignInResult>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.signIn.status });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
  });
}
