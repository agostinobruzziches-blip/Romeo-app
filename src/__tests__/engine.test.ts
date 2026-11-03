import { describe, expect, it } from 'vitest';
import { addDays, daysBetween } from '../core/dates';
import { detectFatigue } from '../core/fatigue';
import { requeue, shorten } from '../core/mission/queue';
import { missionItemCount } from '../core/mission/size';
import { createRng } from '../core/random';
import { computeStreak } from '../core/streak';
import type { Fact, TableProgress } from '../db/schema';
import { makeItem, planTabelline } from '../modules/tabelline/generator';
import { neighborHint } from '../modules/tabelline/hints';
import { allFactPairs, applyOutcome, factKey, newFact } from '../modules/tabelline/leitner';
import { evaluateStage, focusTable, INTRO_ORDER } from '../modules/tabelline/stages';

const TODAY = '2026-11-03';
const ok = { firstTry: true, solved: true, wrongAttempts: 0, helpUsed: false, ms: 3000 };

function factsMap(patch: (f: Fact) => Fact = (f) => f) {
  return new Map(allFactPairs().map(([a, b]) => { const f = patch(newFact(a, b, TODAY)); return [f.key, f]; }));
}
function progressMap(over: Partial<Record<number, Partial<TableProgress>>> = {}) {
  return new Map(INTRO_ORDER.map((t) => [t, { table: t, stage: 1, goodSessionsAtStage: 0, ...over[t] } as TableProgress]));
}

describe('fatti e Leitner', () => {
  it('7×8 e 8×7 sono lo stesso fatto; ci sono 55 fatti', () => {
    expect(factKey(8, 7)).toBe('7x8');
    expect(allFactPairs()).toHaveLength(55);
  });
  it('giusta al primo colpo sale di 1, ma una sola volta al giorno', () => {
    let f = newFact(7, 8, TODAY);
    f = applyOutcome(f, ok, TODAY, 1);
    expect(f.box).toBe(1);
    expect(f.dueDay).toBe(addDays(TODAY, 1));
    f = applyOutcome(f, ok, TODAY, 2);
    expect(f.box).toBe(1);
    f = applyOutcome(f, ok, addDays(TODAY, 1), 3);
    expect(f.box).toBe(2);
  });
  it('tenacia: resta allo stesso livello; con aiuto scende, mai sotto 0', () => {
    let f: Fact = { ...newFact(7, 8, TODAY), box: 3 };
    f = applyOutcome(f, { ...ok, firstTry: false, wrongAttempts: 1 }, TODAY, 1);
    expect(f.box).toBe(3);
    expect(f.afterRetry).toBe(1);
    f = applyOutcome(f, { ...ok, firstTry: false, helpUsed: true }, TODAY, 2);
    expect(f.box).toBe(2);
    const z = applyOutcome(newFact(2, 2, TODAY), { ...ok, firstTry: false, solved: false, wrongAttempts: 3 }, TODAY, 3);
    expect(z.box).toBe(0);
    expect(z.dueDay).toBe(TODAY);
  });
});

describe('tappe', () => {
  it('si avanza con il 90% in 2 sessioni consecutive', () => {
    const p: TableProgress = { table: 7, stage: 1, goodSessionsAtStage: 0 };
    const r1 = evaluateStage(p, 19, 20, 1);
    expect(r1.advanced).toBe(false);
    expect(r1.progress.goodSessionsAtStage).toBe(1);
    const r2 = evaluateStage(r1.progress, 9, 10, 2);
    expect(r2.advanced).toBe(true);
    expect(r2.progress.stage).toBe(2);
  });
  it('una sessione sotto il 90% azzera il conteggio ma non fa tornare indietro', () => {
    const r = evaluateStage({ table: 7, stage: 3, goodSessionsAtStage: 1 }, 7, 10, 1);
    expect(r.progress.stage).toBe(3);
    expect(r.progress.goodSessionsAtStage).toBe(0);
  });
  it('sotto le 10 domande la sessione non conta', () => {
    expect(evaluateStage({ table: 7, stage: 1, goodSessionsAtStage: 1 }, 5, 5, 1).counted).toBe(false);
  });
  it('dopo la tappa 4 la tabellina è conquistata', () => {
    const r = evaluateStage({ table: 7, stage: 4, goodSessionsAtStage: 1 }, 10, 10, 99);
    expect(r.conquered).toBe(true);
    expect(r.progress.conqueredAt).toBe(99);
  });
  it('la tabellina attiva è la prima non conquistata in ordine', () => {
    expect(focusTable([2, 3, 7], progressMap({ 2: { conqueredAt: 1 } }))).toBe(3);
  });
});

