import { dayKey } from '../core/dates';
import { allFactPairs, newFact } from '../modules/tabelline/leitner';
import { INTRO_ORDER } from '../modules/tabelline/stages';
import { db, type Attempt, type EndReason, type ModuleId, type Session, type Settings } from './schema';

export const DEFAULT_SETTINGS: Settings = {
  id: 'main',
  childName: 'Esploratore',
  missionMinutes: 9,
  activeModules: ['tabelline'],
  activeTables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  soundOn: true,
  volume: 0.2,
  readAloud: true,
  parentLabel: 'papà/mamma',
  startEpoch: 'preistoria',
  pinHash: '',
  pinSalt: '',
  createdAt: 0,
};

/** Prima apertura: crea impostazioni, i 55 fatti e l'avanzamento delle tabelline. */
export async function ensureInitialized(): Promise<void> {
  await db.transaction('rw', db.settings, db.facts, db.tableProgress, async () => {
    const existing = await db.settings.get('main');
    if (!existing) await db.settings.put({ ...DEFAULT_SETTINGS, createdAt: Date.now() });
    if ((await db.facts.count()) === 0) {
      const today = dayKey();
      await db.facts.bulkPut(allFactPairs().map(([a, b]) => newFact(a, b, today)));
    }
    if ((await db.tableProgress.count()) === 0) {
      await db.tableProgress.bulkPut(INTRO_ORDER.map((table) => ({ table, stage: 1 as const, goodSessionsAtStage: 0 })));
    }
  });
}

export async function getSettings(): Promise<Settings> {
  return (await db.settings.get('main')) ?? { ...DEFAULT_SETTINGS };
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const s = await getSettings();
  await db.settings.put({ ...s, ...patch, id: 'main' });
}

// ---------- PIN genitori ----------

async function hash(text: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback (pagina non sicura, es. http in rete locale): basta a tenere lontano un bambino.
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return `fnv-${(h >>> 0).toString(16)}`;
}

export async function setPin(pin: string): Promise<void> {
  const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
  await updateSettings({ pinSalt: salt, pinHash: await hash(salt + pin) });
}

export async function checkPin(pin: string): Promise<boolean> {
  const s = await getSettings();
  if (!s.pinHash) return false;
  return (await hash(s.pinSalt + pin)) === s.pinHash;
}

// ---------- Sessioni ----------

export async function startSession(plannedItems: number, isRepeat: boolean, focusLabel: string): Promise<Session> {
  // le missioni lasciate a metà diventano "interrotte"
  const open = await db.sessions.filter((s) => !s.endedAt).toArray();
  for (const s of open) await db.sessions.update(s.id, { endedAt: Date.now(), endReason: 'interrotta' });

  const session: Session = {
    id: `s-${Date.now().toString(36)}`,
    day: dayKey(),
    startedAt: Date.now(),
    plannedItems,
    doneItems: 0,
    isRepeat,
    fatigueSignals: [],
    fatigueOffered: false,
    firstTryCorrect: 0,
    tenacityMedals: 0,
    unsolved: 0,
    helpCount: 0,
    parentHelpCount: 0,
    focusLabel,
  };
  await db.sessions.put(session);
  return session;
}

export async function saveSession(session: Session): Promise<void> {
  await db.sessions.put(session);
}

export async function addAttempt(a: Attempt): Promise<void> {
  await db.attempts.add(a);
}

export const COMPLETED: EndReason[] = ['completata', 'stanchezza', 'genitore'];

export async function completedSessions(): Promise<Session[]> {
  return (await db.sessions.toArray()).filter((s) => s.endReason && COMPLETED.includes(s.endReason));
}

export async function missionDoneToday(): Promise<boolean> {
  const today = dayKey();
  return (await db.sessions.where('day').equals(today).toArray()).some(
    (s) => s.endReason && COMPLETED.includes(s.endReason),
  );
}

/** Tempi dei primi tentativi recenti, per dimensionare la missione. */
export async function recentFirstAttemptMs(moduleId: ModuleId = 'tabelline', limit = 60): Promise<number[]> {
  const list = await db.attempts.orderBy('at').reverse().limit(limit * 4).toArray();
  return list
    .filter((a) => a.attemptNo === 1 && a.moduleId === moduleId)
    .slice(0, limit)
    .map((a) => a.ms);
}

export async function totalStars(): Promise<number> {
  return db.rewards.where('kind').anyOf('stella', 'bonus-serie').count();
}

export async function totalMedals(): Promise<number> {
  return db.rewards.where('kind').equals('medaglia-tenacia').count();
}
