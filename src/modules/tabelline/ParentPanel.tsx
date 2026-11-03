import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db, type Fact, type Stage } from '../../db/schema';
import { factKey } from './leitner';
import { INTRO_ORDER, STAGE_NAMES } from './stages';

export function factColor(f: Fact | undefined): { bg: string; label: string } {
  if (!f || f.seen === 0) return { bg: 'var(--color-grigio-mappa)', label: 'mai visto' };
  if (f.box === 0) return { bg: 'var(--color-rosso-mappa)', label: 'da allenare' };
  if (f.box <= 3) return { bg: 'var(--color-giallo-mappa)', label: 'in crescita' };
  return { bg: 'var(--color-verde-mappa)', label: 'sicuro' };
}

const LEGEND = [
  { bg: 'var(--color-verde-mappa)', label: 'sicuro (livello 4–5)' },
  { bg: 'var(--color-giallo-mappa)', label: 'in crescita (1–3)' },
  { bg: 'var(--color-rosso-mappa)', label: 'da allenare (0)' },
  { bg: 'var(--color-grigio-mappa)', label: 'mai visto' },
];

/** Mappa 10×10 delle tabelline: tocca una casella per i dettagli. */
export function TabParentPanel() {
  const facts = useLiveQuery(() => db.facts.toArray(), []);
  const progress = useLiveQuery(() => db.tableProgress.toArray(), []);
  const [sel, setSel] = useState<string | null>(null);
  if (!facts || !progress) return null;
  const map = new Map(facts.map((f) => [f.key, f]));
  const selected = sel ? map.get(sel) : undefined;
  const nums = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-[3px] text-sm tabular-nums">
          <thead>
            <tr>
              <th className="w-6 text-inchiostro-2">×</th>
              {nums.map((n) => (
                <th key={n} className="w-7 text-inchiostro-2">{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nums.map((r) => (
              <tr key={r}>
                <th className="text-inchiostro-2">{r}</th>
                {nums.map((c) => {
                  const k = factKey(r, c);
                  const f = map.get(k);
                  const { bg, label } = factColor(f);
                  return (
                    <td key={c} className="p-0">
                      <button
                        type="button"
                        onClick={() => setSel(k)}
                        aria-label={`${r} per ${c}: ${label}`}
                        className={`h-7 w-7 rounded-md ${sel === k ? 'ring-2 ring-inchiostro' : ''}`}
                        style={{ background: bg }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
        {LEGEND.map((l) => (
          <li key={l.label} className="flex items-center gap-2">
            <span className="h-4 w-4 rounded" style={{ background: l.bg }} />
            {l.label}
          </li>
        ))}
      </ul>
      {selected && (
        <div className="rounded-xl bg-white p-3 text-base">
          <p className="font-bold">
            {selected.a} × {selected.b} = {selected.a * selected.b} (vale anche {selected.b} × {selected.a})
          </p>
          <p>
            Livello {selected.box} di 5 · visto {selected.seen} volte · giuste al primo colpo {selected.firstTry} · con
            tenacia {selected.afterRetry} · aiuti {selected.helpUsed}
          </p>
          {selected.medianMs > 0 && <p className="text-inchiostro-2">Tempo tipico: {(selected.medianMs / 1000).toFixed(1)} s</p>}
        </div>
      )}
      <div>
        <h3 className="mb-2 text-lg font-bold">Tappe per tabellina</h3>
        <ul className="flex flex-col gap-1">
          {INTRO_ORDER.map((t) => {
            const p = progress.find((x) => x.table === t);
            return (
              <li key={t} className="flex justify-between rounded-lg bg-white px-3 py-2">
                <span className="font-bold">Tabellina del {t}</span>
                <span className="text-inchiostro-2">
                  {p?.conqueredAt ? '🏅 conquistata' : `tappa ${p?.stage ?? 1}: ${STAGE_NAMES[(p?.stage ?? 1) as Stage]}`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
