import type { DailyIntakeTimeSlot } from '@/src/types/intakeRoutine';

export function formatKoreanTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const isPm = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const period = isPm ? '오후' : '오전';
  return `${period} ${h12}:${m.toString().padStart(2, '0')}`;
}

/** 슬롯 단위로 ‘완료’: 해당 시간의 모든 항목이 섭취 처리됨 */
export function countCompletedSlots(slots: DailyIntakeTimeSlot[]): number {
  return slots.filter((s) => {
    if (s.items.length === 0) return false;
    return s.items.every((i) => i.status === 'TAKEN' || i.status === 'SKIPPED');
  }).length;
}

export function findNextAttentionSlot(slots: DailyIntakeTimeSlot[]): DailyIntakeTimeSlot | null {
  const needsAttention = (s: DailyIntakeTimeSlot) =>
    s.items.some((i) => i.status !== 'TAKEN' && i.status !== 'SKIPPED');
  return slots.find(needsAttention) ?? null;
}

/** 서버 `plannedAt` 우선, 없으면 오늘 날짜 + intakeTime(HH:mm) */
export function slotTargetDate(slot: DailyIntakeTimeSlot): Date | null {
  if (slot.plannedAt) {
    const d = new Date(slot.plannedAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const [hs, ms] = slot.intakeTime.split(':');
  const h = parseInt(hs, 10);
  const m = parseInt(ms ?? '0', 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/** 남은 시간을 `HH:MM:SS` 타이머 문자열로 (0 이하이면 `00:00:00`) */
export function formatCountdownTimer(target: Date, now: Date): string {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
