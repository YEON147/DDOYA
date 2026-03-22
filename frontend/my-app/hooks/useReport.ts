import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../src/api/report';

export const useReport = () => {
  return useQuery({
    queryKey: ['report'],
    queryFn: async () => {
      const response = await reportApi.getReport();
      return response.data.data;
    },
  });
};

export const useRefreshReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reportApi.updateReport(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
  });
};

export const useUpdateRecommendedTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userSupplementId, time }: { userSupplementId: number; time: string }) =>
      reportApi.updateRecommendedTime(userSupplementId, time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report'] });
      // 영양제 목록이나 루틴 정보도 갱신 필요할 수 있음
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
    },
  });
};
