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
