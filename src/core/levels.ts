import { db, type Attempt, type ModuleId, type ProblemProgress } from '../db/schema';

/** Avanzamento di un modulo a livelli (problemi, misure, geometria), salvato nella tabella problemProgress. */
export async function getLevel(key: string): Promise<ProblemProgress> {
  return (await db.problemProgress.get(key)) ?? { category: key, level: 1, goodSessions: 0 };
}

export async function setLevel(key: string, level: number): Promise<void> {
  await db.problemProgress.put({ category: key, level: level as ProblemProgress['level'], goodSessions: 0 });
}

/**
 * Esito di ogni esercizio di un modulo a più passi in una sessione:
 * "pulito" = risolto senza errori di ragionamento (sono ammessi solo errori di calcolo).
 */
export function cleanItems(attempts: Attempt[], moduleId: ModuleId, finalFormat: string): Array<{ clean: boolean }> {
  const by = new Map<string, Attempt[]>();
  for (const a of attempts) {
    if (a.moduleId !== moduleId || a.format === 'lezione') continue;
    const k = `${a.sessionId}#${a.itemIndex}#${a.itemKey}`;
    by.set(k, [...(by.get(k) ?? []), a]);
  }
  return [...by.values()].map((list) => ({
    clean:
      list.some((a) => a.format === finalFormat && a.correct) &&
      !list.some((a) => !a.correct && a.errorType !== 'calcolo'),
  }));
}

/**
 * Si sale di livello quando in 2 missioni di fila almeno l'80% degli esercizi è "pulito". Non si scende mai.
 * Servono almeno `minItems` esercizi perché la missione conti.
 */
export function evaluateLevel(
  p: ProblemProgress,
  items: Array<{ clean: boolean }>,
  max = 5,
  minItems = 2,
): { progress: ProblemProgress; up: boolean } {
  if (items.length < minItems) return { progress: p, up: false };
  const ratio = items.filter((i) => i.clean).length / items.length;
  if (ratio < 0.5) return { progress: { ...p, goodSessions: 0 }, up: false };
  if (ratio < 0.8) return { progress: p, up: false };
  const good = p.goodSessions + 1;
  if (good >= 2 && p.level < max) {
    return { progress: { ...p, level: (p.level + 1) as ProblemProgress['level'], goodSessions: 0 }, up: true };
  }
  return { progress: { ...p, goodSessions: Math.min(good, 2) }, up: false };
}

/** Conteggio degli errori per tipo, per i pannelli dei genitori. */
export function errorCounts(attempts: Attempt[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of attempts) if (!a.correct && a.errorType) out[a.errorType] = (out[a.errorType] ?? 0) + 1;
  return out;
}
