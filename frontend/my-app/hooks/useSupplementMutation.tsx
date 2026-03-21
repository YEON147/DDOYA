import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupplementCreateRequest } from '@/src/types/supplement';
import { getBackendErrorMessage } from '@/hooks/apiErrorMessage';
import { supplementApi } from '@/src/api/supplement';

export function useCreateSupplementMutation() {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, SupplementCreateRequest>({
    mutationFn: async (data) => {
      const res = await supplementApi.createSupplement(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
    },
  });
}

export function getCreateSupplementErrorMessage(error: unknown): string {
  return getBackendErrorMessage(error, '영양제 등록 중 오류가 발생했습니다.');
}
