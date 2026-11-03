import { FATIGUE_LABELS } from './fatigue';
import { addDays, dayKey, formatDay } from './dates';
import { COMPLETED } from '../db/repo';
import { db, type EndReason, type Session } from '../db/schema';
import { activeModules } from '../modules/registry';
import { CARDS } from '../content/cards';

export const END_LABELS: Record<EndReason, string> = {
  completata: 'completata',
  stanchezza: 'fermata per stanchezza',
  genitore: 'fermata dal genitore',
  interrotta: 'interrotta',
};

export interface PeriodStats {
  from: string;
  to: string;
  missions: number;
  fatigueStops: number;
  items: number;
  firstTry: number;
  medals: number;
  unsolved: number;
  help: number;
  parentHelp: number;
  minutes: number;
  fatigueSessions: number;
}

export function sessionMinutes(s: Session): number {
  return s.endedAt ? Math.max(1, Math.round((s.endedAt - s.startedAt) / 60000)) : 0;
}

export async function periodStats(days: number, endDay = dayKey()): Promise<PeriodStats> {
  const from = addDays(endDay, -(days - 1));
  const list = (await db.sessions.where('day').between(from, endDay, true, true).toArray()).filter(
    (s) => s.endReason && COMPLETED.includes(s.endReason),
  );
  return {
    from,
    to: endDay,
    missions: list.length,
    fatigueStops: list.filter((s) => s.endReason === 'stanchezza').length,
    items: list.reduce((n, s) => n + s.doneItems, 0),
    firstTry: list.reduce((n, s) => n + s.firstTryCorrect, 0),
    medals: list.reduce((n, s) => n + s.tenacityMedals, 0),
    unsolved: list.reduce((n, s) => n + s.unsolved, 0),
    help: list.reduce((n, s) => n + s.helpCount, 0),
    parentHelp: list.reduce((n, s) => n + s.parentHelpCount, 0),
    minutes: list.reduce((n, s) => n + sessionMinutes(s), 0),
    fatigueSessions: list.filter((s) => s.fatigueSignals.length > 0).length,
  };
}

export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

/** Testo semplice per la tutor: si condivide dal menu del telefono, nessun link. */
export async function tutorReport(days = 7): Promise<string> {
  const settings = await db.settings.get('main');
  const name = settings?.childName || 'Esploratore';
  const p = await periodStats(days);
  const lines: string[] = [];
  lines.push(`${name} – Viaggio nel Tempo`);
  lines.push(`Riepilogo dal ${formatDay(p.from)} al ${formatDay(p.to)}`);
  lines.push('');
  lines.push(`Missioni: ${p.missions}${p.fatigueStops ? ` (${p.fatigueStops} fermate per stanchezza)` : ''}, circa ${p.minutes} ${p.minutes === 1 ? 'minuto' : 'minuti'} in tutto`);
  lines.push(`Esercizi: ${p.items}`);
  lines.push(`Giuste al primo colpo: ${p.firstTry} (${pct(p.firstTry, p.items)}%)`);
  lines.push(`Medaglie della tenacia (giuste dopo un errore): ${p.medals}`);
  if (p.unsolved) lines.push(`Non risolte (mostrata la soluzione): ${p.unsolved}`);
  lines.push(`Aiuti usati: ${p.help} · "Chiedi a ${settings?.parentLabel ?? 'papà/mamma'}": ${p.parentHelp}`);
  for (const m of activeModules(settings?.activeModules ?? ['tabelline'])) {
    lines.push('');
    lines.push(`${m.title}:`);
    for (const l of await m.tutorSummary(p.from)) lines.push(`- ${l}`);
  }
  const recent = (await db.sessions.where('day').between(p.from, p.to, true, true).toArray()).filter(
    (s) => s.fatigueSignals.length,
  );
  if (recent.length) {
    lines.push('');
    lines.push('Segnali di stanchezza:');
    for (const s of recent) {
      const kinds = [...new Set(s.fatigueSignals.map((f) => FATIGUE_LABELS[f.kind]))];
      lines.push(`- ${formatDay(s.day)}: ${kinds.join(', ')}`);
    }
  }
  const cards = await db.cards.count();
  lines.push('');
  lines.push(`Carte storiche raccolte: ${cards} su ${CARDS.length}`);
  lines.push('');
  lines.push('Motto: prova, prova, prova!');
  return lines.join('\n');
}