describe('generatore della missione', () => {
  it('tappa 1: la tabellina in ordine, con riscaldamento e chiusura', () => {
    const plan = planTabelline({ facts: factsMap(), progress: progressMap(), activeTables: [2, 3, 4, 5, 6, 7, 8, 9, 10], today: TODAY, rng: createRng(1), count: 24 });
    expect(plan.items).toHaveLength(24);
    expect(plan.focus).toBe(2);
    expect(plan.items.slice(0, 3).every((i) => i.role === 'riscaldamento')).toBe(true);
    expect(plan.items[23].role).toBe('chiusura');
    const core = plan.items.filter((i) => i.role === 'cuore');
    expect(core.slice(0, 10).map((i) => i.data.y)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(core.every((i) => i.format === 'prodotto' && i.data.x === 2)).toBe(true);
  });
  it('tappa 2: stessa tabellina mescolata, mai due domande uguali di fila', () => {
    const plan = planTabelline({ facts: factsMap(), progress: progressMap({ 2: { stage: 2 } }), activeTables: [2], today: TODAY, rng: createRng(7), count: 20 });
    const core = plan.items.filter((i) => i.role === 'cuore');
    expect(core.every((i) => i.data.x === 2)).toBe(true);
    expect(core.slice(0, 10).map((i) => i.data.y)).not.toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (let i = 1; i < core.length; i++) expect(core[i].key).not.toBe(core[i - 1].key);
  });
  it('tappa 3: due tabelline mescolate', () => {
    const plan = planTabelline({ facts: factsMap(), progress: progressMap({ 2: { conqueredAt: 5 }, 10: { stage: 3 } }), activeTables: [2, 10], today: TODAY, rng: createRng(3), count: 30 });
    const tables = new Set(plan.items.filter((i) => i.role === 'cuore').map((i) => i.data.x));
    expect(plan.focus).toBe(10);
    expect([...tables].sort()).toEqual([10, 2]);
  });
  it('il ripasso usa i fatti scaduti di altre tabelline', () => {
    const facts = factsMap((f) => (f.a === 3 || f.b === 3 ? { ...f, seen: 2, box: 1, dueDay: addDays(TODAY, -1) } : f));
    const plan = planTabelline({ facts, progress: progressMap(), activeTables: [2, 3], today: TODAY, rng: createRng(4), count: 24 });
    const review = plan.items.filter((i) => i.role === 'ripasso');
    expect(review.length).toBeGreaterThan(0);
    expect(review.every((i) => i.data.x === 3 || i.data.y === 3)).toBe(true);
  });
  it('vero/falso: il risultato proposto sbagliato è sempre diverso e positivo', () => {
    const rng = createRng(9);
    for (let i = 0; i < 200; i++) {
      const it = makeItem('cuore', 7, 8, 'vero-falso', rng);
      expect(it.data.shown).toBeGreaterThan(0);
    }
  });
});

describe('aiuti', () => {
  it('il fatto vicino non dice il risultato', () => {
    expect(neighborHint(7, 8)).toContain('7 × 7');
    expect(neighborHint(7, 8)).not.toContain('56');
    expect(neighborHint(10, 7)).toContain('zero');
  });
});

describe('missione', () => {
  it('numero di esercizi fisso, tra 10 e 40', () => {
    expect(missionItemCount(9, 20)).toBe(27);
    expect(missionItemCount(1, 20)).toBe(10);
  });
  const q = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ uid: `${i}`, moduleId: 'tabelline' as const, role: (i === n - 1 ? 'chiusura' : 'cuore') as 'cuore', key: `k${i}`, format: 'prodotto', data: {} }));
  it('riproporre un esercizio non cambia il totale e non tocca la chiusura', () => {
    const out = requeue(q(10), 2, { ...q(1)[0], key: 'x', uid: 'r' })!;
    expect(out).toHaveLength(10);
    expect(out[6].key).toBe('x');
    expect(out[9].role).toBe('chiusura');
    expect(requeue(q(10), 7, { ...q(1)[0], key: 'x' })).toBeNull();
  });
  it('"Ancora un po\'" lascia al massimo 3 esercizi, l\'ultimo facile', () => {
    const out = shorten(q(20), 5, 3);
    expect(out).toHaveLength(9);
    expect(out[8].role).toBe('chiusura');
  });
});

describe('stanchezza', () => {
  const items = (pattern: boolean[]) => pattern.map((c, i) => ({ itemIndex: i, firstCorrect: c, firstMs: 3000 }));
  it('3 errori nelle ultime 5', () => {
    expect(detectFatigue(items([true, false, true, false, false]), [], 3000, 0).map((s) => s.kind)).toContain('errori-ravvicinati');
    expect(detectFatigue(items([true, false, true, true, false]), [], 3000, 0)).toHaveLength(0);
  });
  it('risposte sbagliate troppo rapide', () => {
    const s = detectFatigue(items([true]), [{ correct: false, ms: 700 }, { correct: false, ms: 900 }], 3000, 0);
    expect(s.map((x) => x.kind)).toContain('risposte-a-caso');
  });
  it('rallentamento forte', () => {
    const tr = [...Array(5)].map((_, i) => ({ itemIndex: i, firstCorrect: true, firstMs: 3000 }))
      .concat([...Array(5)].map((_, i) => ({ itemIndex: i + 5, firstCorrect: true, firstMs: 9000 })));
    expect(detectFatigue(tr, [], 3000, 0).map((x) => x.kind)).toContain('rallentamento');
  });
});

describe('serie di giorni', () => {
  it('fino a 2 giorni di riposo non interrompono la serie', () => {
    const days = [TODAY, addDays(TODAY, -2), addDays(TODAY, -5), addDays(TODAY, -6)];
    expect(computeStreak(days, TODAY).current).toBe(4);
  });
  it('3 giorni di pausa fanno ripartire la serie, ma il totale resta', () => {
    const days = [TODAY, addDays(TODAY, -4)];
    const s = computeStreak(days, TODAY);
    expect(s.current).toBe(1);
    expect(s.totalDays).toBe(2);
  });
  it('daysBetween', () => expect(daysBetween('2026-10-30', '2026-11-03')).toBe(4));
});
