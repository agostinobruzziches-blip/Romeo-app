import { cleanItems, errorCounts, evaluateLevel, getLevel } from '../../core/levels';
import { addDays, dayKey } from '../../core/dates';
import { sameNumber } from '../../core/format';
import type { LearningModule, MissionItem } from '../../core/module';
import { db } from '../../db/schema';
import { MisExercise, MisHelp, MisSolution, misLive, type MisData } from './Exercise';
import { MAX_MIS_LEVEL, MIS_LEVEL_NAMES, generateEq } from './generator';
import { lessonForLevel } from './lessons';
import { MisParentPanel } from './ParentPanel';
import { FAMILY_LABEL } from './units';

export const MIS_KEY = 'misure';
type Item = MissionItem<MisData>;

let uidCounter = 0;
const uid = () => `m${Date.now().toString(36)}-${(uidCounter++).toString(36)}`;

function eqItem(data: ReturnType<typeof generateEq>): Item {
  return {
    uid: uid(),
    moduleId: 'misure',
    role: 'cuore',
    key: `${data.from}>${data.to}`,
    format: 'equivalenza',
    category: data.family,
    data: { kind: 'eq', ...data },
  };
}

export const misureModule: LearningModule<MisData, number | string> = {
  id: 'misure',
  title: 'Misure',
  estimatedSecondsPerItem: 45,
  timeShare: 45,
  minItems: 3,
  maxItems: 7,
  multiStep: true,
  timedFatigue: false,

  async plan(ctx, count) {
    const { level } = await getLevel(MIS_KEY);
    const items: Item[] = [];
    // la prima volta che si arriva a un livello con un concetto nuovo, prima si "scopre"
    for (let l = 1; l <= Math.min(level, 4); l++) {
      const id = lessonForLevel(l);
      if (id && !(await db.lessons.get(id))) {
        items.push({ uid: uid(), moduleId: 'misure', role: 'scopri', key: id, format: 'lezione', data: { kind: 'lezione', lessonId: id } });
        break;
      }
    }
    let last = '';
    for (let i = 0; i < count; i++) {
      let d = generateEq(ctx.rng, level);
      for (let k = 0; k < 5 && `${d.from}>${d.to}` === last; k++) d = generateEq(ctx.rng, level);
      last = `${d.from}>${d.to}`;
      items.push(eqItem(d));
    }
    return { items, focusLabel: 'le misure' };
  },

  replay: (item, rng) => eqItem(generateEq(rng, item.data.kind === 'eq' ? item.data.level : 1)),
  retryItem: (item) => item,

  evaluate(item, answer) {
    if (item.data.kind === 'lezione') return { correct: true };
    const ok = typeof answer === 'number' && sameNumber(answer, item.data.result);
    return { correct: ok, errorType: ok ? undefined : 'calcolo' };
  },

  Exercise: MisExercise,
  maxHelpLevel: 2,
  Help: MisHelp,
  Solution: MisSolution,

  parentTip(item, settings) {
    const name = settings.childName || 'il bambino';
    if (item.data.kind === 'lezione') return `${name} sta leggendo una lezione. Leggetela insieme e fategli provare i pulsanti.`;
    const d = item.data;
    const phase = misLive.get(item.uid) ?? 'unita';
    const end = ' Non dire il risultato.';
    if (phase === 'unita' || phase === 'numero')
      return `Chiedi a ${name}: «Cosa è più grande, un ${d.from} o un ${d.to}? Per fare la stessa misura, ne servono di più o di meno?». Se avete un metro o un righello, usatelo.${end}`;
    if (phase === 'operazione')
      return `Fagli contare con il dito le colonne della tabella da ${d.from} a ${d.to}: ogni colonna è un “per 10” o un “diviso 10”.${end}`;
    return `Chiedigli di scrivere il numero nella tabella su un foglio, una cifra per colonna, e di spostare la virgola.${end}`;
  },

  async record(item) {
    if (item.data.kind === 'lezione') await db.lessons.put({ id: item.data.lessonId, seenAt: Date.now() });
    return { improvements: [] };
  },

  async onSessionEnd(session, attempts) {
    const mine = attempts.filter((a) => a.sessionId === session.id && a.moduleId === 'misure');
    const p = await getLevel(MIS_KEY);
    const res = evaluateLevel(p, cleanItems(mine, 'misure', 'equivalenza'), MAX_MIS_LEVEL, 3);
    await db.problemProgress.put(res.progress);
    return {
      improvements: res.up ? [`Misure: livello ${res.progress.level} raggiunto`] : [],
      milestones: res.up ? [{ ref: `misure-livello-${res.progress.level}`, reason: `Equivalenze di livello ${res.progress.level}` }] : [],
    };
  },

  ParentPanel: MisParentPanel,

  async tutorSummary(sinceDay) {
    const ids = new Set((await db.sessions.where('day').between(sinceDay, addDays(dayKey(), 1)).toArray()).map((s) => s.id));
    const att = (await db.attempts.where('moduleId').equals('misure').toArray()).filter((a) => ids.has(a.sessionId));
    const { level } = await getLevel(MIS_KEY);
    const lines = [`Livello ${level} di ${MAX_MIS_LEVEL}: ${MIS_LEVEL_NAMES[level]}`];
    const items = cleanItems(att, 'misure', 'equivalenza');
    if (!items.length) return [...lines, 'Nessuna equivalenza nel periodo.'];
    const e = errorCounts(att);
    lines.push(`Equivalenze: ${items.length}, senza errori di ragionamento: ${items.filter((i) => i.clean).length}`);
    lines.push(
      `Errori: verso dell’unità/numero ${e.concetto ?? 0} · operazione (× o :, quanti passi) ${e.operazione ?? 0} · calcolo ${e.calcolo ?? 0}`,
    );
    const fams = [...new Set(att.map((a) => a.category))].filter(Boolean) as Array<keyof typeof FAMILY_LABEL>;
    if (fams.length) lines.push(`Unità lavorate: ${fams.map((f) => FAMILY_LABEL[f]).join(', ')}`);
    return lines;
  },
};
