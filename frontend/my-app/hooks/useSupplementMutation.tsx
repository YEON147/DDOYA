import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { SupplementCreateRequest } from '@/src/types/supplement';
import { getBackendErrorMessage } from '@/hooks/apiErrorMessage';
import { buildSupplementRegisterFormData, supplementApi } from '@/src/api/supplement';
import { prepareLabelImageForOcr } from '@/src/utils/labelImageForUpload';

export type RegisterSupplementWithPillInput = {
  pillUri: string;
  pillMimeType?: string | null;
  register: SupplementCreateRequest;
};

export function useCreateSupplementMutation() {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, RegisterSupplementWithPillInput>({
    mutationFn: async ({ pillUri, register }) => {
      let prepared = await prepareLabelImageForOcr(pillUri, 'normal');
      try {
        const fd = buildSupplementRegisterFormData(prepared.uri, 'image/jpeg', register);
        const res = await supplementApi.createSupplementMultipart(fd);
        return res.data;
      } catch (firstErr) {
        if (
          axios.isAxiosError(firstErr) &&
          firstErr.response?.status === 413
        ) {
          prepared = await prepareLabelImageForOcr(pillUri, 'strong');
          const fd = buildSupplementRegisterFormData(prepared.uri, 'image/jpeg', register);
          const res = await supplementApi.createSupplementMultipart(fd);
          return res.data;
        }
        throw firstErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
  });
}

export function getCreateSupplementErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 413) {
    return '이미지가 너무 큽니다. 다시 촬영해 주세요.';
  }
  return getBackendErrorMessage(error, '영양제 등록 중 오류가 발생했습니다.');
}
