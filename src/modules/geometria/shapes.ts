import { pick, randInt, shuffle, type Rng } from '../../core/random';

export type Shape =
  | { type: 'rettangolo'; b: number; h: number }
  | { type: 'quadrato'; l: number }
  | { type: 'triangolo'; b: number; h: number }
  /** Rettangolo W×H a cui manca l'angolo in alto a destra (cw×ch): una figura a L. */
  | { type: 'elle'; W: number; H: number; cw: number; ch: number };

export type Ask = 'perimetro' | 'area' | 'lato' | 'altezza';
export type Measure = 'contorno' | 'superficie';

export interface GeoData {
  level: number;
  shape: Shape;
  ask: Ask;
  grid: boolean;
  unit: 'quadretti' | 'cm' | 'm';
  /** Dato noto nei problemi "al contrario" (perimetro o area). */
  given?: number;
  question: string;
  /** Cosa rappresenta il numero principale: il contorno o la superficie. */
  measure: Measure;
  /** Scelte del passo "come si calcola": la prima è giusta (vengono mescolate). */
  formulas: string[];
  result: number;
  resultUnit: string;
  unitChoices: string[];
}

export const MAX_GEO_LEVEL = 5;
export const GEO_LEVEL_NAMES: Record<number, string> = {
  1: 'Perimetro e area sui quadretti, contando',
  2: 'Rettangoli sui quadretti con le misure: le formule',
  3: 'Rettangoli e quadrati senza quadretti, in cm e m',
  4: 'Anche l’area del triangolo e il lato del quadrato dal perimetro',
  5: 'Anche figure a L (composte) e l’altezza dall’area',
};

export const SHAPE_NAME: Record<Shape['type'], string> = {
  rettangolo: 'rettangolo',
  quadrato: 'quadrato',
  triangolo: 'triangolo',
  elle: 'figura',
};

const sq = (u: string) => (u === 'quadretti' ? 'quadretti' : `${u}²`);
const lin = (u: string) => (u === 'quadretti' ? 'lati di quadretto' : u);

export function perimeter(s: Shape): number {
  switch (s.type) {
    case 'rettangolo':
      return (s.b + s.h) * 2;
    case 'quadrato':
      return s.l * 4;
    case 'elle':
      return (s.W + s.H) * 2;
    case 'triangolo':
      return NaN;
  }
}

export function area(s: Shape): number {
  switch (s.type) {
    case 'rettangolo':
      return s.b * s.h;
    case 'quadrato':
      return s.l * s.l;
    case 'triangolo':
      return (s.b * s.h) / 2;
    case 'elle':
      return s.W * s.H - s.cw * s.ch;
  }
}

function base(level: number, shape: Shape, ask: Ask, unit: GeoData['unit'], grid: boolean): Omit<GeoData, 'formulas' | 'question'> {
  const measure: Measure = ask === 'perimetro' || ask === 'lato' ? 'contorno' : 'superficie';
  const lengthAnswer = ask === 'perimetro' || ask === 'lato' || ask === 'altezza';
  return {
    level,
    shape,
    ask,
    grid,
    unit,
    measure,
    result: 0,
    resultUnit: lengthAnswer ? lin(unit) : sq(unit),
    unitChoices: [lin(unit), sq(unit)],
  };
}

