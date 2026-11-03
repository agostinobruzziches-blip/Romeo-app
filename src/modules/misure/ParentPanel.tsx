import { useLiveQuery } from 'dexie-react-hooks';
import { addDays, dayKey } from '../../core/dates';
import { cleanItems, errorCounts, getLevel } from '../../core/levels';
import { db } from '../../db/schema';
import { MAX_MIS_LEVEL, MIS_LEVEL_NAMES } from './generator';
import { FAMILY_LABEL, type Family } from './units';

export function MisParentPanel() {
  const data = useLiveQuery(async () => {
    const ids = new Set((await db.sessions.where('day').aboveOrEqual(addDays(dayKey(), -29)).toArray()).map((s) => s.id));
    const att = (await db.attempts.where('moduleId').equals('misure').toArray()).filter((a) => ids.has(a.sessionId));
    const byFam = (['lunghezza', 'capacita', 'massa'] as Family[]).map((f) => {
      const list = att.filter((a) => a.category === f);
      const items = cleanItems(list, 'misure', 'equivalenza');
      return { f, n: items.length, clean: items.filter((i) => i.clean).length, e: errorCounts(list) };
    });
    return { level: (await getLevel('misure')).level, byFam, e: errorCounts(att) };
  }, []);
  if (!data) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-white p-3">
        <p className="font-bold">
          Livello {data.level} di {MAX_MIS_LEVEL}
        </p>
        <p className="text-inchiostro-2">{MIS_LEVEL_NAMES[data.level]}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['concetto', 'Verso sbagliato', 'unità o numero più grande/piccolo'],
          ['operazione', 'Passi sbagliati', '× o :, 10/100/1000'],
          ['calcolo', 'Calcolo', 'ha capito, sbaglia il numero'],
        ].map(([k, t, s]) => (
          <div key={k} className="rounded-xl bg-white p-2">
            <p className="text-sm font-bold">{t}</p>
            <p className="text-2xl font-bold tabular-nums">{data.e[k] ?? 0}</p>
            <p className="text-xs text-inchiostro-2">{s}</p>
          </div>
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {data.byFam
          .filter((x) => x.n > 0)
          .map((x) => (
            <li key={x.f} className="rounded-xl bg-white p-3">
              <p className="font-bold capitalize">{FAMILY_LABEL[x.f]}</p>
              <p>
                {x.n} equivalenze · {x.clean} senza errori di ragionamento
              </p>
            </li>
          ))}
      </ul>
      <p className="text-sm text-inchiostro-2">
        Gli errori “verso sbagliato” sono i più importanti: vuol dire che non è ancora chiaro che con un’unità più piccola il
        numero diventa più grande. Un metro da sarta o un righello aiutano molto.
      </p>
    </div>
  );
}
