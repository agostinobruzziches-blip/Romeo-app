import { beforeEach, describe, expect, it } from 'vitest';
import { finalizeSession, awardMedal } from '../core/rewards';
import { exportBackup, importBackup, validateBackup } from '../db/backup';
import { checkPin, ensureInitialized, setPin, startSession, totalStars } from '../db/repo';
import { useTestDb } from '../db/schema';

let n = 0;
beforeEach(async () => {
  useTestDb(`test-${n++}`);
  await ensureInitialized();
});

describe('database', () => {
  it('inizializza 55 fatti e 9 tabelline', async () => {
    const { db } = await import('../db/schema');
    expect(await db.facts.count()).toBe(55);
    expect(await db.tableProgress.count()).toBe(9);
  });
  it('PIN', async () => {
    await setPin('1234');
    expect(await checkPin('1234')).toBe(true);
    expect(await checkPin('0000')).toBe(false);
  });
  it('fine missione: stella, medaglie e primo traguardo; nulla si toglie', async () => {
    const s = await startSession(20, false, 'prova');
    await awardMedal(s.id, '7x8');
    const sum = await finalizeSession({ ...s, tenacityMedals: 1, firstTryCorrect: 15 }, 'stanchezza', ['7 × 8 ora è un fatto sicuro'], []);
    expect(sum.stars).toEqual(['Missione completata', '7 × 8 ora è un fatto sicuro']);
    expect(sum.conquiste).toBe(16);
    expect(sum.milestones).toContain('Prima medaglia della tenacia');
    expect(await totalStars()).toBe(2);
    const s2 = await startSession(20, false, 'prova');
    const sum2 = await finalizeSession(s2, 'interrotta', [], []);
    expect(sum2.stars).toHaveLength(0);
    expect(await totalStars()).toBe(2);
  });
  it('backup: esporta, valida, reimporta', async () => {
    await setPin('4321');
    const b = await exportBackup();
    expect(() => validateBackup({ app: 'altro' })).toThrow();
    const again = validateBackup(JSON.parse(JSON.stringify(b)));
    await importBackup(again);
    expect(await checkPin('4321')).toBe(true);
  });
});
