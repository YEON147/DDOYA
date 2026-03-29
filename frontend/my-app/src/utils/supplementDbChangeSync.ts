import type { QueryClient } from '@tanstack/react-query';
import { reportApi } from '@/src/api/report';
import { intakeRoutineApi } from '@/src/api/intakeRoutine';
import { supplementApi } from '@/src/api/supplement';
import { getLocalCalendarDateKeySnapshot } from '@/src/utils/localCalendarDay';

const SUPPLEMENTS_LIST_PAGE = 0;
const SUPPLEMENTS_LIST_SIZE = 50;

async function prefetchReportDailyAndSupplementList(queryClient: QueryClient) {
  const dateKey = getLocalCalendarDateKeySnapshot();
  await Promise.all([
    queryClient
      .fetchQuery({
        queryKey: ['report'],
        queryFn: async () => (await reportApi.getReport()).data.data,
      })
      .catch(() => {}),
    queryClient
      .fetchQuery({
        queryKey: ['dailyIntakeSchedule', dateKey],
        queryFn: async () => (await intakeRoutineApi.getDailySchedule({ date: dateKey })).data.data,
      })
      .catch(() => {}),
    queryClient
      .fetchQuery({
        queryKey: ['supplements', SUPPLEMENTS_LIST_PAGE, SUPPLEMENTS_LIST_SIZE],
        queryFn: async () => (await supplementApi.getSupplements(SUPPLEMENTS_LIST_PAGE, SUPPLEMENTS_LIST_SIZE)).data.data,
      })
      .catch(() => {}),
  ]);
}

/**
 * DB에서 영양제 정보가 바뀐 뒤(등록·수정·삭제) 리포트·섭취 루틴·목록 캐시를 서버와 맞춤.
 * inactive 쿼리까지 refetchType: 'all' 로 잡아 탭이 안 떠 있어도 다음 진입 시 옛 데이터를 덜 탐.
 * 오늘 일별 스케줄·첫 페이지 목록은 즉시 prefetch 해 홈·목록에 반영을 빠르게 맞춤.
 */
export async function refreshCachesAfterSupplementChange(
  queryClient: QueryClient,
  options?: { removedSupplementId?: number },
) {
  if (options?.removedSupplementId != null) {
    queryClient.removeQueries({ queryKey: ['supplement', options.removedSupplementId] });
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['supplements'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['supplement'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['dailyIntakeSchedule'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['intakeSettings'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['intakeRoutineList'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['report'], refetchType: 'all' }),
  ]);

  await prefetchReportDailyAndSupplementList(queryClient);
}
