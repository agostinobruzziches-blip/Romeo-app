import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type ReactNode } from 'react';
import { setPin, updateSettings } from '../../db/repo';
import { db, type Stage } from '../../db/schema';
import { INTRO_ORDER, STAGE_NAMES } from '../../modules/tabelline/stages';
import { EPOCHS, type EpochId } from '../../content/epochs';
import { syncCards } from '../../core/cards';
import { LEVEL_NAMES, MAX_LEVEL, PROGRESS_KEY } from '../../modules/problemi/levels';
import { MAX_MIS_LEVEL, MIS_LEVEL_NAMES } from '../../modules/misure/generator';
import { GEO_LEVEL_NAMES, MAX_GEO_LEVEL } from '../../modules/geometria/shapes';
import { setLevel } from '../../core/levels';
import type { ModuleId } from '../../db/schema';

const ALL_MODULES: Array<[ModuleId, string]> = [
  ['tabelline', 'Tabelline'],
  ['problemi', 'Problemi'],
  ['misure', 'Misure'],
  ['geometria', 'Geometria'],
];

function LevelSelect({ id, label, progressKey, names, max }: { id: string; label: string; progressKey: string; names: Record<number, string>; max: number }) {
  const p = useLiveQuery(() => db.problemProgress.get(progressKey), [progressKey]);
  return (
    <div className="rounded-xl bg-white p-3">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <p className="mb-2 text-sm text-inchiostro-2">
        Si parte dal livello 1. Sale da solo quando in 2 missioni di fila lavora senza errori di ragionamento; non scende
        mai. Se a scuola è già più avanti, sceglilo qui.
      </p>
      <select
        id={id}
        className="h-12 w-full rounded-xl border-2 border-carta-2 bg-white px-2 text-base"
        value={p?.level ?? 1}
        onChange={(e) => void setLevel(progressKey, Number(e.target.value))}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((l) => (
          <option key={l} value={l}>
            {l}. {names[l]}
          </option>
        ))}
      </select>
    </div>
  );
}
import { BigButton } from '../../ui/BigButton';

function Row({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold">{label}</span>
        {children}
      </div>
      {hint && <p className="mt-1 text-sm text-inchiostro-2">{hint}</p>}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`h-12 min-w-20 rounded-full px-3 font-bold ${on ? 'bg-oliva text-white' : 'bg-carta-2 text-inchiostro-2'}`}
    >
      {on ? 'Sì' : 'No'}
    </button>
  );
}

