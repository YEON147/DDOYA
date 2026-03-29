import { AppState } from 'react-native';
import { formatLocalDateKey } from './nextIntake';

type Listener = () => void;

const listeners = new Set<Listener>();

let cachedKey = formatLocalDateKey();
let intervalId: ReturnType<typeof setInterval> | null = null;
let appSub: { remove: () => void } | null = null;

export function getLocalCalendarDateKeySnapshot(): string {
  return cachedKey;
}

export function syncLocalCalendarDayFromClock(): void {
  const next = formatLocalDateKey();
  if (next === cachedKey) return;
  cachedKey = next;
  listeners.forEach((l) => l());
}

function ensureWatchers(): void {
  if (intervalId != null) return;
  syncLocalCalendarDayFromClock();
  intervalId = setInterval(syncLocalCalendarDayFromClock, 60_000);
  appSub = AppState.addEventListener('change', (state) => {
    if (state === 'active') syncLocalCalendarDayFromClock();
  });
}

/** 탭마다 훅 인스턴스가 나뉘어도 같은 `YYYY-MM-DD`를 쓰도록 단일 스토어 */
export function subscribeLocalCalendarDay(onStoreChange: Listener): () => void {
  listeners.add(onStoreChange);
  ensureWatchers();
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      appSub?.remove();
      appSub = null;
    }
  };
}
