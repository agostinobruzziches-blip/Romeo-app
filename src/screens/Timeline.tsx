import { useLiveQuery } from 'dexie-react-hooks';
import { currentEpoch, loadCollection, nextCommonCard, starsToOpen, unlockedEpochs } from '../core/cards';
import { CARDS } from '../content/cards';
import { EPOCHS, type EpochId } from '../content/epochs';
import { Art, EPOCH_EMBLEM } from '../content/art';
import { db } from '../db/schema';
import { BigButton } from '../ui/BigButton';
import { Guide } from '../ui/Guide';

/** La linea del tempo: ogni epoca è un mondo da sbloccare, dall'alto (più antica) in basso. */
export function Timeline({ onOpen, onExit }: { onOpen: (e: EpochId) => void; onExit: () => void }) {
  const data = useLiveQuery(async () => {
    const col = await loadCollection();
    return { col, owned: col.owned, unseen: new Set((await db.cards.filter((c) => !c.seen).toArray()).map((c) => c.cardId)) };
  }, []);
  if (!data) return null;
  const open = unlockedEpochs(data.owned, data.col.start);
  const current = currentEpoch(data.col);
  const next = nextCommonCard(data.col);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(env(safe-area-inset-top),12px)] pb-6">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-bold text-egeo">Linea del tempo</h1>
        <button type="button" onClick={onExit} className="min-h-12 rounded-xl bg-white px-4 font-bold">
          Indietro
        </button>
      </header>
      <div className="mb-4">
        <Guide size={70}>
          {next ? (
            <>
              Prossima carta tra <b>{next.starsNeeded}</b> {next.starsNeeded === 1 ? 'stella' : 'stelle'}.
            </>
          ) : (
            'Hai tutte le carte comuni. Ora caccia alle carte rare!'
          )}
        </Guide>
      </div>
      <ol className="relative flex flex-col gap-4 pl-6">
        <span className="absolute top-4 bottom-4 left-2 w-1 rounded-full bg-carta-2" aria-hidden="true" />
        {EPOCHS.map((e) => {
          const isOpen = open.has(e.id);
          const cards = CARDS.filter((c) => c.epoch === e.id);
          const have = cards.filter((c) => data.owned.has(c.id)).length;
          const fresh = cards.some((c) => data.unseen.has(c.id));
          const missing = starsToOpen(e.id, data.col);
          return (
            <li key={e.id} className="relative">
              <span
                className="absolute top-1/2 -left-[22px] h-5 w-5 -translate-y-1/2 rounded-full border-4 border-carta"
                style={{ background: isOpen ? e.colors.accent : '#cfc9bd' }}
                aria-hidden="true"
              />
              <button
                type="button"
                disabled={!isOpen}
                onClick={() => onOpen(e.id)}
                className="flex w-full items-center gap-3 rounded-2xl p-2 text-left disabled:cursor-default"
                style={{ background: isOpen ? e.colors.bg : '#ece8e0', border: `3px solid ${isOpen ? e.colors.accent : '#ddd7cb'}` }}
              >
                <div className="shrink-0 overflow-hidden rounded-xl" style={{ background: isOpen ? e.colors.soft : '#e2ddd3' }}>
                  <Art id={EPOCH_EMBLEM[e.id]} size={76} muted={!isOpen} />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold" style={{ color: isOpen ? e.colors.ink : '#8a8478' }}>
                    {e.name}
                    {current === e.id && <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs align-middle">sei qui</span>}
                  </p>
                  <p className="text-sm" style={{ color: isOpen ? e.colors.ink : '#8a8478' }}>
                    {e.period}
                  </p>
                  {isOpen ? (
                    <p className="mt-1 text-base font-bold" style={{ color: e.colors.accent }}>
                      {have} {have === 1 ? 'carta' : 'carte'} su {cards.length}
                      {fresh && <span className="ml-2 rounded-full bg-terracotta px-2 py-0.5 text-xs text-white">da guardare</span>}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-[#8a8478]">
                      🔒 Si apre tra {missing} {missing === 1 ? 'stella' : 'stelle'}
                    </p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-6">
        <BigButton variant="tenue" onClick={onExit}>
          Torna alla missione
        </BigButton>
      </div>
    </div>
  );
}
