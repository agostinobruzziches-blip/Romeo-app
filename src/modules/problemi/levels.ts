import type { ProblemProgress } from '../../db/schema';

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Aggiungere e togliere, numeri piccoli',
  2: 'Anche gruppi uguali e ripartizione',
  3: 'Anche confronto e contenenza, con un numero che non serve',
  4: 'Anche due passaggi e frazioni di una quantità',
  5: 'Numeri più grandi e soldi',
};
export const MAX_LEVEL = 5;
export const PROGRESS_KEY = 'generale';

export interface ProblemItemResult {
  /** Nessun errore di operazione, dati o domanda e risposta giusta. */
  clean: boolean;
}

/**
 * Si sale di livello quando in 2 missioni di fila almeno l'80% dei problemi è stato risolto
 * senza sbagliare operazione, dati o domanda. Non si scende mai.
 */
export function evaluateLevel(p: ProblemProgress, items: ProblemItemResult[]): { progress: ProblemProgress; up: boolean } {
  if (items.length < 2) return { progress: p, up: false };
  const ratio = items.filter((i) => i.clean).length / items.length;
  if (ratio < 0.5) return { progress: { ...p, goodSessions: 0 }, up: false };
  if (ratio < 0.8) return { progress: p, up: false };
  const good = p.goodSessions + 1;
  if (good >= 2 && p.level < MAX_LEVEL) {
    return { progress: { ...p, level: (p.level + 1) as ProblemProgress['level'], goodSessions: 0 }, up: true };
  }
  return { progress: { ...p, goodSessions: Math.min(good, 2) }, up: false };
}
