export type Op = '+' | '-' | '×' | ':';

export type ProblemCategory =
  | 'aggiungere'
  | 'togliere'
  | 'confronto'
  | 'gruppi-uguali'
  | 'ripartizione'
  | 'contenenza'
  | 'frazioni'
  | 'due-passaggi'
  | 'soldi'
  | 'misure'
  | 'perimetro-area';

export const CATEGORY_LABELS: Record<ProblemCategory, string> = {
  aggiungere: 'Aggiungere',
  togliere: 'Togliere',
  confronto: 'Confronto',
  'gruppi-uguali': 'Gruppi uguali',
  ripartizione: 'Ripartizione',
  contenenza: 'Contenenza',
  frazioni: 'Frazione di una quantità',
  'due-passaggi': 'Due passaggi',
  soldi: 'Soldi con i centesimi',
  misure: 'Misure nei problemi',
  'perimetro-area': 'Perimetro e area',
};

export const OP_LABELS: Record<Op, string> = {
  '+': 'addizione',
  '-': 'sottrazione',
  '×': 'moltiplicazione',
  ':': 'divisione',
};

/** Pezzo di testo: parole oppure un numero toccabile. */
export type Segment =
  | { t: string; q?: boolean }
  | { n: number; id: string; important: boolean; q?: boolean; word?: string };

export interface Operand {
  value: number;
  /** id del numero nel testo, oppure 'prev' = risultato del passo precedente. */
  ref: string;
}

export interface Step {
  op: Op;
  a: Operand;
  b: Operand;
  result: number;
  /** L'ordine dei due numeri conta (sottrazione e divisione). */
  ordered: boolean;
  /** Frase che spiega cosa trovare in questo passo (problemi a due passaggi). */
  goal?: string;
}

export type BarSpec =
  | { kind: 'parti'; a: number; b: number; unit: string }
  | { kind: 'togli'; whole: number; part: number; unit: string }
  | {
      kind: 'confronto';
      big: number;
      small: number;
      bigLabel: string;
      smallLabel: string;
      unit: string;
      /** Cosa si cerca: la differenza oppure la quantità più piccola. */
      unknown: 'diff' | 'small';
    }
  | { kind: 'confronto-piu'; base: number; extra: number; baseLabel: string; otherLabel: string; unit: string }
  | { kind: 'gruppi'; groups: number; each: number; unit: string }
  | { kind: 'ripartizione'; whole: number; parts: number; unit: string }
  | { kind: 'contenenza'; whole: number; each: number; unit: string }
  | { kind: 'frazione'; whole: number; parts: number; unit: string }
  | { kind: 'figura'; shape: { type: 'rettangolo'; b: number; h: number } | { type: 'quadrato'; l: number }; unit: string; ask: 'perimetro' | 'area' };

export interface ProblemData {
  templateId: string;
  category: ProblemCategory;
  level: number;
  theme: 'storia' | 'quotidiano';
  segments: Segment[];
  /** Cosa chiede la domanda: la prima è giusta (vengono mescolate nella schermata). */
  questionChoices: string[];
  steps: Step[];
  unit: string;
  /** Un modello a barre per ogni passo. */
  bars: BarSpec[];
  /** Domanda guida per scegliere l'operazione, senza dirla. */
  opHint: string;
  /** Numeri che non sono nel testo ma servono (es. 100 perché 1 m = 100 cm). */
  extras?: Array<{ ref: string; value: number; label: string }>;
  /** La risposta può avere la virgola. */
  decimal?: boolean;
}

export function numText(n: number): string {
  return String(Math.round(n * 100) / 100).replace('.', ',');
}

export function plainText(segments: Segment[]): string {
  return segments.map((s) => ('t' in s ? s.t : s.word ?? numText(s.n))).join('');
}