export function Impostazioni() {
  const s = useLiveQuery(() => db.settings.get('main'), []);
  const progress = useLiveQuery(() => db.tableProgress.toArray(), []);
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  if (!s || !progress) return null;

  const stepBtn = 'h-12 w-12 rounded-xl bg-carta-2 text-2xl font-bold';

  const setStage = async (table: number, value: string) => {
    const p = progress.find((x) => x.table === table) ?? { table, stage: 1 as Stage, goodSessionsAtStage: 0 };
    if (value === 'c') await db.tableProgress.put({ ...p, stage: 4, goodSessionsAtStage: 0, conqueredAt: Date.now() });
    else await db.tableProgress.put({ ...p, stage: Number(value) as Stage, goodSessionsAtStage: 0, conqueredAt: undefined });
  };

  return (
    <div className="flex flex-col gap-3">
      <Row label="Nome del bambino" hint="Resta solo su questo telefono.">
        <input
          className="h-12 w-40 rounded-xl border-2 border-carta-2 px-3 text-lg"
          value={s.childName}
          onChange={(e) => void updateSettings({ childName: e.target.value })}
        />
      </Row>
      <Row label="Chi aiuta" hint={`Il pulsante dirà «Chiedi a ${s.parentLabel}».`}>
        <input
          className="h-12 w-40 rounded-xl border-2 border-carta-2 px-3 text-lg"
          value={s.parentLabel}
          onChange={(e) => void updateSettings({ parentLabel: e.target.value })}
        />
      </Row>
      <Row label="Durata missione" hint="Il numero di domande si calcola dai minuti e dal ritmo del bambino.">
        <div className="flex items-center gap-2">
          <button type="button" className={stepBtn} onClick={() => void updateSettings({ missionMinutes: Math.max(5, s.missionMinutes - 1) })}>
            −
          </button>
          <span className="w-16 text-center text-lg font-bold">{s.missionMinutes} min</span>
          <button type="button" className={stepBtn} onClick={() => void updateSettings({ missionMinutes: Math.min(15, s.missionMinutes + 1) })}>
            +
          </button>
        </div>
      </Row>
      <Row label="Suoni">
        <Toggle label="Suoni" on={s.soundOn} onChange={(v) => void updateSettings({ soundOn: v })} />
      </Row>
      {s.soundOn && (
        <Row label="Volume">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.volume}
            onChange={(e) => void updateSettings({ volume: Number(e.target.value) })}
            className="w-40"
            aria-label="Volume"
          />
        </Row>
      )}
      <Row label="Lettura ad alta voce" hint="Mostra il pulsante «Leggi per me» nei problemi e «Ascolta» nelle carte.">
        <Toggle label="Lettura ad alta voce" on={s.readAloud} onChange={(v) => void updateSettings({ readAloud: v })} />
      </Row>
      <div className="rounded-xl bg-white p-3">
        <label htmlFor="epoca" className="font-bold">
          Epoca di partenza delle carte
        </label>
        <p className="mb-2 text-sm text-inchiostro-2">
          Le carte comuni arrivano a partire da quest’epoca, poi si va avanti nel tempo e alla fine si torna alle epoche
          precedenti. Le carte già vinte restano tutte; cambia solo l’ordine delle prossime.
        </p>
        <select
          id="epoca"
          className="h-12 w-full rounded-xl border-2 border-carta-2 bg-white px-2 text-lg"
          value={s.startEpoch ?? 'preistoria'}
          onChange={async (e) => {
            await updateSettings({ startEpoch: e.target.value as EpochId });
            await syncCards();
          }}
        >
          {EPOCHS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.period})
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-xl bg-white p-3">
        <p className="font-bold">Cosa c’è nella missione</p>
        <p className="mb-2 text-sm text-inchiostro-2">
          Le tabelline ci sono ogni giorno. Tra gli altri argomenti accesi se ne fa <b>uno al giorno</b>, a rotazione
          (circa metà del tempo). Ogni argomento nuovo parte con una breve lezione “Scopri”.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_MODULES.map(([m, label]) => {
            const on = s.activeModules.includes(m);
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  const next = on ? s.activeModules.filter((x) => x !== m) : [...s.activeModules, m];
                  if (next.length) void updateSettings({ activeModules: ALL_MODULES.map(([x]) => x).filter((x) => next.includes(x)) });
                }}
                className={`h-12 rounded-xl text-lg font-bold ${on ? 'bg-oliva text-white' : 'bg-carta-2 text-inchiostro-2'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {s.activeModules.includes('problemi') && (
        <LevelSelect id="livello" label="Livello dei problemi" progressKey={PROGRESS_KEY} names={LEVEL_NAMES} max={MAX_LEVEL} />
      )}
      {s.activeModules.includes('misure') && (
        <LevelSelect id="livello-misure" label="Livello delle misure (equivalenze)" progressKey="misure" names={MIS_LEVEL_NAMES} max={MAX_MIS_LEVEL} />
      )}
      {s.activeModules.includes('geometria') && (
        <LevelSelect id="livello-geometria" label="Livello di geometria (perimetro e area)" progressKey="geometria" names={GEO_LEVEL_NAMES} max={MAX_GEO_LEVEL} />
      )}

      <div className="rounded-xl bg-white p-3">
        <p className="font-bold">Tabelline attive e tappa di partenza</p>
        <p className="mb-2 text-sm text-inchiostro-2">
          Si lavora su una tabellina alla volta, nell’ordine qui sotto. Se ne sa già bene una, puoi farla partire da
          una tappa più avanti o segnarla come conquistata.
        </p>
        <ul className="flex flex-col gap-2">
          {INTRO_ORDER.map((t) => {
            const active = s.activeTables.includes(t);
            const p = progress.find((x) => x.table === t);
            const value = p?.conqueredAt ? 'c' : String(p?.stage ?? 1);
            return (
              <li key={t} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void updateSettings({
                      activeTables: active ? s.activeTables.filter((x) => x !== t) : [...s.activeTables, t].sort((a, b) => a - b),
                    })
                  }
                  className={`h-12 w-16 shrink-0 rounded-xl text-lg font-bold ${active ? 'bg-egeo text-white' : 'bg-carta-2 text-inchiostro-2'}`}
                  aria-pressed={active}
                >
                  ×{t}
                </button>
                <select
                  className="h-12 flex-1 rounded-xl border-2 border-carta-2 bg-white px-2 text-base"
                  value={value}
                  disabled={!active}
                  onChange={(e) => void setStage(t, e.target.value)}
                  aria-label={`Tappa della tabellina del ${t}`}
                >
                  {([1, 2, 3, 4] as Stage[]).map((st) => (
                    <option key={st} value={st}>
                      Tappa {st}: {STAGE_NAMES[st]}
                    </option>
                  ))}
                  <option value="c">Conquistata</option>
                </select>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl bg-white p-3">
        <p className="mb-2 font-bold">Cambia PIN</p>
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="h-12 w-28 rounded-xl border-2 border-carta-2 px-3 text-lg tracking-widest"
            aria-label="Nuovo PIN"
          />
          <BigButton
            full={false}
            variant="secondario"
            disabled={newPin.length !== 4}
            onClick={async () => {
              await setPin(newPin);
              setNewPin('');
              setPinMsg('PIN aggiornato.');
            }}
          >
            Salva
          </BigButton>
        </div>
        <p className="min-h-6 text-oliva">{pinMsg}</p>
      </div>
    </div>
  );
}
