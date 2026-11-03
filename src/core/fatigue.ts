import type { FatigueSignal } from '../db/schema';
import { median } from './dates';

/** Il primo tentativo di ogni esercizio, in ordine. */
export interface ItemTrace {
  itemIndex: number;
  firstCorrect: boolean;
  firstMs: number;
}

export interface AttemptTrace {
  correct: boolean;
  ms: number;
}

export const FAST_MS = 1500;
export const MIN_ITEMS_BEFORE_OFFER = 5;

/**
 * Segnali di stanchezza:
 * - errori ravvicinati: almeno 3 errori al primo colpo negli ultimi 5 esercizi
 * - risposte a caso: le ultime 2 risposte sbagliate e molto rapide
 * - rallentamento: tempi recenti più del doppio rispetto all'inizio della missione
 */
export function detectFatigue(
  items: ItemTrace[],
  recentAttempts: AttemptTrace[],
  baselineMs: number,
  now: number,
): FatigueSignal[] {
  const signals: FatigueSignal[] = [];
  const itemIndex = items.length ? items[items.length - 1].itemIndex : 0;

  const last5 = items.slice(-5);
  if (last5.length === 5 && last5.filter((i) => !i.firstCorrect).length >= 3) {
    signals.push({ kind: 'errori-ravvicinati', at: now, itemIndex });
  }

  const fast = Math.max(FAST_MS, baselineMs > 0 ? baselineMs * 0.5 : 0);
  const last2 = recentAttempts.slice(-2);
  if (last2.length === 2 && last2.every((a) => !a.correct && a.ms < fast)) {
    signals.push({ kind: 'risposte-a-caso', at: now, itemIndex });
  }

  if (items.length >= 10) {
    const start = median(items.slice(0, 5).map((i) => i.firstMs));
    const recent = median(items.slice(-5).map((i) => i.firstMs));
    if (start > 0 && recent > start * 2 && recent > 6000) {
      signals.push({ kind: 'rallentamento', at: now, itemIndex });
    }
  }
  return signals;
}

export const FATIGUE_LABELS: Record<FatigueSignal['kind'], string> = {
  'errori-ravvicinati': 'errori ravvicinati',
  'risposte-a-caso': 'risposte rapide e casuali',
  rallentamento: 'forte rallentamento',
};
