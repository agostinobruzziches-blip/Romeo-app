import type { ItemRole } from '../../db/schema';
import type { MissionItem } from '../module';

const ROLE_ORDER: Record<ItemRole, number> = { riscaldamento: 0, cuore: 1, ripasso: 1, chiusura: 2 };

/** Unisce gli esercizi dei moduli: riscaldamento → cuore/ripasso → chiusura. */
export function mergeQueues(lists: MissionItem[][]): MissionItem[] {
  const all = lists.flat();
  return all
    .map((item, i) => ({ item, i }))
    .sort((p, q) => ROLE_ORDER[p.item.role] - ROLE_ORDER[q.item.role] || p.i - q.i)
    .map((x) => x.item);
}

/**
 * Ripropone un esercizio più avanti SOSTITUENDO un esercizio successivo:
 * il numero totale non cambia, così la barra resta prevedibile.
 * Non tocca mai l'ultimo esercizio (la chiusura facile).
 */
export function requeue(queue: MissionItem[], index: number, replay: MissionItem, gap = 4): MissionItem[] | null {
  const last = queue.length - 1;
  for (let p = index + gap; p < last; p++) {
    const target = queue[p];
    if (target.role === 'chiusura' || target.key === replay.key) continue;
    const out = [...queue];
    out[p] = { ...replay, role: target.role === 'riscaldamento' ? 'ripasso' : target.role };
    return out;
  }
  return null;
}

/** "Ancora un po'": al massimo `extra` esercizi, poi la chiusura. */
export function shorten(queue: MissionItem[], index: number, extra = 3): MissionItem[] {
  const closing = queue[queue.length - 1];
  const rest = queue.slice(index + 1, queue.length - 1).slice(0, Math.max(0, extra - 1));
  const out = [...queue.slice(0, index + 1), ...rest];
  if (closing && closing.role === 'chiusura' && index < queue.length - 1) out.push(closing);
  return out;
}
