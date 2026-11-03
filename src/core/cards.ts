import { CARDS, CARD_BY_ID, STARS_PER_CARD, type CardDef } from '../content/cards';
import { EPOCHS, type Epoch, type EpochId } from '../content/epochs';
import { totalStars } from '../db/repo';
import { db } from '../db/schema';

/**
 * Ordine delle epoche a partire da quella scelta dal genitore:
 * si va avanti nel tempo e alla fine si torna alle epoche precedenti.
 * Es. partenza Greci → Greci, Romani, Medioevo, Preistoria, Egizi, Cretesi.
 */
export function epochOrder(start: EpochId = 'preistoria'): EpochId[] {
  const i = Math.max(0, EPOCHS.findIndex((e) => e.id === start));
  return [...EPOCHS.slice(i), ...EPOCHS.slice(0, i)].map((e) => e.id);
}

/** Le carte comuni nell'ordine in cui si vincono. */
export function commonOrder(start: EpochId = 'preistoria'): string[] {
  return epochOrder(start).flatMap((ep) => CARDS.filter((c) => c.epoch === ep && !c.rare).map((c) => c.id));
}

/** Un'epoca è aperta se è quella di partenza o se contiene almeno una carta posseduta. */
export function unlockedEpochs(owned: Set<string>, start: EpochId = 'preistoria'): Set<EpochId> {
  const out = new Set<EpochId>([start]);
  for (const id of owned) {
    const c = CARD_BY_ID[id];
    if (c) out.add(c.epoch);
  }
  return out;
}

export interface Collection {
  owned: Set<string>;
  stars: number;
  start: EpochId;
}

const ownedCommons = (owned: Set<string>) => [...owned].filter((id) => CARD_BY_ID[id] && !CARD_BY_ID[id].rare).length;

/** Carte comuni ancora da vincere, nell'ordine giusto. */
function missingCommons(c: Collection): string[] {
  return commonOrder(c.start).filter((id) => !c.owned.has(id));
}

/**
 * Carte che spettano e non si hanno ancora: una comune ogni 3 stelle (contando quelle già possedute,
 * così cambiare l'epoca di partenza non toglie e non regala carte) e le rare dei traguardi raggiunti.
 */
export function earnedCardIds(c: Collection, milestoneRefs: Set<string>): string[] {
  const due = Math.floor(c.stars / STARS_PER_CARD) - ownedCommons(c.owned);
  const commons = due > 0 ? missingCommons(c).slice(0, due) : [];
  const rares = CARDS.filter((x) => x.rare && x.milestone && milestoneRefs.has(x.milestone) && !c.owned.has(x.id)).map(
    (x) => x.id,
  );
  return [...commons, ...rares];
}

/** Stelle che mancano per la carta comune in posizione `k` tra quelle ancora da vincere. */
function starsFor(c: Collection, k: number): number {
  return Math.max(1, (ownedCommons(c.owned) + k + 1) * STARS_PER_CARD - c.stars);
}

export interface NextCard {
  card: CardDef;
  starsNeeded: number;
}

export function nextCommonCard(c: Collection): NextCard | null {
  const list = missingCommons(c);
  if (!list.length) return null;
  return { card: CARD_BY_ID[list[0]], starsNeeded: starsFor(c, 0) };
}

/** Stelle che mancano per una carta comune ancora da vincere (null se è già posseduta o è rara). */
export function starsForCard(c: Collection, id: string): number | null {
  const k = missingCommons(c).indexOf(id);
  return k < 0 ? null : starsFor(c, k);
}

/** Stelle che mancano per aprire un'epoca (con la sua prima carta comune). */
export function starsToOpen(epoch: EpochId, c: Collection): number {
  const k = missingCommons(c).findIndex((id) => CARD_BY_ID[id].epoch === epoch);
  return k < 0 ? 0 : starsFor(c, k);
}

/** L'epoca in cui sta proseguendo la raccolta ("sei qui"). */
export function currentEpoch(c: Collection): EpochId {
  const next = nextCommonCard(c);
  return next ? next.card.epoch : c.start;
}

export async function loadCollection(): Promise<Collection> {
  const settings = await db.settings.get('main');
  return {
    owned: new Set((await db.cards.toArray()).map((x) => x.cardId)),
    stars: await totalStars(),
    start: settings?.startEpoch ?? 'preistoria',
  };
}

export interface CardSync {
  newCards: CardDef[];
  newEpochs: Epoch[];
}

/** Assegna le carte guadagnate e non ancora possedute. Si può chiamare quante volte si vuole. */
export async function syncCards(sessionId?: string): Promise<CardSync> {
  const col = await loadCollection();
  const refs = new Set(
    (await db.rewards.where('kind').equals('traguardo').toArray()).map((r) => r.ref).filter((r): r is string => !!r),
  );
  const earned = earnedCardIds(col, refs);
  if (!earned.length) return { newCards: [], newEpochs: [] };

  const now = Date.now();
  await db.cards.bulkPut(earned.map((cardId) => ({ cardId, unlockedAt: now, seen: false })));
  await db.rewards.bulkAdd(
    earned.map((id) => ({ at: now, sessionId, kind: 'carta' as const, reason: CARD_BY_ID[id].name, ref: `carta-${id}` })),
  );
  const before = unlockedEpochs(col.owned, col.start);
  const after = unlockedEpochs(new Set([...col.owned, ...earned]), col.start);
  return {
    newCards: earned.map((id) => CARD_BY_ID[id]),
    newEpochs: EPOCHS.filter((e) => after.has(e.id) && !before.has(e.id)),
  };
}
