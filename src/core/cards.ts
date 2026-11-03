import { CARDS, CARD_BY_ID, COMMON_ORDER, STARS_PER_CARD, type CardDef } from '../content/cards';
import { EPOCHS, type Epoch, type EpochId } from '../content/epochs';
import { totalStars } from '../db/repo';
import { db } from '../db/schema';

/** Un'epoca è aperta se è la prima o se contiene almeno una carta posseduta. */
export function unlockedEpochs(owned: Set<string>): Set<EpochId> {
  const out = new Set<EpochId>([EPOCHS[0].id]);
  for (const id of owned) {
    const c = CARD_BY_ID[id];
    if (c) out.add(c.epoch);
  }
  return out;
}

/** Quali carte spettano: le comuni in ordine (una ogni 3 stelle), le rare per i traguardi raggiunti. */
export function earnedCardIds(stars: number, milestoneRefs: Set<string>): string[] {
  const commons = COMMON_ORDER.slice(0, Math.floor(stars / STARS_PER_CARD));
  const rares = CARDS.filter((c) => c.rare && c.milestone && milestoneRefs.has(c.milestone)).map((c) => c.id);
  return [...commons, ...rares];
}

export interface NextCard {
  card: CardDef;
  starsNeeded: number;
}

export function nextCommonCard(stars: number): NextCard | null {
  const idx = Math.floor(stars / STARS_PER_CARD);
  if (idx >= COMMON_ORDER.length) return null;
  return { card: CARD_BY_ID[COMMON_ORDER[idx]], starsNeeded: (idx + 1) * STARS_PER_CARD - stars };
}

/** Stelle che mancano per aprire un'epoca (con la sua prima carta comune). */
export function starsToOpen(epoch: EpochId, stars: number): number {
  const idx = COMMON_ORDER.findIndex((id) => CARD_BY_ID[id].epoch === epoch);
  return Math.max(0, (idx + 1) * STARS_PER_CARD - stars);
}

export interface CardSync {
  newCards: CardDef[];
  newEpochs: Epoch[];
}

/** Assegna le carte guadagnate e non ancora possedute. Si può chiamare quante volte si vuole. */
export async function syncCards(sessionId?: string): Promise<CardSync> {
  const stars = await totalStars();
  const refs = new Set(
    (await db.rewards.where('kind').equals('traguardo').toArray()).map((r) => r.ref).filter((r): r is string => !!r),
  );
  const ownedBefore = new Set((await db.cards.toArray()).map((c) => c.cardId));
  const earned = earnedCardIds(stars, refs).filter((id) => !ownedBefore.has(id));
  if (!earned.length) return { newCards: [], newEpochs: [] };

  const now = Date.now();
  await db.cards.bulkPut(earned.map((cardId) => ({ cardId, unlockedAt: now, seen: false })));
  await db.rewards.bulkAdd(
    earned.map((id) => ({ at: now, sessionId, kind: 'carta' as const, reason: CARD_BY_ID[id].name, ref: `carta-${id}` })),
  );
  const before = unlockedEpochs(ownedBefore);
  const after = unlockedEpochs(new Set([...ownedBefore, ...earned]));
  return {
    newCards: earned.map((id) => CARD_BY_ID[id]),
    newEpochs: EPOCHS.filter((e) => after.has(e.id) && !before.has(e.id)),
  };
}
