import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type ReactNode } from 'react';
import { setPin, updateSettings } from '../../db/repo';
import { db, type Stage } from '../../db/schema';
import { INTRO_ORDER, STAGE_NAMES } from '../../modules/tabelline/stages';
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
      <Row label="Lettura ad alta voce" hint="Per i problemi (in arrivo nella fase 4).">
        <Toggle label="Lettura ad alta voce" on={s.readAloud} onChange={(v) => void updateSettings({ readAloud: v })} />
      </Row>
      <Row label="Moduli attivi" hint="Problemi: in arrivo nella fase 4.">
        <span className="rounded-full bg-oliva-chiaro px-3 py-2 font-bold">Tabelline</span>
      </Row>

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
