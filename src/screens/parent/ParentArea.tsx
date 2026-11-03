import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { checkPin, setPin } from '../../db/repo';
import { db } from '../../db/schema';
import { tabellineModule } from '../../modules/tabelline';
import { problemiModule } from '../../modules/problemi';
import { misureModule } from '../../modules/misure';
import { geometriaModule } from '../../modules/geometria';
import { BigButton } from '../../ui/BigButton';
import { PinPad } from '../../ui/PinPad';
import { Screen } from '../../ui/Screen';
import { Andamento } from './Andamento';
import { AppPanel } from './AppPanel';
import { BackupPanel } from './BackupPanel';
import { Impostazioni } from './Impostazioni';
import { TutorReport } from './TutorReport';

const TABS = [
  { id: 'tabelline', label: 'Tabelline' },
  { id: 'problemi', label: 'Problemi' },
  { id: 'misure', label: 'Misure' },
  { id: 'geometria', label: 'Geometria' },
  { id: 'andamento', label: 'Andamento' },
  { id: 'tutor', label: 'Per la tutor' },
  { id: 'impostazioni', label: 'Impostazioni' },
  { id: 'backup', label: 'Backup' },
  { id: 'app', label: 'App' },
] as const;
type TabId = (typeof TABS)[number]['id'];

function Gate({ onOk, onExit }: { onOk: () => void; onExit: () => void }) {
  const settings = useLiveQuery(() => db.settings.get('main'), []);
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState('');
  if (!settings) return null;
  const creating = !settings.pinHash;
  const title = creating ? (first ? 'Ripeti il PIN' : 'Crea un PIN di 4 cifre per i genitori') : 'PIN dei genitori';
  return (
    <Screen>
      <PinPad
        title={title}
        error={error}
        onComplete={async (pin) => {
          if (creating) {
            if (!first) {
              setFirst(pin);
              setError('');
            } else if (first === pin) {
              await setPin(pin);
              onOk();
            } else {
              setFirst(null);
              setError('I due PIN non coincidono, ricominciamo.');
            }
          } else if (await checkPin(pin)) onOk();
          else setError('PIN non corretto');
        }}
      />
      <BigButton variant="tenue" className="mt-3" onClick={onExit}>
        Indietro
      </BigButton>
    </Screen>
  );
}

export function ParentArea({ onExit }: { onExit: () => void }) {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>('tabelline');
  if (!unlocked) return <Gate onOk={() => setUnlocked(true)} onExit={onExit} />;
  const Panel = tabellineModule.ParentPanel;
  const ProblemPanel = problemiModule.ParentPanel;
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(env(safe-area-inset-top),12px)] pb-6">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-bold">Area genitori</h1>
        <button type="button" onClick={onExit} className="min-h-12 rounded-xl bg-white px-4 font-bold">
          Chiudi
        </button>
      </header>
      <nav className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 py-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-12 shrink-0 rounded-full px-4 font-bold ${
              tab === t.id ? 'bg-egeo text-white' : 'bg-white text-inchiostro'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="flex-1">
        {tab === 'tabelline' && <Panel />}
        {tab === 'problemi' && <ProblemPanel />}
        {tab === 'misure' && <misureModule.ParentPanel />}
        {tab === 'geometria' && <geometriaModule.ParentPanel />}
        {tab === 'andamento' && <Andamento />}
        {tab === 'tutor' && <TutorReport />}
        {tab === 'impostazioni' && <Impostazioni />}
        {tab === 'backup' && <BackupPanel />}
        {tab === 'app' && <AppPanel />}
      </main>
    </div>
  );
}
