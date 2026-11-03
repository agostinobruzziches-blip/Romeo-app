import { beforeEach, describe, expect, it } from 'vitest';
import { createRng } from '../core/random';
import { ensureInitialized, getSettings } from '../db/repo';
import { useTestDb, type Attempt } from '../db/schema';
import { problemiModule } from '../modules/problemi';
import { evaluateLevel } from '../modules/problemi/levels';
import { problemStats } from '../modules/problemi/stats';
import { TEMPLATES, generateProblem, templatesFor } from '../modules/problemi/templates';
import { plainText } from '../modules/problemi/types';

describe('generatore di problemi', () => {
  it('ogni modello, a ogni livello, produce problemi coerenti', () => {
    for (const t of TEMPLATES) {
      for (let level = t.minLevel; level <= 5; level++) {
        for (let seed = 1; seed <= 40; seed++) {
          const p = generateProblem(createRng(seed * 97 + level), level, undefined, t.id);
          const ctx = `${t.id} L${level} s${seed}`;
          const nums = p.segments.filter((s) => 'n' in s) as Array<{ n: number; id: string; important: boolean }>;
          const important = new Set(nums.filter((s) => s.important).map((s) => s.id));
          // i numeri da usare nei calcoli sono quelli importanti del testo (o il risultato di prima)
          const used = new Set(p.steps.flatMap((s) => [s.a.ref, s.b.ref]).filter((r) => r !== 'prev'));
          expect([...used].sort(), ctx).toEqual([...important].sort());
          // nessun numero ripetuto con lo stesso id
          expect(new Set(nums.map((s) => s.id)).size, ctx).toBe(nums.length);
          for (const [i, s] of p.steps.entries()) {
            expect(Number.isInteger(s.result), ctx).toBe(true);
            expect(s.result, ctx).toBeGreaterThan(0);
            if (s.op === ':') expect(s.a.value % s.b.value, ctx).toBe(0);
            if (s.a.ref === 'prev') expect(s.a.value, ctx).toBe(p.steps[i - 1].result);
            if (s.b.ref === 'prev') expect(s.b.value, ctx).toBe(p.steps[i - 1].result);
            const byId = (ref: string) => nums.find((x) => x.id === ref)!.n;
            if (s.a.ref !== 'prev') expect(s.a.value, ctx).toBe(byId(s.a.ref));
            if (s.b.ref !== 'prev') expect(s.b.value, ctx).toBe(byId(s.b.ref));
          }
          expect(p.bars, ctx).toHaveLength(p.steps.length);
          expect(new Set(p.questionChoices).size, ctx).toBe(3);
          expect(plainText(p.segments.filter((s) => s.q)).trim().endsWith('?'), ctx).toBe(true);
        }
      }
    }
  });
  it('livello 1: solo aggiungere e togliere, numeri piccoli, nessun numero inutile', () => {
    expect(new Set(templatesFor(1).map((t) => t.category))).toEqual(new Set(['aggiungere', 'togliere']));
    for (let seed = 1; seed < 100; seed++) {
      const p = generateProblem(createRng(seed), 1);
      expect(p.segments.some((s) => 'n' in s && !s.important)).toBe(false);
      expect(p.steps[0].result).toBeLessThanOrEqual(20);
    }
  });
  it('dal livello 3 compare a volte un numero che non serve', () => {
    let found = false;
    for (let seed = 1; seed < 50 && !found; seed++) {
      const p = generateProblem(createRng(seed), 3);
      found = p.segments.some((s) => 'n' in s && !s.important);
    }
    expect(found).toBe(true);
  });
});

describe('livelli', () => {
  const base = { category: 'generale', level: 1 as const, goodSessions: 0 };
  it('si sale con 2 missioni buone di fila, mai si scende', () => {
    const r1 = evaluateLevel(base, [{ clean: true }, { clean: true }]);
    expect(r1.up).toBe(false);
    const r2 = evaluateLevel(r1.progress, [{ clean: true }, { clean: true }, { clean: true }]);
    expect(r2.up).toBe(true);
    expect(r2.progress.level).toBe(2);
    const r3 = evaluateLevel({ ...base, level: 3, goodSessions: 1 }, [{ clean: false }, { clean: false }]);
    expect(r3.progress.level).toBe(3);
    expect(r3.progress.goodSessions).toBe(0);
  });
  it('con un solo problema la missione non conta', () => {
    expect(evaluateLevel(base, [{ clean: true }]).progress).toEqual(base);
  });
});

describe('statistiche: operazione sbagliata e calcolo sbagliato sono distinti', () => {
  const a = (over: Partial<Attempt>): Attempt => ({
    sessionId: 's', moduleId: 'problemi', itemKey: 'gru-casse', itemIndex: 1, role: 'cuore', format: 'problema',
    category: 'gruppi-uguali', attemptNo: 1, correct: true, ms: 1000, at: 0, ...over,
  });
  it('conta per categoria', () => {
    const stats = problemStats([
      a({ format: 'problema:operazione', correct: false, errorType: 'operazione' }),
      a({ format: 'problema:operazione', correct: true }),
      a({ format: 'problema', correct: false, errorType: 'calcolo' }),
      a({ format: 'problema', correct: true }),
      a({ itemIndex: 2, format: 'problema', correct: true }),
    ]);
    expect(stats).toHaveLength(1);
    expect(stats[0]).toMatchObject({ problems: 2, operazione: 1, calcolo: 1, clean: 1, unsolved: 0 });
  });
});

let n = 0;
describe('modulo nella missione', () => {
  beforeEach(async () => {
    useTestDb(`prob-${n++}`);
    await ensureInitialized();
  });
  it('pianifica problemi di livello 1, senza due categorie uguali di fila', async () => {
    const settings = await getSettings();
    const plan = await problemiModule.plan({ settings, today: '2026-11-03', rng: createRng(5) }, 4);
    expect(plan.items).toHaveLength(4);
    expect(plan.focusLabel).toBe('4 problemi');
    for (let i = 1; i < 4; i++) expect(plan.items[i].category).not.toBe(plan.items[i - 1].category);
    expect(plan.items.every((i) => i.data.level === 1)).toBe(true);
  });
});
