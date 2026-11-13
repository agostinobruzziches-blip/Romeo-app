import { useLiveQuery } from 'dexie-react-hooks';
import { addDays, dayKey } from '../../core/dates';
import { db } from '../../db/schema';
import { LEVEL_NAMES, MAX_LEVEL, PROGRESS_KEY } from './levels';
import { ModuleSwitch } from '../../screens/parent/ModuleSwitch';
import { problemStats } from './stats';
import { CATEGORY_LABELS } from './types';

export function ProblemParentPanel() {
  const data = useLiveQuery(async () => {
    const from = addDays(dayKey(), -29);
    const sessions = await db.sessions.where('day').aboveOrEqual(from).toArray();
    const ids = new Set(sessions.map((s) => s.id));
    const attempts = (await db.attempts.where('moduleId').equals('problemi').toArray()).filter((a) => ids.has(a.sessionId));
    const progress = await db.problemProgress.get(PROGRESS_KEY);
    const settings = await db.settings.get('main');
    return { stats: problemStats(attempts), level: progress?.level ?? 1, active: settings?.activeModules.includes('problemi') };
  }, []);
  if (!data) return null;
  const tot = data.stats.reduce(
    (t, s) => ({ op: t.op + s.operazione, calc: t.calc + s.calcolo, dati: t.dati + s.dati, dom: t.dom + s.domanda }),
    { op: 0, calc: 0, dati: 0, dom: 0 },
  );
  return (
    <div className="flex flex-col gap-4">
      <ModuleSwitch id="problemi" name="I problemi" />
      <div className="rounded-xl bg-white p-3">
        <p className="font-bold">Livello attuale: {data.level} di {MAX_LEVEL}</p>
        <p className="text-inchiostro-2">{LEVEL_NAMES[data.level]}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-3">
          <p className="text-sm text-inchiostro-2">Operazione sbagliata</p>
          <p className="text-2xl font-bold tabular-nums">{tot.op}</p>
          <p className="text-sm text-inchiostro-2">non capisce cosa fare</p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-sm text-inchiostro-2">Calcolo sbagliato</p>
          <p className="text-2xl font-bold tabular-nums">{tot.calc}</p>
          <p className="text-sm text-inchiostro-2">sa cosa fare, sbaglia il conto</p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-sm text-inchiostro-2">Dati sbagliati</p>
          <p className="text-2xl font-bold tabular-nums">{tot.dati}</p>
          <p className="text-sm text-inchiostro-2">numeri sbagliati o in ordine sbagliato</p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-sm text-inchiostro-2">Domanda non capita</p>
          <p className="text-2xl font-bold tabular-nums">{tot.dom}</p>
          <p className="text-sm text-inchiostro-2">ha scelto la domanda sbagliata</p>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-lg font-bold">Per categoria (ultimi 30 giorni)</h3>
        {data.stats.length === 0 && <p className="text-inchiostro-2">Ancora nessun problema.</p>}
        <ul className="flex flex-col gap-2">
          {data.stats.map((s) => (
            <li key={s.category} className="rounded-xl bg-white p-3">
              <p className="font-bold">{CATEGORY_LABELS[s.category]}</p>
              <p>
                {s.problems} problemi · {s.clean} senza errori di ragionamento
                {s.unsolved ? ` · ${s.unsolved} con soluzione mostrata` : ''}
              </p>
              <p className="text-inchiostro-2">
                operazione {s.operazione} · calcolo {s.calcolo} · dati {s.dati} · domanda {s.domanda}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
