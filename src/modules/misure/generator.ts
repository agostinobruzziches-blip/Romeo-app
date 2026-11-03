import { pick, randInt, type Rng } from '../../core/random';
import { COMMON, UNITS, convert, stepsBetween, unitIndex, type Family } from './units';

export interface EqData {
  family: Family;
  from: string;
  to: string;
  value: number;
  result: number;
  /** Positivo: verso un'unità più piccola (× 10, 100…). Negativo: verso una più grande (: 10…). */
  steps: number;
  level: number;
  decimal: boolean;
}

export const MAX_MIS_LEVEL = 5;
export const MIS_LEVEL_NAMES: Record<number, string> = {
  1: 'Lunghezze, dall’unità più grande alla più piccola (3 m = 300 cm)',
  2: 'Anche al contrario (500 cm = 5 m), e le capacità',
  3: 'Anche i pesi, fino a 3 passi (2 kg = 2000 g)',
  4: 'Con i numeri decimali (2,5 m = 250 cm; 75 cm = 0,75 m)',
  5: 'Tutte le unità, decimali in tutte e due le direzioni',
};

function families(level: number): Family[] {
  return level <= 1 ? ['lunghezza'] : level === 2 ? ['lunghezza', 'capacita'] : ['lunghezza', 'capacita', 'massa'];
}

function pickPair(rng: Rng, f: Family, level: number, maxSteps: number): [string, string] {
  const pool = level >= 5 ? UNITS[f].map((u) => u.sym) : COMMON[f];
  for (let i = 0; i < 50; i++) {
    const a = pick(rng, pool);
    const b = pick(rng, pool);
    const s = Math.abs(stepsBetween(f, a, b));
    if (a !== b && s >= 1 && s <= maxSteps) return [a, b];
  }
  return f === 'massa' ? ['kg', 'g'] : f === 'capacita' ? ['l', 'cl'] : ['m', 'cm'];
}

export function generateEq(rng: Rng, level: number): EqData {
  const f = pick(rng, families(level));
  const maxSteps = level <= 2 ? 2 : 3;
  let [a, b] = pickPair(rng, f, level, maxSteps);
  // livello 1: sempre verso l'unità più piccola
  if (level <= 1 && unitIndex(f, a) > unitIndex(f, b)) [a, b] = [b, a];
  const steps = stepsBetween(f, a, b);
  let value: number;
  const decimal = level >= 4 && rng() < 0.6;
  if (steps > 0) {
    // verso l'unità più piccola: il numero diventa più grande
    value = decimal ? randInt(rng, 11, 99) / 10 : randInt(rng, 2, steps === 1 ? 20 : 9);
    if (decimal && level >= 5 && rng() < 0.4) value = randInt(rng, 1, 9) / 10; // 0,8 km
  } else {
    const k = 10 ** -steps;
    if (decimal) {
      // risultato decimale: 35 dl = 3,5 l; 250 cm = 2,5 m; 75 cm = 0,75 m
      const unit = k >= 100 && rng() < 0.5 ? k / 100 : k / 10;
      value = randInt(rng, 11, 99) * unit;
      if (value % k === 0) value += unit;
    } else value = randInt(rng, 2, 9) * k;
  }
  const result = convert(f, value, a, b);
  return { family: f, from: a, to: b, value, result, steps, level, decimal: !Number.isInteger(result) || !Number.isInteger(value) };
}

/** Le scelte del passo "quale operazione". */
export const OP_CHOICES = [1, 2, 3, -1, -2, -3] as const;
export function opLabel(steps: number): string {
  return steps > 0 ? `× ${10 ** steps}` : `: ${10 ** -steps}`;
}
