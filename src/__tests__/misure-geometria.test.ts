import { beforeEach, describe, expect, it } from 'vitest';
import { fmt, parseNum, sameNumber } from '../core/format';
import { createRng } from '../core/random';
import { ensureInitialized, getSettings } from '../db/repo';
import { useTestDb } from '../db/schema';
import { missionModules } from '../modules/registry';
import { generateEq } from '../modules/misure/generator';
import { convert, stepsBetween } from '../modules/misure/units';
import { misureModule } from '../modules/misure';
import { geometriaModule } from '../modules/geometria';
import { area, generateGeo, perimeter } from '../modules/geometria/shapes';

describe('numeri con la virgola', () => {
  it('formato italiano', () => {
    expect(fmt(2.5)).toBe('2,5');
    expect(fmt(0.75)).toBe('0,75');
    expect(fmt(1250)).toBe('1250');
    expect(parseNum('2,5')).toBe(2.5);
    expect(sameNumber(0.1 + 0.2, 0.3)).toBe(true);
  });
});

describe('equivalenze', () => {
  it('conversioni di base', () => {
    expect(convert('lunghezza', 3, 'm', 'cm')).toBe(300);
    expect(convert('lunghezza', 250, 'cm', 'm')).toBe(2.5);
    expect(convert('lunghezza', 75, 'cm', 'm')).toBe(0.75);
    expect(convert('massa', 2, 'kg', 'g')).toBe(2000);
    expect(convert('capacita', 35, 'dl', 'l')).toBe(3.5);
    expect(stepsBetween('lunghezza', 'km', 'm')).toBe(3);
  });
  it('ogni livello genera esercizi corretti e adatti', () => {
    for (let level = 1; level <= 5; level++) {
      for (let seed = 1; seed <= 300; seed++) {
        const d = generateEq(createRng(seed * 13 + level), level);
        const ctx = `L${level} s${seed} ${d.value} ${d.from}→${d.to}`;
        expect(d.result, ctx).toBe(convert(d.family, d.value, d.from, d.to));
        expect(d.result, ctx).toBeGreaterThan(0);
        expect(d.steps, ctx).not.toBe(0);
        expect(Math.abs(d.steps), ctx).toBeLessThanOrEqual(3);
        // al massimo 3 cifre decimali, nessun numero enorme
        expect(Math.round(d.result * 1000) / 1000, ctx).toBe(d.result);
        expect(d.result, ctx).toBeLessThan(100000);
        if (level === 1) {
          expect(d.family, ctx).toBe('lunghezza');
          expect(d.steps, ctx).toBeGreaterThan(0);
        }
        if (level <= 3) {
          expect(Number.isInteger(d.value) && Number.isInteger(d.result), ctx).toBe(true);
        }
        if (level === 2) expect(d.family, ctx).not.toBe('massa');
      }
    }
  });
  it('dal livello 4 ci sono anche i decimali, in tutte e due le direzioni', () => {
    const list = Array.from({ length: 200 }, (_, i) => generateEq(createRng(i + 1), 4));
    expect(list.some((d) => d.steps > 0 && !Number.isInteger(d.value))).toBe(true);
    expect(list.some((d) => d.steps < 0 && !Number.isInteger(d.result))).toBe(true);
  });
});

describe('geometria', () => {
  it('formule', () => {
    expect(perimeter({ type: 'rettangolo', b: 4, h: 3 })).toBe(14);
    expect(area({ type: 'rettangolo', b: 4, h: 3 })).toBe(12);
    expect(area({ type: 'triangolo', b: 8, h: 6 })).toBe(24);
    expect(area({ type: 'elle', W: 8, H: 6, cw: 3, ch: 2 })).toBe(42);
  });
  it('ogni livello genera figure coerenti, con la formula giusta tra le scelte', () => {
    for (let level = 1; level <= 5; level++) {
      for (let seed = 1; seed <= 300; seed++) {
        const d = generateGeo(createRng(seed * 7 + level), level);
        const ctx = `L${level} s${seed} ${d.shape.type} ${d.ask}`;
        expect(Number.isInteger(d.result) && d.result > 0, ctx).toBe(true);
        expect(new Set(d.formulas).size, ctx).toBe(d.formulas.length);
        expect(d.unitChoices, ctx).toContain(d.resultUnit);
        expect(d.measure, ctx).toBe(d.ask === 'perimetro' || d.ask === 'lato' ? 'contorno' : 'superficie');
        if (level >= 2 && /^[\d()+×:− ]+$/.test(d.formulas[0])) {
          // la prima formula, calcolata, dà proprio il risultato
          const js = d.formulas[0].replace(/×/g, '*').replace(/:/g, '/').replace(/−/g, '-');
          expect(Function(`return ${js}`)(), ctx).toBe(d.result);
        }
        if (d.ask === 'perimetro') expect(d.result, ctx).toBe(perimeter(d.shape));
        if (d.ask === 'area') expect(d.result, ctx).toBe(area(d.shape));
        if (level === 1) {
          expect(d.grid && d.unit === 'quadretti', ctx).toBe(true);
          expect(['rettangolo', 'quadrato'], ctx).toContain(d.shape.type);
        }
        if (level <= 3) expect(['rettangolo', 'quadrato'], ctx).toContain(d.shape.type);
      }
    }
  });
  it('perimetro in unità lineari, area in unità quadrate', () => {
    for (let seed = 1; seed < 100; seed++) {
      const d = generateGeo(createRng(seed), 3);
      if (d.ask === 'area') expect(d.resultUnit.endsWith('²')).toBe(true);
      else expect(d.resultUnit.endsWith('²')).toBe(false);
    }
  });
});

let n = 0;
describe('nella missione', () => {
  beforeEach(async () => {
    useTestDb(`mg-${n++}`);
    await ensureInitialized();
  });
  it('tabelline ogni giorno + un argomento a rotazione', () => {
    const ids = ['tabelline', 'problemi', 'misure', 'geometria'] as const;
    expect(missionModules([...ids], 0).map((m) => m.id)).toEqual(['tabelline', 'problemi']);
    expect(missionModules([...ids], 1).map((m) => m.id)).toEqual(['tabelline', 'misure']);
    expect(missionModules([...ids], 2).map((m) => m.id)).toEqual(['tabelline', 'geometria']);
    expect(missionModules(['tabelline'], 5).map((m) => m.id)).toEqual(['tabelline']);
    expect(missionModules(['geometria'], 5).map((m) => m.id)).toEqual(['geometria']);
  });
  it('la prima volta c’è la lezione “Scopri”, la volta dopo no', async () => {
    const settings = await getSettings();
    const ctx = { settings, today: '2026-11-03', rng: createRng(3) };
    const p1 = await misureModule.plan(ctx, 4);
    expect(p1.items[0].role).toBe('scopri');
    expect(p1.items).toHaveLength(5);
    await misureModule.record(p1.items[0], { firstTry: true, solved: true, wrongAttempts: 0, helpUsed: false, ms: 0 }, '2026-11-03');
    const p2 = await misureModule.plan(ctx, 4);
    expect(p2.items.every((i) => i.role === 'cuore')).toBe(true);
    const g = await geometriaModule.plan(ctx, 4);
    expect(g.items[0].role).toBe('scopri');
  });
});
