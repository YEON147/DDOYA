import * as Localization from 'expo-localization';
import type { DailyIntakeTimeSlot } from '@/src/types/intakeRoutine';

export type TodayParts = { monthDay: string; weekday: string };

/** `auto`: 기기 선호 언어, `en` / `ko`: 캘린더 문구 언어 고정 */
export type TodayLocaleMode = 'auto' | 'ko' | 'en';

function resolveIntlLocale(mode: TodayLocaleMode): string {
  if (mode === 'ko') return 'ko-KR';
  if (mode === 'en') return 'en-US';
  const forced = process.env.EXPO_PUBLIC_HOME_DATE_LOCALE?.toLowerCase();
  if (forced === 'en') return 'en-US';
  if (forced === 'ko') return 'ko-KR';
  const tag = Localization.getLocales()[0]?.languageTag ?? 'en-US';
  return tag;
}

/** 홈 날짜 헤더 등 — 월·일 / 요일 분리 (기기가 영어면 March 25 / Tuesday) */
export function formatTodayParts(date: Date = new Date(), mode: TodayLocaleMode = 'auto'): TodayParts {
  const locale = resolveIntlLocale(mode);
  const monthDay = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' }).format(date);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  return { monthDay, weekday };
}

/** 한국어 고정 — `formatTodayParts(date, 'ko')`와 동일 */
export function formatKoreanTodayParts(date: Date = new Date()): TodayParts {
  return formatTodayParts(date, 'ko');
}

/** 한국어 한 줄 (예: 3월 25일 화요일) */
export function formatKoreanTodayLine(date: Date = new Date()): string {
  const { monthDay, weekday } = formatTodayParts(date, 'ko');
  return `${monthDay} ${weekday}`;
}

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
