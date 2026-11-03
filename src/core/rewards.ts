import { completedSessions, totalMedals, totalStars } from '../db/repo';
import { db, type EndReason, type RewardEvent, type Session } from '../db/schema';
import { dayKey } from './dates';
import { STREAK_BONUS_AT, computeStreak, type StreakInfo } from './streak';

export const MEDAL_MILESTONES = [1, 10, 25, 50, 100, 200];
export const DAY_MILESTONES = [7, 30, 60, 100];

export interface RewardSummary {
  stars: string[];
  medals: number;
  firstTry: number;
  conquiste: number;
  milestones: string[];
  streak: StreakInfo;
  totalStars: number;
  totalMedals: number;
}

async function hasRef(ref: string): Promise<boolean> {
  return (await db.rewards.where('ref').equals(ref).count()) > 0;
}

/** La medaglia della tenacia viene salvata subito, così non si perde se la missione si interrompe. */
export async function awardMedal(sessionId: string, reason: string): Promise<void> {
  await db.rewards.add({ at: Date.now(), sessionId, kind: 'medaglia-tenacia', reason });
}

/** Le stelle: si aggiungono soltanto, non si tolgono mai. */
export async function finalizeSession(
  session: Session,
  reason: EndReason,
  improvements: string[],
  milestones: Array<{ ref: string; reason: string }>,
): Promise<RewardSummary> {
  const now = Date.now();
  const ended: Session = { ...session, endedAt: now, endReason: reason };
  const events: RewardEvent[] = [];
  const stars: string[] = [];
  const reached: string[] = [];

  const wasDoneToday = (await completedSessions()).some((s) => s.day === session.day && s.id !== session.id);
  await db.sessions.put(ended);

  if (reason !== 'interrotta') {
    stars.push('Missione completata');
    if (improvements.length) stars.push(improvements[0]);

    // Serie di giorni: bonus una volta per traguardo e per serie
    const days = (await completedSessions()).map((s) => s.day);
    const streak = computeStreak(days, dayKey());
    if (!wasDoneToday && streak.startDay && STREAK_BONUS_AT.includes(streak.current)) {
      const ref = `serie-${streak.current}-${streak.startDay}`;
      if (!(await hasRef(ref))) {
        events.push({ at: now, sessionId: session.id, kind: 'bonus-serie', reason: `${streak.current} giorni di esplorazione`, ref });
        stars.push(`Bonus: ${streak.current} giorni di esplorazione`);
      }
    }

    // Traguardi
    const medals = await totalMedals();
    const all = [...milestones];
    for (const m of MEDAL_MILESTONES) {
      if (medals >= m) all.push({ ref: `medaglie-${m}`, reason: m === 1 ? 'Prima medaglia della tenacia' : `${m} medaglie della tenacia` });
    }
    for (const d of DAY_MILESTONES) {
      if (streak.totalDays >= d) all.push({ ref: `giorni-${d}`, reason: `${d} giorni di esplorazione in tutto` });
    }
    for (const m of all) {
      if (await hasRef(m.ref)) continue;
      events.push({ at: now, sessionId: session.id, kind: 'traguardo', reason: m.reason, ref: m.ref });
      reached.push(m.reason);
    }
  }

  for (const s of stars.filter((s) => !s.startsWith('Bonus'))) {
    events.push({ at: now, sessionId: session.id, kind: 'stella', reason: s });
  }
  if (events.length) await db.rewards.bulkAdd(events);

  const days = (await completedSessions()).map((s) => s.day);
  return {
    stars,
    medals: ended.tenacityMedals,
    firstTry: ended.firstTryCorrect,
    conquiste: ended.firstTryCorrect + ended.tenacityMedals,
    milestones: reached,
    streak: computeStreak(days, dayKey()),
    totalStars: await totalStars(),
    totalMedals: await totalMedals(),
  };
}
