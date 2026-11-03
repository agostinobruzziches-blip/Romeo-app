import type { LearningModule } from '../core/module';
import type { ModuleId } from '../db/schema';
import { geometriaModule } from './geometria';
import { misureModule } from './misure';
import { problemiModule } from './problemi';
import { tabellineModule } from './tabelline';

/** Tutti i moduli disponibili. Per aggiungerne uno: implementa LearningModule e registralo qui. */
export const MODULES: Partial<Record<ModuleId, LearningModule>> = {
  tabelline: tabellineModule,
  problemi: problemiModule,
  misure: misureModule,
  geometria: geometriaModule,
};

export function getModule(id: ModuleId): LearningModule {
  const m = MODULES[id];
  if (!m) throw new Error(`Modulo non disponibile: ${id}`);
  return m;
}

export function activeModules(ids: ModuleId[]): LearningModule[] {
  const list = ids.map((id) => MODULES[id]).filter((m): m is LearningModule => !!m);
  return list.length ? list : [tabellineModule];
}

/** Argomenti che si alternano: uno al giorno, accanto alle tabelline. */
export const TOPIC_ORDER: ModuleId[] = ['problemi', 'misure', 'geometria'];

/**
 * I moduli della missione di oggi: le tabelline (se attive) più UN argomento del giorno,
 * scelto a rotazione tra quelli attivi. Così la missione resta breve e sempre uguale nella forma.
 */
export function missionModules(ids: ModuleId[], completedMissions: number): LearningModule[] {
  const topics = TOPIC_ORDER.filter((t) => ids.includes(t));
  const out: LearningModule[] = [];
  if (ids.includes('tabelline') || !topics.length) out.push(tabellineModule);
  if (topics.length) out.push(getModule(topics[completedMissions % topics.length]));
  return out;
}
