import { useSyncExternalStore } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { intakeRoutineApi } from '../src/api/intakeRoutine';
import { IntakeRoutineUpdateRequest } from '../src/types/intakeRoutine';
import {
  getLocalCalendarDateKeySnapshot,
  subscribeLocalCalendarDay,
} from '../src/utils/localCalendarDay';

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

/**
 * 일별 섭취 스케줄.
 * - `date` 생략: 기기 로컬 `YYYY-MM-DD`를 쿼리 키·`?date=`에 넣어 자정·앱 복귀 후에도 캐시가 날짜별로 갈린다.
 * - 공유 스토어(`localCalendarDay`)로 탭(훅 인스턴스)마다 서로 다른 "오늘" 키를 쓰는 일을 막는다.
 */
export const useDailyIntakeSchedule = (date?: string) => {
  const calendarKey = useSyncExternalStore(
    subscribeLocalCalendarDay,
    getLocalCalendarDateKeySnapshot,
    getLocalCalendarDateKeySnapshot,
  );
  const dateKey = date ?? calendarKey;

  return useQuery({
    queryKey: ['dailyIntakeSchedule', dateKey],
    queryFn: async () => {
      const response = await intakeRoutineApi.getDailySchedule({ date: dateKey });
      return response.data.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};