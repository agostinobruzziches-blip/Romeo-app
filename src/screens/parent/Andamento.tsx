import { useLiveQuery } from 'dexie-react-hooks';
import { addDays, dayKey, formatDay } from '../../core/dates';
import { FATIGUE_LABELS } from '../../core/fatigue';
import { END_LABELS, pct, periodStats, sessionMinutes, type PeriodStats } from '../../core/stats';
import { db } from '../../db/schema';

function Tile({ label, now, before }: { label: string; now: string | number; before?: string | number }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-sm text-inchiostro-2">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{now}</p>
      {before !== undefined && <p className="text-sm text-inchiostro-2">settimana prima: {before}</p>}
    </div>
  );
}

function tiles(a: PeriodStats, b: PeriodStats) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Tile label="Missioni" now={a.missions} before={b.missions} />
      <Tile label="Esercizi" now={a.items} before={b.items} />
      <Tile label="Giuste al primo colpo" now={`${pct(a.firstTry, a.items)}%`} before={`${pct(b.firstTry, b.items)}%`} />
      <Tile label="Medaglie della tenacia" now={a.medals} before={b.medals} />
      <Tile label="Missioni con segnali di stanchezza" now={a.fatigueSessions} before={b.fatigueSessions} />
      <Tile label="Aiuti usati" now={a.help} before={b.help} />
    </div>
  );
}

export function Andamento() {
  const data = useLiveQuery(async () => {
    const today = dayKey();
    const week = await periodStats(7, today);
    const prev = await periodStats(7, addDays(today, -7));
    const sessions = await db.sessions.orderBy('startedAt').reverse().limit(30).toArray();
    return { week, prev, sessions };
  }, []);
  if (!data) return null;
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h2 className="mb-2 text-lg font-bold">Ultimi 7 giorni</h2>
        {tiles(data.week, data.prev)}
      </section>
      <section>
        <h2 className="mb-2 text-lg font-bold">Missioni recenti</h2>
        {data.sessions.length === 0 && <p className="text-inchiostro-2">Ancora nessuna missione.</p>}
        <ul className="flex flex-col gap-2">
          {data.sessions.map((s) => {
            const tried = s.doneItems;
            const kinds = [...new Set(s.fatigueSignals.map((f) => FATIGUE_LABELS[f.kind]))];
            return (
              <li key={s.id} className="rounded-xl bg-white p-3 text-base">
                <div className="flex justify-between gap-2">
                  <span className="font-bold">
                    {formatDay(s.day)}
                    {s.isRepeat ? ' · ripetuta' : ''}
                  </span>
                  <span className="text-inchiostro-2">{s.endReason ? END_LABELS[s.endReason] : 'in corso'}</span>
                </div>
                {s.focusLabel && <p className="text-inchiostro-2">{s.focusLabel}</p>}
                <p>
                  {tried}/{s.plannedItems} esercizi · {sessionMinutes(s)} min · primo colpo {s.firstTryCorrect} ({pct(s.firstTryCorrect, tried)}%) ·
                  tenacia {s.tenacityMedals} · aiuti {s.helpCount}
                  {s.parentHelpCount ? ` · genitore ${s.parentHelpCount}` : ''}
                </p>
                {kinds.length > 0 && <p className="text-ambra">Stanchezza: {kinds.join(', ')}</p>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
