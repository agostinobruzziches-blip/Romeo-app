import type { LearningModule, MissionItem } from '../../core/module';
import { db, type Attempt, type Session, type Settings } from '../../db/schema';
import { TabExercise, TabHelp, TabSolution } from './Exercise';
import { planTabelline, replayItem, type TabAnswer, type TabData } from './generator';
import { applyOutcome } from './leitner';
import { TabParentPanel } from './ParentPanel';
import { STAGE_NAMES, evaluateStage, focusTable } from './stages';

type Item = MissionItem<TabData>;

function correctAnswer(item: Item): TabAnswer {
  const { x, y, shown } = item.data;
  if (item.format === 'fattore-mancante') return y;
  if (item.format === 'vero-falso') return shown === x * y;
  return x * y;
}

export const tabellineModule: LearningModule<TabData, TabAnswer> = {
  id: 'tabelline',
  title: 'Tabelline',
  estimatedSecondsPerItem: 20,

  async plan(ctx, count) {
    const facts = new Map((await db.facts.toArray()).map((f) => [f.key, f]));
    const progress = new Map((await db.tableProgress.toArray()).map((p) => [p.table, p]));
    const plan = planTabelline({
      facts,
      progress,
      activeTables: ctx.settings.activeTables,
      today: ctx.today,
      rng: ctx.rng,
      count,
    });
    return { items: plan.items, focusLabel: plan.focusLabel };
  },

  replay: (item, rng) => ({ ...replayItem(item, rng), tag: undefined }),

  retryItem(item) {
    // Dopo un vero/falso sbagliato non si "tira a indovinare" l'altra risposta: si chiede il risultato.
    if (item.format === 'vero-falso') return { ...item, format: 'prodotto', data: { ...item.data, shown: undefined } };
    return item;
  },

  evaluate(item, answer) {
    return { correct: answer === correctAnswer(item), errorType: answer === correctAnswer(item) ? undefined : 'calcolo' };
  },

  Exercise: TabExercise,
  maxHelpLevel: 2,
  Help: TabHelp,
  Solution: TabSolution,

  parentTip(item: Item, settings: Settings) {
    const { x, y } = item.data;
    const name = settings.childName || 'Romeo';
    const base = `${name} sta lavorando su ${x} × ${y}.`;
    if (item.format === 'fattore-mancante') {
      return `${base} Chiedigli di contare di ${x} in ${x}, alzando un dito a ogni salto, fino a ${x * y}. Quante dita ha alzato? Non dire il risultato: lascia che ci arrivi da solo.`;
    }
    const prev = y > 1 ? `«Quanto fa ${x} × ${y - 1}?» e poi «Se aggiungi ancora ${x}?»` : `«Quanto fa un gruppo da ${x}?»`;
    return `${base} Chiedigli prima ${prev}. Puoi anche disegnare ${x} righe da ${y} pallini. Non dire il risultato: lascia che ci arrivi da solo.`;
  },

  async record(item, outcome, today) {
    const fact = await db.facts.get(item.key);
    if (!fact) return { improvements: [] };
    const next = applyOutcome(fact, outcome, today, Date.now());
    await db.facts.put(next);
    const improvements: string[] = [];
    if (next.everSecure && !fact.everSecure) improvements.push(`${fact.a} × ${fact.b} ora è un fatto sicuro`);
    return { improvements };
  },

  async onSessionEnd(session: Session, attempts: Attempt[]) {
    const improvements: string[] = [];
    const milestones: Array<{ ref: string; reason: string }> = [];
    const settings = await db.settings.get('main');
    const progress = new Map((await db.tableProgress.toArray()).map((p) => [p.table, p]));
    const focus = focusTable(settings?.activeTables ?? [], progress);
    if (focus === null) return { improvements, milestones };
    const p = progress.get(focus);
    if (!p) return { improvements, milestones };
    const tag = `t${focus}-s${p.stage}`;
    const first = attempts.filter((a) => a.sessionId === session.id && a.tag === tag && a.attemptNo === 1);
    const good = first.filter((a) => a.correct && !a.helpUsed).length;
    const res = evaluateStage(p, good, first.length, Date.now());
    if (res.counted) await db.tableProgress.put(res.progress);
    if (res.conquered) {
      milestones.push({ ref: `tabellina-${focus}`, reason: `Tabellina del ${focus} conquistata` });
      improvements.push(`Tabellina del ${focus} conquistata`);
    } else if (res.advanced) {
      improvements.push(`Nuova tappa: tabellina del ${focus}, ${STAGE_NAMES[res.progress.stage]}`);
    }
    return { improvements, milestones };
  },

  ParentPanel: TabParentPanel,

  async tutorSummary() {
    const facts = await db.facts.toArray();
    const progress = new Map((await db.tableProgress.toArray()).map((p) => [p.table, p]));
    const settings = await db.settings.get('main');
    const focus = focusTable(settings?.activeTables ?? [], progress);
    const lines: string[] = [];
    if (focus !== null) {
      const st = progress.get(focus)?.stage ?? 1;
      lines.push(`Tabellina in corso: ${focus}, tappa ${st} di 4 (${STAGE_NAMES[st]})`);
    } else lines.push('Tutte le tabelline attive sono conquistate: ora si fa ripasso misto.');
    const conquered = [...progress.values()].filter((p) => p.conqueredAt).map((p) => p.table);
    if (conquered.length) lines.push(`Tabelline conquistate: ${conquered.join(', ')}`);
    const secure = facts.filter((f) => f.box >= 4).length;
    lines.push(`Fatti sicuri: ${secure} su ${facts.length} (7×8 e 8×7 contano come uno)`);
    const weak = facts
      .filter((f) => f.seen > 0 && f.box <= 1 && (f.wrong > 0 || f.helpUsed > 0))
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 6)
      .map((f) => `${f.a}×${f.b}`);
    if (weak.length) lines.push(`Da rinforzare: ${weak.join(', ')}`);
    return lines;
  },
};
