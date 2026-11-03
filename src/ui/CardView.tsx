import { CARD_BY_ID, type CardDef } from '../content/cards';
import { EPOCH_BY_ID } from '../content/epochs';
import { Art } from '../content/art';

const KIND_LABEL: Record<CardDef['kind'], string> = {
  personaggio: 'Personaggio',
  monumento: 'Monumento',
  oggetto: 'Oggetto',
  luogo: 'Luogo',
  animale: 'Animale',
  scoperta: 'Scoperta',
};

/** Carta collezionabile: cornice con i colori dell'epoca, bordo dorato per le rare. */
export function CardView({
  id,
  owned,
  size = 'mini',
  isNew = false,
  hint,
}: {
  id: string;
  owned: boolean;
  size?: 'mini' | 'grande';
  isNew?: boolean;
  hint?: string;
}) {
  const card = CARD_BY_ID[id];
  const epoch = EPOCH_BY_ID[card.epoch];
  const big = size === 'grande';
  const artSize = big ? 220 : 88;
  const border = card.rare ? '#d9a520' : epoch.colors.accent;

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl ${big ? 'w-[min(100%,300px)] p-3' : 'w-full p-1.5'}`}
      style={{
        background: owned ? epoch.colors.soft : '#ece8e0',
        border: `${card.rare ? 4 : 3}px solid ${owned ? border : '#cfc9bd'}`,
        boxShadow: owned && card.rare ? 'inset 0 0 0 2px #fff4cf' : undefined,
      }}
    >
      {isNew && owned && (
        <span className="absolute -top-2 -right-2 z-10 rounded-full bg-terracotta px-2 py-0.5 text-xs font-bold text-white">
          nuova
        </span>
      )}
      <div
        className="flex w-full items-center justify-center overflow-hidden rounded-xl"
        style={{ background: owned ? epoch.colors.bg : '#e2ddd3' }}
      >
        {owned ? (
          <Art id={id} size={artSize} />
        ) : (
          <div className="flex items-center justify-center" style={{ width: artSize, height: artSize }}>
            <span className="text-4xl font-bold text-[#b5ae9f]">?</span>
          </div>
        )}
      </div>
      <p
        className={`mt-1 w-full text-center font-bold leading-tight ${big ? 'text-2xl' : 'text-[13px]'}`}
        style={{ color: owned ? epoch.colors.ink : '#8a8478' }}
      >
        {owned ? card.name : card.rare ? 'Carta rara' : '???'}
      </p>
      {big && owned && (
        <p className="text-sm font-bold tracking-wide uppercase" style={{ color: card.rare ? '#a87a12' : epoch.colors.accent }}>
          {card.rare ? '★ Rara · ' : ''}
          {KIND_LABEL[card.kind]} · {epoch.name}
        </p>
      )}
      {!owned && hint && <p className="mt-0.5 text-center text-[11px] leading-tight text-[#8a8478]">{hint}</p>}
    </div>
  );
}
