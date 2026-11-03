import { useLiveQuery } from 'dexie-react-hooks';
import { addDays, dayKey } from '../../core/dates';
import { cleanItems, errorCounts, getLevel } from '../../core/levels';
import { db } from '../../db/schema';
import { GEO_CATEGORY_LABELS, GEO_LEVEL_NAMES, MAX_GEO_LEVEL } from './shapes';

export function GeoParentPanel() {
  const data = useLiveQuery(async () => {
    const ids = new Set((await db.sessions.where('day').aboveOrEqual(addDays(dayKey(), -29)).toArray()).map((s) => s.id));
    const att = (await db.attempts.where('moduleId').equals('geometria').toArray()).filter((a) => ids.has(a.sessionId));
    const cats = [...new Set(att.map((a) => a.category ?? ''))].filter(Boolean).map((c) => {
      const list = att.filter((a) => a.category === c);
      const items = cleanItems(list, 'geometria', 'figura');
      return { c, n: items.length, clean: items.filter((i) => i.clean).length, e: errorCounts(list) };
    });
    return { level: (await getLevel('geometria')).level, cats, e: errorCounts(att) };
  }, []);
  if (!data) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-white p-3">
        <p className="font-bold">
          Livello {data.level} di {MAX_GEO_LEVEL}
        </p>
        <p className="text-inchiostro-2">{GEO_LEVEL_NAMES[data.level]}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['concetto', 'Perimetro o area?', 'confonde contorno e superficie'],
          ['operazione', 'Formula', 'sceglie il calcolo sbagliato'],
          ['unita', 'Unità', 'cm al posto di cm² o viceversa'],
          ['calcolo', 'Calcolo', 'ha capito, sbaglia il conto'],
        ].map(([k, t, s]) => (
          <div key={k} className="rounded-xl bg-white p-3">
            <p className="text-sm font-bold">{t}</p>
            <p className="text-2xl font-bold tabular-nums">{data.e[k] ?? 0}</p>
            <p className="text-xs text-inchiostro-2">{s}</p>
          </div>
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {data.cats.map((x) => (
          <li key={x.c} className="rounded-xl bg-white p-3">
            <p className="font-bold">{GEO_CATEGORY_LABELS[x.c] ?? x.c}</p>
            <p>
              {x.n} esercizi · {x.clean} senza errori di ragionamento
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
