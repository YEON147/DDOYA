import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplementApi } from '@/src/api/supplement';
import { SupplementUpdateRequest } from '@/src/types/types';
import { useAuthStore } from '@/src/store/authStore';
import { refreshCachesAfterSupplementChange } from '@/src/utils/supplementDbChangeSync';

const SUPPLEMENTS_LIST_KEY = ['supplements'] as const;

export const useSupplementsList = (page = 0, size = 50) => {
  const hasHydrated = useAuthStore((s) => s.hasHydratedFromStorage);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: [...SUPPLEMENTS_LIST_KEY, page, size],
    queryFn: async () => {
      const response = await supplementApi.getSupplements(page, size);
      return response.data.data;
    },
    enabled: hasHydrated && !!accessToken,
  });
};

export const useSupplementDetail = (supplementId: number) => {
  return useQuery({
    queryKey: ['supplement', supplementId],
    queryFn: async () => {
      const response = await supplementApi.getSupplementById(supplementId);
      return response.data.data;
    },
    enabled: !!supplementId,
  });
};

export const useUpdateSupplement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SupplementUpdateRequest }) =>
      supplementApi.updateSupplement(id, data),
    onSuccess: async () => {
      await refreshCachesAfterSupplementChange(queryClient);
    },
  });
};

export const useDeleteSupplement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => supplementApi.deleteSupplement(id),
    onSuccess: async (_, id) => {
      await refreshCachesAfterSupplementChange(queryClient, { removedSupplementId: id });
    },
  });
};
