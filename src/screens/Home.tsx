import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { dayKey } from '../core/dates';
import { computeStreak } from '../core/streak';
import { COMPLETED, checkPin } from '../db/repo';
import { loadCollection, nextCommonCard } from '../core/cards';
import { CARDS } from '../content/cards';
import { db } from '../db/schema';
import { T } from '../i18n/testi';
import { BigButton } from '../ui/BigButton';
import { Guide } from '../ui/Guide';
import { Medal, Star } from '../ui/Icons';
import { PinPad } from '../ui/PinPad';
import { Screen } from '../ui/Screen';

export function Home({
  onStart,
  onParent,
  onTimeline,
}: {
  onStart: (repeat: boolean) => void;
  onParent: () => void;
  onTimeline: () => void;
}) {
  const data = useLiveQuery(async () => {
    const settings = await db.settings.get('main');
    const sessions = (await db.sessions.toArray()).filter((s) => s.endReason && COMPLETED.includes(s.endReason));
    const stars = await db.rewards.where('kind').anyOf('stella', 'bonus-serie').count();
    const medals = await db.rewards.where('kind').equals('medaglia-tenacia').count();
    const today = dayKey();
    const allCards = await db.cards.toArray();
    return {
      cards: allCards.length,
      unseen: allCards.filter((c) => !c.seen).length,
      next: nextCommonCard(await loadCollection()),
      settings,
      stars,
      medals,
      doneToday: sessions.some((s) => s.day === today),
      streak: computeStreak(sessions.map((s) => s.day), today),
    };
  }, []);
  const [askPin, setAskPin] = useState(false);
  const [pinError, setPinError] = useState('');

  if (!data) return <Screen>{null}</Screen>;
  const name = data.settings?.childName || 'Esploratore';

  if (askPin) {
    return (
      <Screen>
        <PinPad
          title="PIN del genitore per un’altra missione"
          error={pinError}
          onComplete={async (pin) => {
            if (!data.settings?.pinHash) {
              setPinError('Prima crea un PIN nell’area genitori.');
              return;
            }
            if (await checkPin(pin)) onStart(true);
            else setPinError('PIN non corretto');
          }}
        />
        <BigButton variant="tenue" className="mt-3" onClick={() => setAskPin(false)}>
          Indietro
        </BigButton>
      </Screen>
    );
  }

  return (
    <Screen>
      <header className="flex justify-end">
        <button type="button" onClick={onParent} className="min-h-12 px-3 text-base text-inchiostro-2 underline">
          Area genitori
        </button>
      </header>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <h1 className="text-center text-3xl font-bold leading-tight text-egeo">Viaggio nel Tempo</h1>
        <Guide size={110} mood={data.doneToday ? 'felice' : 'calmo'}>
          {data.doneToday ? T.fattaOggi : T.saluto(name)}
        </Guide>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white p-3">
            <div className="flex justify-center"><Star size={32} /></div>
            <p className="text-3xl font-bold tabular-nums">{data.stars}</p>
            <p className="text-sm text-inchiostro-2">{data.stars === 1 ? 'stella' : 'stelle'}</p>
          </div>
          <div className="rounded-2xl bg-white p-3">
            <div className="flex justify-center"><Medal size={32} /></div>
            <p className="text-3xl font-bold tabular-nums">{data.medals}</p>
            <p className="text-sm text-inchiostro-2">{data.medals === 1 ? 'medaglia' : 'medaglie'} della tenacia</p>
          </div>
          <div className="rounded-2xl bg-white p-3">
            <p className="text-2xl" aria-hidden="true">🧭</p>
            <p className="text-3xl font-bold tabular-nums">{data.streak.current}</p>
            <p className="text-sm text-inchiostro-2">{data.streak.current === 1 ? 'giorno' : 'giorni'} di esplorazione</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onTimeline}
          className="relative flex min-h-16 items-center justify-between rounded-2xl border-2 border-egeo/20 bg-egeo-chiaro px-4 py-3 text-left"
        >
          <span>
            <span className="block text-xl font-bold text-egeo">Linea del tempo e carte</span>
            <span className="text-base text-inchiostro-2">
              {data.cards} {data.cards === 1 ? 'carta' : 'carte'} su {CARDS.length}
              {data.next ? ` · prossima tra ${data.next.starsNeeded} ${data.next.starsNeeded === 1 ? 'stella' : 'stelle'}` : ''}
            </span>
          </span>
          {data.unseen > 0 && (
            <span className="rounded-full bg-terracotta px-3 py-1 text-sm font-bold text-white">{data.unseen} {data.unseen === 1 ? 'nuova' : 'nuove'}</span>
          )}
        </button>
      </div>
      {data.doneToday ? (
        <BigButton variant="tenue" onClick={() => { setPinError(''); setAskPin(true); }}>
          {T.ripeti}
        </BigButton>
      ) : (
        <BigButton onClick={() => onStart(false)} className="min-h-20 text-2xl">
          Inizia la missione del giorno
        </BigButton>
      )}
    </Screen>
  );
}
