import type { Stage, TableProgress } from '../../db/schema';

/** Ordine di introduzione: dalle più facili; 8 e 7 alla fine. */
export const INTRO_ORDER = [2, 10, 5, 3, 4, 9, 6, 8, 7];

export const STAGE_NAMES: Record<Stage, string> = {
  1: 'in ordine',
  2: 'mescolata',
  3: 'con un’altra tabellina',
  4: 'mix generale',
};

/**
 * Regole di avanzamento (pensate per non annoiare chi le tabelline le sa già):
 * - ≥ 85% di giuste al primo colpo in una missione → tappa successiva SUBITO
 * - ≥ 95% su almeno 8 domande → si saltano due tappe
 * - tra 75% e 85% per 2 missioni → si avanza lo stesso (non si resta bloccati)
 */
export const ADVANCE_ACCURACY = 0.85;
export const JUMP_ACCURACY = 0.95;
export const JUMP_MIN_ITEMS = 8;
export const NEAR_ACCURACY = 0.75;
export const NEAR_SESSIONS = 2;
export const MIN_ITEMS_FOR_STAGE = 6;

export function isConquered(p: TableProgress | undefined): boolean {
  return !!p?.conqueredAt;
}

/** La tabellina su cui si lavora adesso: la prima non conquistata nell'ordine di introduzione. */
export function focusTable(active: number[], progress: Map<number, TableProgress>): number | null {
  for (const t of INTRO_ORDER) {
    if (!active.includes(t)) continue;
    if (!isConquered(progress.get(t))) return t;
  }
  return null;
}

/** Tabellina compagna per la tappa 3: l'ultima conquistata, altrimenti la successiva in ordine. */
export function partnerTable(focus: number, active: number[], progress: Map<number, TableProgress>): number {
  const conquered = [...progress.values()]
    .filter((p) => p.conqueredAt && p.table !== focus && active.includes(p.table))
    .sort((a, b) => (b.conqueredAt ?? 0) - (a.conqueredAt ?? 0));
  if (conquered.length) return conquered[0].table;
  const others = INTRO_ORDER.filter((t) => t !== focus && active.includes(t));
  const idx = INTRO_ORDER.indexOf(focus);
  return others.find((t) => INTRO_ORDER.indexOf(t) > idx) ?? others[0] ?? (focus === 2 ? 10 : 2);
}

export interface StageResult {
  progress: TableProgress;
  advanced: boolean;
  /** Tappe guadagnate in questa missione (0, 1 o 2). */
  steps: number;
  conquered: boolean;
  counted: boolean;
}

function advance(p: TableProgress, steps: number, now: number): StageResult {
  const target = p.stage + steps;
  if (target > 4) {
    return { progress: { ...p, stage: 4, goodSessionsAtStage: 0, conqueredAt: now }, advanced: true, steps, conquered: true, counted: true };
  }
  return { progress: { ...p, stage: target as Stage, goodSessionsAtStage: 0 }, advanced: true, steps, conquered: false, counted: true };
}

/**
 * Esito di una missione sulla tappa: conta se ci sono almeno 6 domande della tappa. Non si torna mai indietro.
 */
export function evaluateStage(p: TableProgress, firstTryCorrect: number, total: number, now: number): StageResult {
  const none: StageResult = { progress: p, advanced: false, steps: 0, conquered: false, counted: false };
  if (total < MIN_ITEMS_FOR_STAGE || p.conqueredAt) return none;
  const ratio = firstTryCorrect / total;
  if (ratio >= JUMP_ACCURACY && total >= JUMP_MIN_ITEMS) return advance(p, 2, now);
  if (ratio >= ADVANCE_ACCURACY) return advance(p, 1, now);
  if (ratio >= NEAR_ACCURACY) {
    const near = p.goodSessionsAtStage + 1;
    if (near >= NEAR_SESSIONS) return advance(p, 1, now);
    return { ...none, progress: { ...p, goodSessionsAtStage: near }, counted: true };
  }
  return { ...none, progress: { ...p, goodSessionsAtStage: 0 }, counted: true };
}
