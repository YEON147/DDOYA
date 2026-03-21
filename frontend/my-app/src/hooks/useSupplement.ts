import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplementApi } from '../api/supplement';
import { SupplementUpdateRequest } from '../types/types';

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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['supplement', id] });
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
    },
  });
};

export const useDeleteSupplement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => supplementApi.deleteSupplement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
    },
  });
};
