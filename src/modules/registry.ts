import type { LearningModule } from '../core/module';
import type { ModuleId } from '../db/schema';
import { problemiModule } from './problemi';
import { tabellineModule } from './tabelline';

/** Tutti i moduli disponibili. Per aggiungerne uno: implementa LearningModule e registralo qui. */
export const MODULES: Partial<Record<ModuleId, LearningModule>> = {
  tabelline: tabellineModule,
  problemi: problemiModule,
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