export function generateGeo(rng: Rng, level: number): GeoData {
  const unit: GeoData['unit'] = level <= 1 ? 'quadretti' : level === 2 ? 'cm' : pick(rng, ['cm', 'cm', 'm'] as const);
  const grid = level <= 2;
  const max = level <= 2 ? 7 : 15;

  // al contrario (livello 4-5)
  if (level >= 4 && rng() < 0.3) {
    if (level >= 5 && rng() < 0.5) {
      const b = randInt(rng, 3, 9);
      const h = randInt(rng, 2, 9);
      const shape: Shape = { type: 'rettangolo', b, h };
      return {
        ...base(level, shape, 'altezza', unit, false),
        given: b * h,
        question: `L’area del rettangolo è ${b * h} ${sq(unit)} e la base è ${b} ${unit}. Quanto misura l’altezza?`,
        formulas: [`${b * h} : ${b}`, `${b * h} × ${b}`, `${b * h} − ${b}`],
        result: h,
      };
    }
    const l = randInt(rng, 3, 12);
    const shape: Shape = { type: 'quadrato', l };
    return {
      ...base(level, shape, 'lato', unit, false),
      given: l * 4,
      question: `Il perimetro del quadrato è ${l * 4} ${unit}. Quanto misura il lato?`,
      formulas: [`${l * 4} : 4`, `${l * 4} × 4`, `${l * 4} : 2`],
      result: l,
    };
  }

  // figura a L (livello 5): solo area
  if (level >= 5 && rng() < 0.35) {
    const W = randInt(rng, 6, 12);
    const H = randInt(rng, 5, 10);
    const cw = randInt(rng, 2, W - 3);
    const ch = randInt(rng, 2, H - 3);
    const shape: Shape = { type: 'elle', W, H, cw, ch };
    return {
      ...base(level, shape, 'area', unit, false),
      question: 'Calcola l’area della figura. Suggerimento: dividila in due rettangoli.',
      formulas: [`${W} × ${H - ch} + ${W - cw} × ${ch}`, `${W} × ${H}`, `${W} + ${H} + ${W - cw} + ${ch}`],
      result: area(shape),
    };
  }

  // triangolo (livello 4+): solo area
  if (level >= 4 && rng() < 0.35) {
    const b = 2 * randInt(rng, 2, 7);
    const h = randInt(rng, 3, 10);
    const shape: Shape = { type: 'triangolo', b, h };
    return {
      ...base(level, shape, 'area', unit, false),
      question: 'Calcola l’area del triangolo.',
      formulas: [`${b} × ${h} : 2`, `${b} × ${h}`, `(${b} + ${h}) × 2`],
      result: area(shape),
    };
  }

  const ask: Ask = rng() < 0.5 ? 'perimetro' : 'area';
  const square = level >= 3 ? rng() < 0.35 : rng() < 0.2;
  if (square) {
    let l = randInt(rng, 2, level <= 2 ? 6 : 12);
    // con il lato 4, «lato × 4» e «lato × lato» sarebbero uguali: si evita
    if (l === 4) l = 5;
    const shape: Shape = { type: 'quadrato', l };
    const formulas =
      level <= 1
        ? ask === 'perimetro'
          ? ['Conto i lati dei quadretti sul bordo', 'Conto i quadretti dentro']
          : ['Conto i quadretti dentro', 'Conto i lati dei quadretti sul bordo']
        : ask === 'perimetro'
          ? [`${l} × 4`, `${l} × ${l}`, `${l} + 4`]
          : [`${l} × ${l}`, `${l} × 4`, `${l} + ${l}`];
    return {
      ...base(level, shape, ask, unit, grid),
      question: `Calcola ${ask === 'perimetro' ? 'il perimetro' : 'l’area'} del quadrato.`,
      formulas,
      result: ask === 'perimetro' ? perimeter(shape) : area(shape),
    };
  }
  let b = randInt(rng, 3, max);
  let h = randInt(rng, 2, Math.min(max - 1, level <= 2 ? 5 : 12));
  if (b === h) b++;
  if (h > b) [b, h] = [h, b];
  const shape: Shape = { type: 'rettangolo', b, h };
  const formulas =
    level <= 1
      ? ask === 'perimetro'
        ? ['Conto i lati dei quadretti sul bordo', 'Conto i quadretti dentro']
        : ['Conto i quadretti dentro', 'Conto i lati dei quadretti sul bordo']
      : ask === 'perimetro'
        ? [`(${b} + ${h}) × 2`, `${b} × ${h}`, `${b} + ${h}`]
        : [`${b} × ${h}`, `(${b} + ${h}) × 2`, `${b} + ${h}`];
  return {
    ...base(level, shape, ask, unit, grid),
    question: `Calcola ${ask === 'perimetro' ? 'il perimetro' : 'l’area'} del rettangolo.`,
    formulas,
    result: ask === 'perimetro' ? perimeter(shape) : area(shape),
  };
}

export function shuffledFormulas(rng: Rng, d: GeoData): Array<{ text: string; ok: boolean }> {
  return shuffle(rng, d.formulas.map((text, i) => ({ text, ok: i === 0 })));
}

export function geoCategory(d: GeoData): string {
  if (d.ask === 'lato' || d.ask === 'altezza') return 'al-contrario';
  if (d.shape.type === 'triangolo') return 'area-triangolo';
  if (d.shape.type === 'elle') return 'figure-composte';
  return d.ask;
}
export const GEO_CATEGORY_LABELS: Record<string, string> = {
  perimetro: 'Perimetro',
  area: 'Area',
  'area-triangolo': 'Area del triangolo',
  'figure-composte': 'Figure composte',
  'al-contrario': 'Al contrario (lato, altezza)',
};

