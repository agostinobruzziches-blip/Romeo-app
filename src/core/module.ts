import type { FC, ReactNode } from 'react';
import type { Attempt, ErrorType, ItemRole, ModuleId, Session, Settings } from '../db/schema';
import type { Rng } from './random';

/** Un esercizio della missione, prodotto dal generatore di un modulo. */
export interface MissionItem<I = unknown> {
  uid: string;
  moduleId: ModuleId;
  role: ItemRole;
  /** Chiave stabile dell'elemento di sapere (es. "7x8"), usata per statistiche e ripasso. */
  key: string;
  format: string;
  tag?: string;
  category?: string;
  data: I;
}

export interface PlanContext {
  settings: Settings;
  today: string;
  rng: Rng;
}

export interface PlanResult<I> {
  items: MissionItem<I>[];
  /** Frase breve per la schermata d'inizio, es. "la tabellina del 7, mescolata". */
  focusLabel: string;
}

export interface Evaluation {
  correct: boolean;
  errorType?: ErrorType;
}

export interface ItemOutcome {
  firstTry: boolean;
  solved: boolean;
  wrongAttempts: number;
  helpUsed: boolean;
  ms: number;
}

/** Cosa è successo di bello registrando un esito: alimenta le stelle di miglioramento. */
export interface RecordResult {
  improvements: string[];
}

export interface SessionModuleResult {
  improvements: string[];
  milestones: Array<{ ref: string; reason: string }>;
}

export interface ExerciseProps<I, A> {
  item: MissionItem<I>;
  attemptNo: number;
  /** Disabilita l'inserimento (es. mentre si mostra il feedback). */
  locked: boolean;
  onSubmit: (answer: A) => void;
  /** Spazio fisso per il messaggio "Quasi! Riproviamo" o "Giusto!". */
  feedback: ReactNode;
  /** Pulsanti "Aiutami" e "Chiedi a papà/mamma", sempre nello stesso posto. */
  toolbar: ReactNode;
}

export interface LearningModule<I = any, A = any> {
  id: ModuleId;
  title: string;
  estimatedSecondsPerItem: number;

  /** 1. GENERATORE */
  plan(ctx: PlanContext, count: number): Promise<PlanResult<I>>;
  /** Variante dello stesso esercizio da riproporre più avanti nella missione. */
  replay(item: MissionItem<I>, rng: Rng): MissionItem<I>;
  /** Dopo un errore, l'esercizio da mostrare per riprovare (es. vero/falso → "quanto fa?"). */
  retryItem(item: MissionItem<I>): MissionItem<I>;

  /** 2. VALUTAZIONE */
  evaluate(item: MissionItem<I>, answer: A): Evaluation;
  Exercise: FC<ExerciseProps<I, A>>;
  maxHelpLevel: number;
  Help: FC<{ item: MissionItem<I>; level: number }>;
  Solution: FC<{ item: MissionItem<I> }>;
  parentTip(item: MissionItem<I>, settings: Settings): string;

  /** Aggiorna la padronanza dopo l'esito definitivo dell'esercizio. */
  record(item: MissionItem<I>, outcome: ItemOutcome, today: string): Promise<RecordResult>;
  /** Fine sessione: avanzamento tappe e traguardi. */
  onSessionEnd(session: Session, attempts: Attempt[]): Promise<SessionModuleResult>;

  /** 3. STATISTICHE */
  ParentPanel: FC;
  tutorSummary(sinceDay: string): Promise<string[]>;
}
