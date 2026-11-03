import { beforeEach, describe, expect, it } from 'vitest';
import { earnedCardIds, nextCommonCard, starsToOpen, syncCards, unlockedEpochs } from '../core/cards';
import { finalizeSession } from '../core/rewards';
import { ART } from '../content/art';
import { CARDS, COMMON_ORDER } from '../content/cards';
import { EPOCHS } from '../content/epochs';
import { ensureInitialized, startSession } from '../db/repo';
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

describe('sblocco', () => {
  it('una carta comune ogni 3 stelle, in ordine di epoca', () => {
    expect(earnedCardIds(2, new Set())).toEqual([]);
    expect(earnedCardIds(3, new Set())).toEqual([COMMON_ORDER[0]]);
    expect(earnedCardIds(7, new Set())).toHaveLength(2);
    expect(nextCommonCard(7)).toMatchObject({ starsNeeded: 2 });
  });
  it('le rare arrivano con i traguardi', () => {
    expect(earnedCardIds(0, new Set(['tabellina-7']))).toEqual(['gre-civetta']);
  });
  it('le epoche si aprono con la loro prima carta', () => {
    expect([...unlockedEpochs(new Set())]).toEqual(['preistoria']);
    expect(unlockedEpochs(new Set()).has('egizi')).toBe(false);
    expect(unlockedEpochs(new Set(['egi-piramide'])).has('egizi')).toBe(true);
    expect(starsToOpen('egizi', 0)).toBe(21);
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
  it('carta rara per la tabellina conquistata', async () => {
    const s = await startSession(10, false, 'prova');
    const sum = await finalizeSession(s, 'completata', [], [{ ref: 'tabellina-2', reason: 'Tabellina del 2 conquistata' }]);
    expect(sum.newCards.map((c) => c.id)).toContain('pre-mani');
  });
});
