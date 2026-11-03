import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { CARDS, CARD_BY_ID } from '../content/cards';
import { loadCollection, starsForCard } from '../core/cards';
import { EPOCH_BY_ID, type EpochId } from '../content/epochs';
import { canSpeak, speak, stopSpeaking } from '../core/speech';
import { db } from '../db/schema';
import { BigButton } from '../ui/BigButton';
import { CardView } from '../ui/CardView';

function CardDetail({ id, onClose, readAloud }: { id: string; onClose: () => void; readAloud: boolean }) {
  const card = CARD_BY_ID[id];
  const epoch = EPOCH_BY_ID[card.epoch];
  useEffect(() => {
    void db.cards.update(id, { seen: true });
    return () => stopSpeaking();
  }, [id]);
  return (
    <div className="fixed inset-0 z-20 overflow-y-auto" style={{ background: epoch.colors.bg }}>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-4 px-4 pt-[max(env(safe-area-inset-top),16px)] pb-6">
        <CardView id={id} owned size="grande" />
        <p className="rounded-2xl bg-white p-4 text-xl leading-relaxed" style={{ color: epoch.colors.ink }}>
          {card.fact}
        </p>
        <div className="mt-auto flex w-full flex-col gap-2">
          {readAloud && canSpeak() && (
            <BigButton variant="aiuto" onClick={() => speak(`${card.name}. ${card.fact}`)}>
              🔊 Ascolta
            </BigButton>
          )}
          <BigButton onClick={onClose}>Chiudi</BigButton>
        </div>
      </div>
    </div>
  );
}

export function Album({ epochId, onBack }: { epochId: EpochId; onBack: () => void }) {
  const epoch = EPOCH_BY_ID[epochId];
  const [open, setOpen] = useState<string | null>(null);
  const data = useLiveQuery(async () => {
    const owned = await db.cards.toArray();
    const settings = await db.settings.get('main');
    return { owned: new Map(owned.map((c) => [c.cardId, c])), col: await loadCollection(), readAloud: settings?.readAloud ?? true };
  }, []);
  if (!data) return null;
  const cards = CARDS.filter((c) => c.epoch === epochId);

  const hintFor = (id: string) => {
    const c = CARD_BY_ID[id];
    if (c.rare) return c.milestoneLabel;
    const need = starsForCard(data.col, id);
    return need === null ? undefined : `tra ${need} ${need === 1 ? 'stella' : 'stelle'}`;
  };

  return (
    <div className="min-h-dvh" style={{ background: epoch.colors.bg }}>
      <div className="mx-auto flex max-w-md flex-col px-4 pt-[max(env(safe-area-inset-top),12px)] pb-6">
        <header className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-bold" style={{ color: epoch.colors.ink }}>
            {epoch.name}
          </h1>
          <button type="button" onClick={onBack} className="min-h-12 rounded-xl bg-white px-4 font-bold">
            Indietro
          </button>
        </header>
        <p className="mb-4 text-lg" style={{ color: epoch.colors.ink }}>
          {epoch.intro}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {cards.map((c) => {
            const owned = data.owned.get(c.id);
            return (
              <button
                key={c.id}
                type="button"
                disabled={!owned}
                onClick={() => setOpen(c.id)}
                className="text-left"
                aria-label={owned ? c.name : 'Carta ancora da trovare'}
              >
                <CardView id={c.id} owned={!!owned} isNew={owned ? !owned.seen : false} hint={owned ? undefined : hintFor(c.id)} />
              </button>
            );
          })}
        </div>
      </div>
      {open && <CardDetail id={open} readAloud={data.readAloud} onClose={() => setOpen(null)} />}
    </div>
  );
}
