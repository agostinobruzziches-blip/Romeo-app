import type { MissionItem } from '../../core/module';
import { pick, shuffle, type Rng } from '../../core/random';
import type { Fact, ItemRole, Stage, TableProgress } from '../../db/schema';
import { factKey } from './leitner';
import { STAGE_NAMES, focusTable, partnerTable } from './stages';

export type TabFormat = 'prodotto' | 'fattore-mancante' | 'vero-falso';

export interface TabData {
  /** Fattori nell'ordine mostrato: "x × y". */
  x: number;
  y: number;
  /** Solo vero/falso: il risultato proposto. */
  shown?: number;
  /** Tabellina di riferimento (per le tappe), null nel ripasso. */
  table: number | null;
  stage?: Stage;
}

export type TabItem = MissionItem<TabData>;
export type TabAnswer = number | boolean;

export interface TabPlanInput {
  facts: Map<string, Fact>;
  progress: Map<number, TableProgress>;
  activeTables: number[];
  today: string;
  rng: Rng;
  count: number;
}

export interface TabPlan {
  items: TabItem[];
  focus: number | null;
  stage: Stage | null;
  focusLabel: string;
}

let uidCounter = 0;
const uid = () => `t${Date.now().toString(36)}-${(uidCounter++).toString(36)}`;

export function makeItem(
  role: ItemRole,
  x: number,
  y: number,
  format: TabFormat,
  rng: Rng,
  table: number | null = null,
  stage?: Stage,
): TabItem {
  const data: TabData = { x, y, table, stage };
  if (format === 'vero-falso') {
    data.shown = rng() < 0.5 ? x * y : plausibleWrong(x, y, rng);
  }
  return {
    uid: uid(),
    moduleId: 'tabelline',
    role,
    key: factKey(x, y),
    format,
    tag: table !== null && stage ? `t${table}-s${stage}` : undefined,
    data,
  };
}

/** Un risultato sbagliato ma credibile: il fatto vicino, oppure ±1/±2. */
export function plausibleWrong(x: number, y: number, rng: Rng): number {
  const p = x * y;
  const options = [p + x, p - x, p + y, p - y, p + 1, p - 1, p + 2, p - 2, p + 10, p - 10].filter(
    (v) => v > 0 && v !== p,
  );
  return pick(rng, options);
}

function chooseFormat(rng: Rng, stage: Stage | null, role: ItemRole): TabFormat {
  if (role === 'riscaldamento' || role === 'chiusura' || stage === 1) return 'prodotto';
  const r = rng();
  if (role === 'ripasso') return r < 0.8 ? 'prodotto' : 'fattore-mancante';
  if (r < 0.7) return 'prodotto';
  if (r < 0.9) return 'fattore-mancante';
  return 'vero-falso';
}

/** Fatti "facili" usati per riscaldamento e chiusura quando non ce ne sono di sicuri. */
function isEasy(f: Fact): boolean {
  return f.a === 1 || f.b === 10 || f.a === 2 || (f.a === 5 && f.b <= 5);
}

function orient(rng: Rng, a: number, b: number): [number, number] {
  return rng() < 0.5 ? [a, b] : [b, a];
}

/** Sequenza dalla lista di fatti: un giro completo mescolato, poi i meno sicuri, mai due uguali di fila. */
function mixedSequence(rng: Rng, pairs: Array<[number, number]>, facts: Map<string, Fact>, n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const byWeakness = () =>
    shuffle(rng, pairs).sort(
      (p, q) => (facts.get(factKey(...p))?.box ?? 0) - (facts.get(factKey(...q))?.box ?? 0),
    );
  let round = shuffle(rng, pairs);
  let first = true;
  while (out.length < n && pairs.length) {
    for (const p of round) {
      if (out.length >= n) break;
      const last = out[out.length - 1];
      if (last && factKey(...last) === factKey(...p) && pairs.length > 1) continue;
      out.push(p);
    }
    // dal secondo giro: prima la metà meno sicura
    round = first ? byWeakness().slice(0, Math.max(2, Math.ceil(pairs.length / 2))) : byWeakness();
    round = shuffle(rng, round);
    first = false;
  }
  return out;
}

