import { beforeEach, describe, expect, it } from 'vitest';
import { commonOrder, currentEpoch, earnedCardIds, epochOrder, nextCommonCard, starsToOpen, syncCards, unlockedEpochs, type Collection } from '../core/cards';
import { finalizeSession } from '../core/rewards';
import { ART } from '../content/art';
import { CARDS } from '../content/cards';
import { EPOCHS } from '../content/epochs';
import { ensureInitialized, startSession, updateSettings } from '../db/repo';
import { useTestDb } from '../db/schema';

describe('catalogo carte', () => {
  it('6 epoche, 8 carte ciascuna (6 comuni + 2 rare), tutte illustrate', () => {
    expect(EPOCHS).toHaveLength(6);
    for (const e of EPOCHS) {
      const list = CARDS.filter((c) => c.epoch === e.id);
      expect(list).toHaveLength(8);
      expect(list.filter((c) => c.rare)).toHaveLength(2);
    }
    for (const c of CARDS) {
      expect(ART[c.id], c.id).toBeTypeOf('function');
      expect(c.fact.length).toBeLessThan(200);
      expect(c.source.length).toBeGreaterThan(5);
    }
  });
  it('ogni traguardo sblocca al massimo una carta rara, e ogni rara ha un traguardo', () => {
    const rares = CARDS.filter((c) => c.rare);
    expect(rares.every((c) => c.milestone && c.milestoneLabel)).toBe(true);
    expect(new Set(rares.map((c) => c.milestone)).size).toBe(rares.length);
  });
  it('tutte le tabelline da 2 a 10 hanno una carta rara', () => {
    for (let t = 2; t <= 10; t++) expect(CARDS.some((c) => c.milestone === `tabellina-${t}`), `t${t}`).toBe(true);
  });
});

const col = (stars: number, owned: string[] = [], start: Collection['start'] = 'preistoria'): Collection => ({
  stars,
  owned: new Set(owned),
  start,
});

describe('sblocco', () => {
  it('una carta comune ogni 3 stelle, in ordine di epoca', () => {
    const order = commonOrder();
    expect(order).toHaveLength(36);
    expect(earnedCardIds(col(2), new Set())).toEqual([]);
    expect(earnedCardIds(col(3), new Set())).toEqual([order[0]]);
    expect(earnedCardIds(col(7), new Set())).toHaveLength(2);
    expect(earnedCardIds(col(7, [order[0]]), new Set())).toEqual([order[1]]);
    expect(nextCommonCard(col(7, order.slice(0, 2)))).toMatchObject({ starsNeeded: 2 });
  });
  it('le rare arrivano con i traguardi', () => {
    expect(earnedCardIds(col(0), new Set(['tabellina-7']))).toEqual(['gre-civetta']);
    expect(earnedCardIds(col(0, ['gre-civetta']), new Set(['tabellina-7']))).toEqual([]);
  });
  it('le epoche si aprono con la loro prima carta', () => {
    expect([...unlockedEpochs(new Set())]).toEqual(['preistoria']);
    expect(unlockedEpochs(new Set()).has('egizi')).toBe(false);
    expect(unlockedEpochs(new Set(['egi-piramide'])).has('egizi')).toBe(true);
    expect(starsToOpen('egizi', col(0))).toBe(21);
  });
});

describe('epoca di partenza', () => {
  it('si parte dai Greci, si va avanti e poi si torna indietro', () => {
    expect(epochOrder('greci')).toEqual(['greci', 'romani', 'medioevo', 'preistoria', 'egizi', 'cretesi']);
    const c = col(3, [], 'greci');
    expect(unlockedEpochs(c.owned, 'greci').has('greci')).toBe(true);
    expect(earnedCardIds(c, new Set())).toEqual(['gre-partenone']);
    expect(currentEpoch(c)).toBe('greci');
    expect(starsToOpen('romani', c)).toBe(18);
  });
  it('cambiare partenza non toglie e non regala carte', () => {
    const preist = commonOrder('preistoria').slice(0, 2);
    // 2 carte della Preistoria già vinte con 6 stelle: passando ai Greci non arriva nulla
    expect(earnedCardIds(col(6, preist, 'greci'), new Set())).toEqual([]);
    // con 9 stelle arriva la prima carta dei Greci
    expect(earnedCardIds(col(9, preist, 'greci'), new Set())).toEqual(['gre-partenone']);
  });
});

let n = 0;
describe('premi e carte nel database', () => {
  beforeEach(async () => {
    useTestDb(`cards-${n++}`);
    await ensureInitialized();
  });
  it('fine missione: arrivano le carte e la nuova epoca, senza doppioni', async () => {
    let last;
    for (let i = 0; i < 3; i++) {
      const s = await startSession(10, i > 0, 'prova');
      last = await finalizeSession(s, 'completata', i === 0 ? ['miglioramento'] : [], []);
    }
    // 1ª missione: 2 stelle; 2ª: 1 stella → 3 stelle = 1 carta
    expect(last!.totalStars).toBeGreaterThanOrEqual(3);
    const again = await syncCards();
    expect(again.newCards).toHaveLength(0);
  });
  it('con partenza Greci la prima carta vinta è dei Greci', async () => {
    await updateSettings({ startEpoch: 'greci' });
    for (let i = 0; i < 2; i++) {
      const s = await startSession(10, i > 0, 'prova');
      await finalizeSession(s, 'completata', ['miglioramento'], []);
    }
    const { db } = await import('../db/schema');
    const owned = (await db.cards.toArray()).map((c) => c.cardId);
    expect(owned).toContain('gre-partenone');
  });
  it('carta rara per la tabellina conquistata', async () => {
    const s = await startSession(10, false, 'prova');
    const sum = await finalizeSession(s, 'completata', [], [{ ref: 'tabellina-2', reason: 'Tabellina del 2 conquistata' }]);
    expect(sum.newCards.map((c) => c.id)).toContain('pre-mani');
  });
});
