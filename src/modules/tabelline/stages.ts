import type { Stage, TableProgress } from '../../db/schema';

/** Ordine di introduzione: dalle più facili; 8 e 7 alla fine. */
export const INTRO_ORDER = [2, 10, 5, 3, 4, 9, 6, 8, 7];

export const STAGE_NAMES: Record<Stage, string> = {
  1: 'in ordine',
  2: 'mescolata',
  3: 'con un’altra tabellina',
  4: 'mix generale',
};

export const ADVANCE_ACCURACY = 0.9;
export const ADVANCE_SESSIONS = 2;
export const MIN_ITEMS_FOR_STAGE = 10;

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
  conquered: boolean;
  counted: boolean;
}

/**
 * Esito di una sessione sulla tappa: conta solo se ci sono almeno 10 domande della tappa.
 * Con ≥ 90% di giuste al primo colpo per 2 sessioni consecutive si passa alla tappa dopo.
 * Non si torna mai indietro.
 */
export function evaluateStage(p: TableProgress, firstTryCorrect: number, total: number, now: number): StageResult {
  if (total < MIN_ITEMS_FOR_STAGE || p.conqueredAt) {
    return { progress: p, advanced: false, conquered: false, counted: false };
  }
  const good = firstTryCorrect / total >= ADVANCE_ACCURACY;
  if (!good) {
    return { progress: { ...p, goodSessionsAtStage: 0 }, advanced: false, conquered: false, counted: true };
  }
  const goodSessions = p.goodSessionsAtStage + 1;
  if (goodSessions < ADVANCE_SESSIONS) {
    return { progress: { ...p, goodSessionsAtStage: goodSessions }, advanced: false, conquered: false, counted: true };
  }
  if (p.stage === 4) {
    return {
      progress: { ...p, goodSessionsAtStage: 0, conqueredAt: now },
      advanced: true,
      conquered: true,
      counted: true,
    };
  }
  return {
    progress: { ...p, stage: (p.stage + 1) as Stage, goodSessionsAtStage: 0 },
    advanced: true,
    conquered: false,
    counted: true,
  };
}
