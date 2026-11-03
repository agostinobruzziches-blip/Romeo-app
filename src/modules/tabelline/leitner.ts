import { addDays } from '../../core/dates';
import type { Box, Fact } from '../../db/schema';

/** Dopo quanti giorni si ripropone un fatto, per livello (0 = stessa missione / oggi). */
export const INTERVAL_DAYS: Record<Box, number> = { 0: 0, 1: 1, 2: 2, 3: 4, 4: 7, 5: 14 };

export const SECURE_BOX: Box = 3;
export const CONQUERED_BOX: Box = 5;

export function factKey(a: number, b: number): string {
  return a <= b ? `${a}x${b}` : `${b}x${a}`;
}

export function newFact(a: number, b: number, today: string): Fact {
  const [x, y] = a <= b ? [a, b] : [b, a];
  return {
    key: factKey(x, y),
    a: x,
    b: y,
    box: 0,
    dueDay: today,
    seen: 0,
    firstTry: 0,
    afterRetry: 0,
    wrong: 0,
    helpUsed: 0,
    medianMs: 0,
    lastSeenAt: 0,
    lastPromotedDay: '',
    everSecure: false,
  };
}

/** Tutti i 55 fatti da 1×1 a 10×10 (con 7×8 = 8×7). */
export function allFactPairs(): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let a = 1; a <= 10; a++) for (let b = a; b <= 10; b++) out.push([a, b]);
  return out;
}

export interface FactOutcome {
  /** Giusta al primo tentativo. */
  firstTry: boolean;
  /** Alla fine è arrivato alla risposta giusta (anche dopo errori). */
  solved: boolean;
  wrongAttempts: number;
  helpUsed: boolean;
  ms: number;
}

const clampBox = (n: number): Box => Math.max(0, Math.min(5, n)) as Box;

/**
 * Regole Leitner:
 * - giusta al primo colpo senza aiuto → +1 (al massimo una volta al giorno)
 * - giusta dopo un errore → resta allo stesso livello
 * - con aiuto o non risolta → −1 (mai sotto 0)
 */
export function applyOutcome(fact: Fact, o: FactOutcome, today: string, now: number): Fact {
  let box = fact.box;
  let lastPromotedDay = fact.lastPromotedDay;
  if (o.firstTry && !o.helpUsed) {
    if (fact.lastPromotedDay !== today) {
      box = clampBox(box + 1);
      lastPromotedDay = today;
    }
  } else if (o.helpUsed || !o.solved) {
    box = clampBox(box - 1);
  }
  const seen = fact.seen + 1;
  const medianMs = fact.medianMs === 0 ? o.ms : Math.round(fact.medianMs * 0.7 + o.ms * 0.3);
  return {
    ...fact,
    box,
    lastPromotedDay,
    dueDay: addDays(today, INTERVAL_DAYS[box]),
    seen,
    firstTry: fact.firstTry + (o.firstTry ? 1 : 0),
    afterRetry: fact.afterRetry + (!o.firstTry && o.solved ? 1 : 0),
    wrong: fact.wrong + o.wrongAttempts,
    helpUsed: fact.helpUsed + (o.helpUsed ? 1 : 0),
    medianMs,
    lastSeenAt: now,
    everSecure: fact.everSecure || box >= SECURE_BOX,
  };
}
