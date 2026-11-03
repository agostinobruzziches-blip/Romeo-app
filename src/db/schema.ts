import Dexie, { type Table } from 'dexie';
import type { EpochId } from '../content/epochs';

export type ModuleId = 'tabelline' | 'problemi';
export type ItemRole = 'riscaldamento' | 'cuore' | 'ripasso' | 'chiusura';
export type EndReason = 'completata' | 'stanchezza' | 'genitore' | 'interrotta';
export type ErrorType = 'calcolo' | 'operazione' | 'dati' | 'domanda';
export type Box = 0 | 1 | 2 | 3 | 4 | 5;
export type Stage = 1 | 2 | 3 | 4;

export interface Settings {
  id: 'main';
  childName: string;
  missionMinutes: number;
  activeModules: ModuleId[];
  activeTables: number[];
  soundOn: boolean;
  volume: number;
  readAloud: boolean;
  parentLabel: string;
  /** Epoca da cui parte la raccolta delle carte (default Preistoria). */
  startEpoch?: EpochId;
  pinHash: string;
  pinSalt: string;
  createdAt: number;
}

/** Un fatto delle tabelline: 7×8 e 8×7 condividono la chiave "7x8". */
export interface Fact {
  key: string;
  a: number;
  b: number;
  box: Box;
  dueDay: string;
  seen: number;
  firstTry: number;
  afterRetry: number;
  wrong: number;
  helpUsed: number;
  medianMs: number;
  lastSeenAt: number;
  /** Ultimo giorno in cui il livello è salito: si sale al massimo una volta al giorno. */
  lastPromotedDay: string;
  /** Il fatto è diventato "sicuro" (livello 3) almeno una volta. */
  everSecure: boolean;
}

export interface TableProgress {
  table: number;
  stage: Stage;
  goodSessionsAtStage: number;
  conqueredAt?: number;
}

export interface FatigueSignal {
  kind: 'errori-ravvicinati' | 'risposte-a-caso' | 'rallentamento';
  at: number;
  itemIndex: number;
}

export interface Session {
  id: string;
  day: string;
  startedAt: number;
  endedAt?: number;
  plannedItems: number;
  doneItems: number;
  endReason?: EndReason;
  isRepeat: boolean;
  fatigueSignals: FatigueSignal[];
  fatigueOffered: boolean;
  firstTryCorrect: number;
  tenacityMedals: number;
  unsolved: number;
  helpCount: number;
  parentHelpCount: number;
  /** Etichetta leggibile, es. "Tabellina del 7 · mescolata". */
  focusLabel?: string;
}

export interface Attempt {
  id?: number;
  sessionId: string;
  moduleId: ModuleId;
  itemKey: string;
  itemIndex: number;
  role: ItemRole;
  format: string;
  tag?: string;
  category?: string;
  attemptNo: number;
  correct: boolean;
  errorType?: ErrorType;
  ms: number;
  helpUsed?: string;
  at: number;
}

export type RewardKind = 'stella' | 'medaglia-tenacia' | 'carta' | 'bonus-serie' | 'traguardo';

export interface RewardEvent {
  id?: number;
  at: number;
  sessionId?: string;
  kind: RewardKind;
  reason: string;
  ref?: string;
}

export interface OwnedCard {
  cardId: string;
  unlockedAt: number;
  seen: boolean;
}

export interface ProblemProgress {
  category: string;
  level: 1 | 2 | 3 | 4 | 5;
  goodSessions: number;
}

export class ViaggioDB extends Dexie {
  settings!: Table<Settings, string>;
  facts!: Table<Fact, string>;
  tableProgress!: Table<TableProgress, number>;
  sessions!: Table<Session, string>;
  attempts!: Table<Attempt, number>;
  rewards!: Table<RewardEvent, number>;
  cards!: Table<OwnedCard, string>;
  problemProgress!: Table<ProblemProgress, string>;

  constructor(name = 'viaggio-nel-tempo') {
    super(name);
    this.version(1).stores({
      settings: 'id',
      facts: 'key, box, dueDay',
      tableProgress: 'table',
      sessions: 'id, day, startedAt',
      attempts: '++id, sessionId, moduleId, itemKey, category, at',
      rewards: '++id, kind, at, sessionId, ref',
      cards: 'cardId, unlockedAt',
      problemProgress: 'category',
    });
  }
}

export const TABLE_NAMES = [
  'settings',
  'facts',
  'tableProgress',
  'sessions',
  'attempts',
  'rewards',
  'cards',
  'problemProgress',
] as const;

export let db = new ViaggioDB();

/** Solo per i test: usa un database separato. */
export function useTestDb(name: string): ViaggioDB {
  db = new ViaggioDB(name);
  return db;
}
