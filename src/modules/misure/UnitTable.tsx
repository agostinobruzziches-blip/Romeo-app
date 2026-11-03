import { UNITS, unitIndex, type Family } from './units';

/**
 * La tabella delle unità di misura (come sul quaderno): una colonna per unità.
 * - highlight: unità di partenza (blu) e di arrivo (verde)
 * - value + valueUnit: il numero scritto nella tabella, una cifra per colonna
 * - showArrows: le frecce "× 10" tra le colonne, per contare i passi
 * - pad: mostra in grigio gli zeri da aggiungere fino all'unità `padTo`
 */
export function UnitTable({
  family,
  from,
  to,
  value,
  valueUnit,
  showArrows = false,
  padTo,
}: {
  family: Family;
  from?: string;
  to?: string;
  value?: number;
  valueUnit?: string;
  showArrows?: boolean;
  padTo?: string;
}) {
  const units = UNITS[family];
  const digits = new Map<number, { d: string; pad?: boolean }>();
  let commaAfter = -1;
  if (value !== undefined && valueUnit) {
    const ui = unitIndex(family, valueUnit);
    commaAfter = ui;
    const [intPart, decPart = ''] = String(Math.round(value * 1e6) / 1e6).split('.');
    [...intPart].reverse().forEach((d, k) => digits.set(ui - k, { d }));
    [...decPart].forEach((d, k) => digits.set(ui + 1 + k, { d }));
    if (padTo) {
      const ti = unitIndex(family, padTo);
      for (let i = ui + 1; i <= ti; i++) if (!digits.has(i)) digits.set(i, { d: '0', pad: true });
      if (ti < ui) {
        // verso un'unità più grande: zeri davanti se servono (0,75 m)
        for (let i = ti; i < ui - intPart.length + 1; i++) if (!digits.has(i)) digits.set(i, { d: '0', pad: true });
      }
      commaAfter = ti;
    }
  }
  const lastDigit = Math.max(-1, ...digits.keys());
  return (
    <div className="w-full">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${units.length}, minmax(0, 1fr))` }}>
        {units.map((u) => {
          const isFrom = u.sym === from;
          const isTo = u.sym === to;
          return (
            <div
              key={u.sym}
              className={`rounded-t-lg py-1 text-center text-base font-bold ${
                isFrom ? 'bg-egeo text-white' : isTo ? 'bg-oliva text-white' : 'bg-carta-2 text-inchiostro'
              }`}
            >
              {u.sym}
              {['m', 'g', 'l'].includes(u.sym) && (
                <span className="block text-[10px] leading-none font-normal opacity-80">base</span>
              )}
            </div>
          );
        })}
        {units.map((u, i) => {
          const cell = digits.get(i);
          return (
            <div
              key={`v-${u.sym}`}
              className="relative flex h-12 items-center justify-center rounded-b-lg border-2 border-carta-2 bg-white text-2xl font-bold tabular-nums"
            >
              <span className={cell?.pad ? 'text-[#b5ae9f]' : 'text-inchiostro'}>{cell?.d ?? ''}</span>
              {commaAfter === i && i < lastDigit && (
                <span className="absolute -right-1.5 bottom-1 text-2xl font-bold text-terracotta">,</span>
              )}
            </div>
          );
        })}
      </div>
      {showArrows && (
        <div className="grid" style={{ gridTemplateColumns: `repeat(${units.length * 2}, minmax(0, 1fr))` }}>
          <span />
          {units.slice(0, -1).map((u) => (
            <span key={u.sym} className="col-span-2 text-center text-xs font-bold text-terracotta">
              ×10→
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
