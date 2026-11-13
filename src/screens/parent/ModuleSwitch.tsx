import { useLiveQuery } from 'dexie-react-hooks';
import { updateSettings } from '../../db/repo';
import { db, type ModuleId } from '../../db/schema';
import { BigButton } from '../../ui/BigButton';

const ORDER: ModuleId[] = ['tabelline', 'problemi', 'misure', 'geometria'];

/** Interruttore di un argomento, direttamente nella sua scheda dell'area genitori. */
export function ModuleSwitch({ id, name }: { id: ModuleId; name: string }) {
  const s = useLiveQuery(() => db.settings.get('main'), []);
  if (!s) return null;
  const on = s.activeModules.includes(id);
  const set = (value: boolean) => {
    const next = value ? [...s.activeModules, id] : s.activeModules.filter((x) => x !== id);
    if (next.length) void updateSettings({ activeModules: ORDER.filter((x) => next.includes(x)) });
  };
  if (!on) {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-ambra-chiaro p-3">
        <p className="font-bold">{name} non sono ancora nella missione.</p>
        <p className="text-base">
          Accendili qui: le tabelline restano ogni giorno, e tra gli argomenti accesi se ne fa uno al giorno, a rotazione.
        </p>
        <BigButton onClick={() => set(true)}>Attiva {name.toLowerCase()}</BigButton>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-oliva-chiaro px-3 py-2">
      <p className="font-bold text-oliva">✓ {name}: attivi nella missione</p>
      <button type="button" onClick={() => set(false)} className="min-h-12 px-2 text-base text-inchiostro-2 underline">
        Disattiva
      </button>
    </div>
  );
}