export function planTabelline(input: TabPlanInput): TabPlan {
  const { facts, progress, activeTables, today, rng } = input;
  const count = Math.max(6, input.count);
  const focus = focusTable(activeTables, progress);
  const stage: Stage | null = focus !== null ? (progress.get(focus)?.stage ?? 1) : null;
  const all = [...facts.values()];

  // --- Riscaldamento (3) e chiusura (1): fatti già sicuri, altrimenti facili
  const secure = shuffle(rng, all.filter((f) => f.box >= 4));
  const easy = shuffle(rng, all.filter((f) => isEasy(f) && !(focus && (f.a === focus || f.b === focus))));
  const warmPool = [...secure, ...easy.filter((f) => !secure.includes(f))];
  const warm = warmPool.slice(0, 3);
  const closePool = shuffle(rng, all.filter((f) => f.box >= 3 && !warm.includes(f)));
  const close = closePool[0] ?? warmPool.find((f) => !warm.includes(f)) ?? warmPool[0];

  const items: TabItem[] = [];
  for (const f of warm) items.push(makeItem('riscaldamento', ...orient(rng, f.a, f.b), 'prodotto', rng));

  const middle = count - warm.length - 1;

  // --- Ripasso: fatti già visti e scaduti, fuori dalla tabellina attuale
  const due = all
    .filter((f) => f.seen > 0 && f.dueDay <= today && !(focus && (f.a === focus || f.b === focus)))
    .filter((f) => !warm.includes(f) && f !== close)
    .sort((p, q) => p.box - q.box || (p.dueDay < q.dueDay ? -1 : 1));

  let coreBudget = middle;
  let reviewBudget = 0;
  if (focus !== null) {
    reviewBudget = Math.min(due.length, Math.round(middle * 0.35));
    coreBudget = middle - reviewBudget;
  } else {
    reviewBudget = middle; // tutte conquistate: solo ripasso misto
    coreBudget = 0;
  }

  // --- Cuore: la tappa attuale
  const core: TabItem[] = [];
  if (focus !== null && stage !== null) {
    const tableFacts: Array<[number, number]> = Array.from({ length: 10 }, (_, i) => [focus, i + 1]);
    if (stage === 1) {
      for (let i = 0; i < coreBudget; i++) {
        const [x, y] = tableFacts[i % 10];
        core.push(makeItem('cuore', x, y, 'prodotto', rng, focus, stage));
      }
    } else {
      let pairs: Array<[number, number]> = tableFacts;
      if (stage === 3) {
        const partner = partnerTable(focus, activeTables, progress);
        pairs = [...tableFacts, ...Array.from({ length: 10 }, (_, i) => [partner, i + 1] as [number, number])];
      } else if (stage === 4) {
        const known = activeTables.filter((t) => t !== focus && progress.get(t)?.conqueredAt);
        const partner = partnerTable(focus, activeTables, progress);
        const tables = [...new Set([...known, partner])];
        const others: Array<[number, number]> = [];
        for (const t of tables) for (let i = 1; i <= 10; i++) others.push([t, i]);
        // metà della tappa sulla tabellina attuale, metà mix
        const half = Math.ceil(coreBudget / 2);
        const own = mixedSequence(rng, tableFacts, facts, half);
        const mix = mixedSequence(rng, others, facts, coreBudget - half);
        const merged = shuffle(rng, [...own, ...mix]);
        for (const [x, y] of merged) core.push(makeItem('cuore', x, y, chooseFormat(rng, stage, 'cuore'), rng, focus, stage));
      }
      if (stage !== 4) {
        for (const [x, y] of mixedSequence(rng, pairs, facts, coreBudget)) {
          core.push(makeItem('cuore', x, y, chooseFormat(rng, stage, 'cuore'), rng, focus, stage));
        }
      }
    }
  }

  // --- Ripasso
  const review: TabItem[] = [];
  const reviewPool =
    focus === null
      ? mixedSequence(rng, all.filter((f) => f.a > 1).map((f) => [f.a, f.b] as [number, number]), facts, reviewBudget)
      : due.slice(0, reviewBudget).map((f) => [f.a, f.b] as [number, number]);
  for (const [a, b] of reviewPool) {
    review.push(makeItem('ripasso', ...orient(rng, a, b), chooseFormat(rng, stage, 'ripasso'), rng));
  }

  // Il ripasso si intreccia alla tappa nella seconda metà, così l'inizio resta concentrato sulla tappa
  const middleItems = interleave(core, review);
  items.push(...middleItems);
  if (close) items.push(makeItem('chiusura', ...orient(rng, close.a, close.b), 'prodotto', rng));

  const focusLabel =
    focus === null
      ? 'un ripasso di tutte le tabelline'
      : `la tabellina del ${focus}, ${STAGE_NAMES[stage ?? 1]}`;
  return { items, focus, stage, focusLabel };
}

function interleave<T>(core: T[], review: T[]): T[] {
  if (!review.length) return core;
  if (!core.length) return review;
  const head = core.slice(0, Math.ceil(core.length / 2));
  const tail = core.slice(head.length);
  const out = [...head];
  const n = Math.max(tail.length, review.length);
  for (let i = 0; i < n; i++) {
    if (i < review.length) out.push(review[i]);
    if (i < tail.length) out.push(tail[i]);
  }
  return out;
}

/** La stessa domanda riproposta più avanti, in formato "quanto fa?". */
export function replayItem(item: TabItem, rng: Rng): TabItem {
  const [x, y] = item.data.table !== null ? [item.data.x, item.data.y] : orient(rng, item.data.x, item.data.y);
  return { ...makeItem(item.role, x, y, 'prodotto', rng, item.data.table, item.data.stage), role: item.role };
}
