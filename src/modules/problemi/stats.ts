import type { Attempt } from '../../db/schema';
import type { ProblemCategory } from './types';

export interface CategoryStats {
  category: ProblemCategory;
  problems: number;
  clean: number;
  operazione: number;
  dati: number;
  domanda: number;
  calcolo: number;
  unsolved: number;
}

/** Raggruppa i tentativi dei problemi per esercizio, poi per categoria. */
export function problemStats(attempts: Attempt[]): CategoryStats[] {
  const byItem = new Map<string, Attempt[]>();
  for (const a of attempts) {
    if (a.moduleId !== 'problemi') continue;
    const k = `${a.sessionId}#${a.itemIndex}#${a.itemKey}`;
    byItem.set(k, [...(byItem.get(k) ?? []), a]);
  }
  const out = new Map<string, CategoryStats>();
  for (const list of byItem.values()) {
    const cat = (list[0].category ?? 'aggiungere') as ProblemCategory;
    const s =
      out.get(cat) ??
      { category: cat, problems: 0, clean: 0, operazione: 0, dati: 0, domanda: 0, calcolo: 0, unsolved: 0 };
    s.problems++;
    const errs = list.filter((a) => !a.correct);
    for (const e of errs) {
      if (e.errorType === 'operazione') s.operazione++;
      else if (e.errorType === 'dati') s.dati++;
      else if (e.errorType === 'domanda') s.domanda++;
      else if (e.errorType === 'calcolo') s.calcolo++;
    }
    const solved = list.some((a) => a.format === 'problema' && a.correct);
    if (!solved) s.unsolved++;
    if (solved && !errs.some((e) => e.errorType !== 'calcolo')) s.clean++;
    out.set(cat, s);
  }
  return [...out.values()].sort((a, b) => b.problems - a.problems);
}

export function itemResults(attempts: Attempt[]): Array<{ clean: boolean }> {
  return problemStats(attempts).flatMap((c) => [
    ...Array.from({ length: c.clean }, () => ({ clean: true })),
    ...Array.from({ length: c.problems - c.clean }, () => ({ clean: false })),
  ]);
}
