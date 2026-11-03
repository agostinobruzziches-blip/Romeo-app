import { daysBetween } from './dates';

/** Fino a 2 giorni di riposo di fila non interrompono la serie. */
export const MAX_REST_DAYS = 2;
export const STREAK_BONUS_AT = [3, 7, 14, 30, 50, 75, 100];

export interface StreakInfo {
  /** Giorni di esplorazione nella serie attuale. */
  current: number;
  /** Primo giorno della serie attuale (identifica la serie per i bonus). */
  startDay: string | null;
  /** Totale dei giorni di esplorazione, da sempre. */
  totalDays: number;
}

/** activeDays: giorni con almeno una missione completata. */
export function computeStreak(activeDays: string[], today: string): StreakInfo {
  const days = [...new Set(activeDays)].sort();
  if (!days.length) return { current: 0, startDay: null, totalDays: 0 };
  const last = days[days.length - 1];
  if (daysBetween(last, today) > MAX_REST_DAYS + 1) {
    return { current: 0, startDay: null, totalDays: days.length };
  }
  let current = 1;
  let startDay = last;
  for (let i = days.length - 2; i >= 0; i--) {
    if (daysBetween(days[i], days[i + 1]) <= MAX_REST_DAYS + 1) {
      current++;
      startDay = days[i];
    } else break;
  }
  return { current, startDay, totalDays: days.length };
}
