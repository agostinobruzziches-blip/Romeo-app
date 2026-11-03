import type { LearningModule, MissionItem } from '../../core/module';
import { addDays, dayKey } from '../../core/dates';
import { db, type ProblemProgress } from '../../db/schema';
import { ProblemExercise, ProblemHelp, ProblemSolution, liveState } from './Exercise';
import { LEVEL_NAMES, PROGRESS_KEY, evaluateLevel } from './levels';
import { ProblemParentPanel } from './ParentPanel';
import { itemResults, problemStats } from './stats';
import { generateProblem } from './templates';
import { CATEGORY_LABELS, type ProblemCategory, type ProblemData } from './types';

type Item = MissionItem<ProblemData>;

let uidCounter = 0;
function toItem(data: ProblemData): Item {
  return {
    uid: `p${Date.now().toString(36)}-${(uidCounter++).toString(36)}`,
    moduleId: 'problemi',
    role: 'cuore',
    key: data.templateId,
    format: 'problema',
    category: data.category,
    data,
  };
}

export async function getProblemProgress(): Promise<ProblemProgress> {
  return (await db.problemProgress.get(PROGRESS_KEY)) ?? { category: PROGRESS_KEY, level: 1, goodSessions: 0 };
}

export const problemiModule: LearningModule<ProblemData, number> = {
  id: 'problemi',
  title: 'Problemi',
  estimatedSecondsPerItem: 100,
  timeShare: 45,
  minItems: 1,
  maxItems: 4,
  multiStep: true,
  timedFatigue: false,

  async plan(ctx, count) {
    const { level } = await getProblemProgress();
    const items: Item[] = [];
    let last: ProblemCategory | undefined;
    for (let i = 0; i < count; i++) {
      const p = generateProblem(ctx.rng, level, last);
      last = p.category;
      items.push(toItem(p));
    }
    return { items, focusLabel: count === 1 ? 'un problema' : `${count} problemi` };
  },

  replay: (item, rng) => toItem(generateProblem(rng, item.data.level, undefined, item.data.templateId)),
  retryItem: (item) => item,

  evaluate(item, answer) {
    const ok = answer === item.data.steps[item.data.steps.length - 1].result;
    return { correct: ok, errorType: ok ? undefined : 'calcolo' };
  },

  Exercise: ProblemExercise,
  maxHelpLevel: 2,
  Help: ProblemHelp,
  Solution: ProblemSolution,

  parentTip(item, settings) {
    const name = settings.childName || 'il bambino';
    const phase = liveState.get(item.uid)?.phase ?? 'leggi';
    const end = ' Non dire la soluzione né l’operazione: fagli fare le domande giuste.';
    switch (phase) {
      case 'leggi':
      case 'numeri':
        return `Chiedi a ${name} di raccontarti il problema con parole sue, senza numeri. Poi: «Qual è la domanda? Quali numeri ti servono per rispondere?»${end}`;
      case 'domanda':
        return `Chiedigli di leggerti ad alta voce l’ultima frase del problema e di dirti cosa bisogna trovare.${end}`;
      case 'op':
        return `Disegnate insieme la situazione (o guardate il disegno a barre). Chiedi: «Si aggiunge? Si toglie? Ci sono gruppi uguali? Si divide in parti uguali?».${end}`;
      default:
        return `Ha già capito cosa fare: lascia che faccia il calcolo da solo. Se serve, scrivetelo in colonna su un foglio.${end}`;
    }
  },

  async record() {
    return { improvements: [] };
  },

  async onSessionEnd(session, attempts) {
    const mine = attempts.filter((a) => a.sessionId === session.id && a.moduleId === 'problemi');
    const p = await getProblemProgress();
    const res = evaluateLevel(p, itemResults(mine));
    await db.problemProgress.put(res.progress);
    return {
      improvements: res.up ? [`Problemi: livello ${res.progress.level} raggiunto`] : [],
      milestones: res.up ? [{ ref: `problemi-livello-${res.progress.level}`, reason: `Problemi di livello ${res.progress.level}` }] : [],
    };
  },

  ParentPanel: ProblemParentPanel,

  async tutorSummary(sinceDay) {
    const sessions = await db.sessions.where('day').between(sinceDay, addDays(dayKey(), 1)).toArray();
    const ids = new Set(sessions.map((s) => s.id));
    const attempts = (await db.attempts.where('moduleId').equals('problemi').toArray()).filter((a) => ids.has(a.sessionId));
    const stats = problemStats(attempts);
    const { level } = await getProblemProgress();
    const lines = [`Livello ${level} di 5: ${LEVEL_NAMES[level]}`];
    const problems = stats.reduce((n, s) => n + s.problems, 0);
    if (!problems) return [...lines, 'Nessun problema svolto nel periodo.'];
    const clean = stats.reduce((n, s) => n + s.clean, 0);
    const op = stats.reduce((n, s) => n + s.operazione, 0);
    const calc = stats.reduce((n, s) => n + s.calcolo, 0);
    lines.push(`Problemi svolti: ${problems}, senza errori di ragionamento: ${clean}`);
    lines.push(`Errori di operazione (non capisce cosa fare): ${op} · errori di calcolo: ${calc}`);
    const hard = stats.filter((s) => s.operazione > 0).sort((a, b) => b.operazione - a.operazione).slice(0, 2);
    if (hard.length) lines.push(`Più difficili: ${hard.map((s) => CATEGORY_LABELS[s.category].toLowerCase()).join(', ')}`);
    return lines;
  },
};
