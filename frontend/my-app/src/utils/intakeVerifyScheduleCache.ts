import type { QueryClient } from '@tanstack/react-query';
import type { DailyIntakeScheduleData, DailyIntakeScheduleSlotItem } from '@/src/types/intakeRoutine';

/** fetch 본문이 `{ message, data: PillVerify }` 이거나 평탄한 경우 모두 수용 */
export function extractPillVerifyPayload(serverBody: unknown): {
  success: boolean;
  message: string;
  results: unknown[];
} | null {
  if (!serverBody || typeof serverBody !== 'object') return null;
  const root = serverBody as Record<string, unknown>;
  const inner =
    root.data != null && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root;
  const success = inner.success === true;
  const message = typeof inner.message === 'string' ? inner.message : '';
  const results = Array.isArray(inner.results) ? inner.results : [];
  return { success, message, results };
}

function rowScheduleId(r: unknown): number | null {
  if (!r || typeof r !== 'object') return null;
  const o = r as Record<string, unknown>;
  const v = o.scheduleId ?? o.schedule_id;
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null;
}

function rowMatched(r: unknown): boolean {
  if (!r || typeof r !== 'object') return false;
  const v = (r as Record<string, unknown>).matched;
  return v === true;
}

function rowAfterTaken(r: unknown): boolean {
  if (!r || typeof r !== 'object') return true;
  const o = r as Record<string, unknown>;
  const after = o.afterStatus ?? o.after_status;
  if (after == null) return true;
  return after === 'TAKEN';
}

/**
 * 인증 응답에서 matched + TAKEN(또는 after 생략)인 scheduleId에 대해
 * `dailyIntakeSchedule` 캐시의 항목을 즉시 TAKEN으로 맞춤.
 * GET이 dedup/지연으로 MISSED를 주는 경우에도 홈 도장·상태가 맞도록 refetch 후에 한 번 더 호출할 것.
 */
export function verifyResultsAnyMatched(results: readonly unknown[]): boolean {
  return results.some((r) => rowMatched(r));
}

export async function syncDailyScheduleCacheAfterIntakeVerify(
  queryClient: QueryClient,
  /** `postIntakeCertification`이 돌려준 `await res.json()` 전체 */
  serverJson: unknown,
): Promise<{ success: boolean; message: string; results: unknown[] } | null> {
  const payload = extractPillVerifyPayload(serverJson);
  if (!payload) return null;

  applyMatchedSchedulesAsTakenInCache(queryClient, payload.results);
  await queryClient.refetchQueries({
    queryKey: ['dailyIntakeSchedule'],
    type: 'all',
  });
  applyMatchedSchedulesAsTakenInCache(queryClient, payload.results);
  return payload;
}

export function applyMatchedSchedulesAsTakenInCache(
  queryClient: QueryClient,
  results: readonly unknown[],
): void {
  const ids = new Set<number>();
  for (const r of results) {
    if (!rowMatched(r)) continue;
    if (!rowAfterTaken(r)) continue;
    const sid = rowScheduleId(r);
    if (sid != null) ids.add(sid);
  }
  if (ids.size === 0) return;

  const actionAt = new Date().toISOString();

  queryClient.setQueriesData<DailyIntakeScheduleData>({ queryKey: ['dailyIntakeSchedule'] }, (prev) => {
    if (!prev?.timeSlots?.length) return prev;

    const patchItems = (items: DailyIntakeScheduleSlotItem[]) =>
      items.map((it) =>
        ids.has(it.scheduleId) ? { ...it, status: 'TAKEN' as const, actionAt } : it,
      );

    return {
      ...prev,
      timeSlots: prev.timeSlots.map((slot) => ({
        ...slot,
        items: patchItems(slot.items),
      })),
    };
  });
}
