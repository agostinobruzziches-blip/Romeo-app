import { dayKey } from '../core/dates';
import { ensureInitialized } from './repo';
import { TABLE_NAMES, db } from './schema';

export const BACKUP_APP = 'romeo-viaggio-nel-tempo';
export const SCHEMA_VERSION = 1;

export interface Backup {
  app: string;
  schemaVersion: number;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

export async function exportBackup(): Promise<Backup> {
  const tables: Record<string, unknown[]> = {};
  for (const name of TABLE_NAMES) tables[name] = await db.table(name).toArray();
  return { app: BACKUP_APP, schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), tables };
}

export function backupFileName(): string {
  return `romeo-backup-${dayKey()}.json`;
}

/** Controlla che il file sia un backup di questa app prima di sovrascrivere qualsiasi cosa. */
export function validateBackup(data: unknown): Backup {
  const b = data as Backup;
  if (!b || typeof b !== 'object' || b.app !== BACKUP_APP) throw new Error('Questo file non è un backup del Viaggio nel Tempo.');
  if (typeof b.schemaVersion !== 'number' || b.schemaVersion > SCHEMA_VERSION) {
    throw new Error('Il backup viene da una versione più nuova dell’app.');
  }
  if (!b.tables || typeof b.tables !== 'object') throw new Error('Il backup è incompleto.');
  for (const name of TABLE_NAMES) {
    const t = b.tables[name];
    if (t !== undefined && !Array.isArray(t)) throw new Error(`Tabella non valida: ${name}`);
  }
  if (!Array.isArray(b.tables.settings) || b.tables.settings.length !== 1) throw new Error('Mancano le impostazioni.');
  return b;
}

export async function importBackup(b: Backup): Promise<void> {
  await db.transaction('rw', TABLE_NAMES.map((n) => db.table(n)), async () => {
    for (const name of TABLE_NAMES) {
      const t = db.table(name);
      await t.clear();
      const rows = b.tables[name];
      if (rows?.length) await t.bulkPut(rows);
    }
  });
  await ensureInitialized();
}

export async function resetAll(keepSettings: boolean): Promise<void> {
  const settings = await db.settings.get('main');
  await db.transaction('rw', TABLE_NAMES.map((n) => db.table(n)), async () => {
    for (const name of TABLE_NAMES) await db.table(name).clear();
    if (keepSettings && settings) await db.settings.put(settings);
  });
  await ensureInitialized();
}
