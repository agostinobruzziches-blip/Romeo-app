import { median } from '../dates';

/** Tempo medio per esercizio (secondi), compreso il feedback. */
export function secondsPerItem(recentFirstAttemptMs: number[], fallback: number): number {
  if (recentFirstAttemptMs.length < 10) return fallback;
  const s = median(recentFirstAttemptMs) / 1000 + 6;
  return Math.min(30, Math.max(12, s));
}

/** Oltre questo numero di tabelline una missione diventa noiosa, anche se c'è ancora tempo. */
export const MAX_TABELLINE_ALONE = 30;

/** Numero fisso di esercizi della missione, deciso all'inizio: la barra conta esercizi, non tempo. */
export function missionItemCount(minutes: number, secPerItem: number): number {
  return Math.min(MAX_TABELLINE_ALONE, Math.max(10, Math.round((minutes * 60) / secPerItem)));
}
