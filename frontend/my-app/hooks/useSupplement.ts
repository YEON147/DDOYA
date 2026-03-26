import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplementApi } from '@/src/api/supplement';
import { SupplementUpdateRequest } from '@/src/types/types';
import { useAuthStore } from '@/src/store/authStore';

const SUPPLEMENTS_LIST_KEY = ['supplements'] as const;

export const useSupplementsList = (page = 0, size = 50) => {
  const hasHydrated = useAuthStore((s) => s.hasHydratedFromStorage);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: [...SUPPLEMENTS_LIST_KEY, page, size],
    queryFn: async () => {
      const response = await supplementApi.getSupplements(page, size);
      const rows = (response.data.data.supplements ?? []) as unknown as Array<Record<string, unknown>>;
      console.log(
        '[supplements:list][bodyPart]',
        rows.map((row) => ({
          userSupplementId: row.userSupplementId,
          bodyPartId: row.bodyPartId,
          bodyPartName: row.bodyPartName,
        }))
      );
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
      const detail = response.data.data as unknown as Record<string, unknown>;
      console.log('[supplement:detail][bodyPart]', {
        userSupplementId: detail.userSupplementId,
        bodyPartId: detail.bodyPartId,
        bodyPartName: detail.bodyPartName,
      });
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['supplement', id] });
      queryClient.invalidateQueries({ queryKey: SUPPLEMENTS_LIST_KEY });
    },
  });
};

export const useDeleteSupplement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => supplementApi.deleteSupplement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLEMENTS_LIST_KEY });
    },
  });
};
