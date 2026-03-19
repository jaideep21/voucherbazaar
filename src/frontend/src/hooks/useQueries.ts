import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, Voucher } from "../backend";
import { useActor } from "./useActor";

export function useAvailableVouchers() {
  const { actor, isFetching } = useActor();
  return useQuery<Voucher[]>({
    queryKey: ["availableVouchers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableVouchers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyVouchers() {
  const { actor, isFetching } = useActor();
  return useQuery<Voucher[]>({
    queryKey: ["myVouchers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyVouchers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useCreateVoucher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      category: string;
      faceValue: number;
      sellingPrice: number;
      voucherCode: string;
      description: string;
      imageId: string;
      sellerName: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createVoucher(
        params.title,
        params.category,
        params.faceValue,
        params.sellingPrice,
        params.voucherCode,
        params.description,
        params.imageId,
        params.sellerName,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableVouchers"] });
      queryClient.invalidateQueries({ queryKey: ["myVouchers"] });
    },
  });
}

export function useDeleteVoucher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteVoucher(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableVouchers"] });
      queryClient.invalidateQueries({ queryKey: ["myVouchers"] });
    },
  });
}

export function useMarkAsSold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.markAsSold(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableVouchers"] });
      queryClient.invalidateQueries({ queryKey: ["myVouchers"] });
    },
  });
}

export function useExtractText() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.extractTextFromImage(imageUrl);
    },
  });
}
