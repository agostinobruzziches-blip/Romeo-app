export type Family = 'lunghezza' | 'massa' | 'capacita';

export interface Unit {
  sym: string;
  name: string;
  plural: string;
}

/** Dalla più grande alla più piccola: ogni unità vale 10 volte quella alla sua destra. */
export const UNITS: Record<Family, Unit[]> = {
  lunghezza: [
    { sym: 'km', name: 'chilometro', plural: 'chilometri' },
    { sym: 'hm', name: 'ettometro', plural: 'ettometri' },
    { sym: 'dam', name: 'decametro', plural: 'decametri' },
    { sym: 'm', name: 'metro', plural: 'metri' },
    { sym: 'dm', name: 'decimetro', plural: 'decimetri' },
    { sym: 'cm', name: 'centimetro', plural: 'centimetri' },
    { sym: 'mm', name: 'millimetro', plural: 'millimetri' },
  ],
  massa: [
    { sym: 'kg', name: 'chilogrammo', plural: 'chilogrammi' },
    { sym: 'hg', name: 'ettogrammo', plural: 'ettogrammi' },
    { sym: 'dag', name: 'decagrammo', plural: 'decagrammi' },
    { sym: 'g', name: 'grammo', plural: 'grammi' },
    { sym: 'dg', name: 'decigrammo', plural: 'decigrammi' },
    { sym: 'cg', name: 'centigrammo', plural: 'centigrammi' },
    { sym: 'mg', name: 'milligrammo', plural: 'milligrammi' },
  ],
  capacita: [
    { sym: 'hl', name: 'ettolitro', plural: 'ettolitri' },
    { sym: 'dal', name: 'decalitro', plural: 'decalitri' },
    { sym: 'l', name: 'litro', plural: 'litri' },
    { sym: 'dl', name: 'decilitro', plural: 'decilitri' },
    { sym: 'cl', name: 'centilitro', plural: 'centilitri' },
    { sym: 'ml', name: 'millilitro', plural: 'millilitri' },
  ],
};

export const BASE: Record<Family, string> = { lunghezza: 'm', massa: 'g', capacita: 'l' };
export const FAMILY_LABEL: Record<Family, string> = { lunghezza: 'lunghezze', massa: 'pesi (massa)', capacita: 'capacità' };

/** Unità usate di più a scuola: nei primi livelli si usano solo queste. */
export const COMMON: Record<Family, string[]> = {
  lunghezza: ['km', 'm', 'dm', 'cm', 'mm'],
  massa: ['kg', 'hg', 'g'],
  capacita: ['l', 'dl', 'cl', 'ml'],
};

export function unitIndex(f: Family, sym: string): number {
  return UNITS[f].findIndex((u) => u.sym === sym);
}

/** Passi da `from` a `to`: positivi verso destra (unità più piccola, si moltiplica). */
export function stepsBetween(f: Family, from: string, to: string): number {
  return unitIndex(f, to) - unitIndex(f, from);
}

export function convert(f: Family, value: number, from: string, to: string): number {
  const r = value * 10 ** stepsBetween(f, from, to);
  return Math.round(r * 1e6) / 1e6;
}

export function unitName(f: Family, sym: string, plural = true): string {
  const u = UNITS[f][unitIndex(f, sym)];
  return plural ? u.plural : u.name;
}
