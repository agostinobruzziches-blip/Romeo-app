import { addDays, dayKey } from '../../core/dates';
import { sameNumber } from '../../core/format';
import { cleanItems, errorCounts, evaluateLevel, getLevel } from '../../core/levels';
import type { LearningModule, MissionItem } from '../../core/module';
import { db } from '../../db/schema';
import { GeoExercise, GeoHelp, GeoSolution, geoLive, type GeoItemData } from './Exercise';
import { lessonsForLevel } from './lessons';
import { GeoParentPanel } from './ParentPanel';
import { GEO_LEVEL_NAMES, MAX_GEO_LEVEL, generateGeo, geoCategory, type GeoData } from './shapes';
export { GEO_CATEGORY_LABELS, geoCategory } from './shapes';

export const GEO_KEY = 'geometria';
type Item = MissionItem<GeoItemData>;

let uidCounter = 0;
const uid = () => `g${Date.now().toString(36)}-${(uidCounter++).toString(36)}`;

function geoItem(d: GeoData): Item {
  return {
    uid: uid(),
    moduleId: 'geometria',
    role: 'cuore',
    key: `${d.shape.type}-${d.ask}`,
    format: 'figura',
    category: geoCategory(d),
    data: { kind: 'geo', ...d },
  };
}

export const geometriaModule: LearningModule<GeoItemData, number | string> = {
  id: 'geometria',
  title: 'Geometria',
  estimatedSecondsPerItem: 60,
  timeShare: 45,
  minItems: 3,
  maxItems: 6,
  multiStep: true,
  timedFatigue: false,

  async plan(ctx, count) {
    const { level } = await getLevel(GEO_KEY);
    const items: Item[] = [];
    for (const id of lessonsForLevel(level)) {
      if (!(await db.lessons.get(id))) {
        items.push({ uid: uid(), moduleId: 'geometria', role: 'scopri', key: id, format: 'lezione', data: { kind: 'lezione', lessonId: id } });
        break; // una lezione nuova per missione
      }
    }
    let lastKey = '';
    let flip = ctx.rng() < 0.5;
    for (let i = 0; i < count; i++) {
      let d = generateGeo(ctx.rng, level);
      // alterna perimetro e area: è proprio la differenza che deve diventare chiara
      for (let k = 0; k < 6 && (`${d.shape.type}-${d.ask}` === lastKey || (d.ask === 'perimetro') !== flip); k++) d = generateGeo(ctx.rng, level);
      lastKey = `${d.shape.type}-${d.ask}`;
      flip = !flip;
      items.push(geoItem(d));
    }
    return { items, focusLabel: 'la geometria' };
  },

  replay: (item, rng) => geoItem(generateGeo(rng, item.data.kind === 'geo' ? item.data.level : 1)),
  retryItem: (item) => item,

  evaluate(item, answer) {
    if (item.data.kind === 'lezione') return { correct: true };
    const ok = typeof answer === 'number' && sameNumber(answer, item.data.result);
    return { correct: ok, errorType: ok ? undefined : 'calcolo' };
  },

  Exercise: GeoExercise,
  maxHelpLevel: 2,
  Help: GeoHelp,
  Solution: GeoSolution,

  parentTip(item, settings) {
    const name = settings.childName || 'il bambino';
    if (item.data.kind === 'lezione') return `${name} sta leggendo una lezione. Fategli fare le azioni richieste (toccare i quadretti, i lati).`;
    const phase = geoLive.get(item.uid) ?? 'cosa';
    const end = ' Non dire il risultato.';
    if (phase === 'cosa')
      return `Chiedi a ${name}: «Il perimetro è il bordo o lo spazio dentro?». Fategli passare il dito lungo il contorno della figura.${end}`;
    if (phase === 'come')
      return `Disegnate la figura su un foglio a quadretti. Per il perimetro contate i lati sul bordo, per l’area i quadretti dentro: poi scoprite insieme la scorciatoia.${end}`;
    if (phase === 'unita') return `Chiedigli: «Stai misurando una lunghezza o una superficie fatta di quadretti?».${end}`;
    return `Ha capito come si fa: lascia che faccia il calcolo da solo, anche in colonna su un foglio.${end}`;
  },

  async record(item) {
    if (item.data.kind === 'lezione') await db.lessons.put({ id: item.data.lessonId, seenAt: Date.now() });
    return { improvements: [] };
  },

  async onSessionEnd(session, attempts) {
    const mine = attempts.filter((a) => a.sessionId === session.id && a.moduleId === 'geometria');
    const p = await getLevel(GEO_KEY);
    const res = evaluateLevel(p, cleanItems(mine, 'geometria', 'figura'), MAX_GEO_LEVEL, 3);
    await db.problemProgress.put(res.progress);
    return {
      improvements: res.up ? [`Geometria: livello ${res.progress.level} raggiunto`] : [],
      milestones: res.up ? [{ ref: `geometria-livello-${res.progress.level}`, reason: `Geometria di livello ${res.progress.level}` }] : [],
    };
  },

  ParentPanel: GeoParentPanel,

  async tutorSummary(sinceDay) {
    const ids = new Set((await db.sessions.where('day').between(sinceDay, addDays(dayKey(), 1)).toArray()).map((s) => s.id));
    const att = (await db.attempts.where('moduleId').equals('geometria').toArray()).filter((a) => ids.has(a.sessionId));
    const { level } = await getLevel(GEO_KEY);
    const lines = [`Livello ${level} di ${MAX_GEO_LEVEL}: ${GEO_LEVEL_NAMES[level]}`];
    const items = cleanItems(att, 'geometria', 'figura');
    if (!items.length) return [...lines, 'Nessun esercizio di geometria nel periodo.'];
    const e = errorCounts(att);
    lines.push(`Esercizi: ${items.length}, senza errori di ragionamento: ${items.filter((i) => i.clean).length}`);
    lines.push(
      `Errori: confonde perimetro e area ${e.concetto ?? 0} · formula ${e.operazione ?? 0} · unità (cm o cm²) ${e.unita ?? 0} · calcolo ${e.calcolo ?? 0}`,
    );
    return lines;
  },
};
