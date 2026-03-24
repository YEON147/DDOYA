import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { intakeRoutineApi } from '../src/api/intakeRoutine';
import { IntakeRoutineUpdateRequest } from '../src/types/intakeRoutine';

export const useIntakeRoutineList = () => {
  return useQuery({
    queryKey: ['intakeRoutineList'],
    queryFn: async () => {
      const response = await intakeRoutineApi.getSettings();
      return response.data.data.settings;
    },
  });
};

export const useUpdateIntakeTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IntakeRoutineUpdateRequest }) =>
      intakeRoutineApi.updateSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intakeRoutineList'] });
    },
  });
};

/** `date` 생략 시 서버 기준 오늘. 쿼리 키는 `__today__`로 고정(자정 이후 새로고침 시 갱신). */
export const useDailyIntakeSchedule = (date?: string) => {
  return useQuery({
    queryKey: ['dailyIntakeSchedule', date ?? '__today__'],
    queryFn: async () => {
      const response = await intakeRoutineApi.getDailySchedule(date ? { date } : undefined);
      return response.data.data;
    },
  });
};