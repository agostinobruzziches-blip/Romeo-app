import type { FC } from 'react';
import type { EpochId } from '../epochs';
import { CRETESI_ART } from './cretesi';
import { EGIZI_ART } from './egizi';
import { GRECI_ART } from './greci';
import { MEDIOEVO_ART } from './medioevo';
import { PREISTORIA_ART } from './preistoria';
import { ROMANI_ART } from './romani';

export const ART: Record<string, FC> = {
  ...PREISTORIA_ART,
  ...EGIZI_ART,
  ...CRETESI_ART,
  ...GRECI_ART,
  ...ROMANI_ART,
  ...MEDIOEVO_ART,
};

/** Illustrazione simbolo di ogni epoca sulla linea del tempo. */
export const EPOCH_EMBLEM: Record<EpochId, string> = {
  preistoria: 'pre-mammut',
  egizi: 'egi-piramide',
  cretesi: 'cre-toro',
  greci: 'gre-partenone',
  romani: 'rom-colosseo',
  medioevo: 'med-castello',
};

export function Art({ id, size = 120, muted = false }: { id: string; size?: number; muted?: boolean }) {
  const Comp = ART[id];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" style={muted ? { filter: 'grayscale(1) opacity(0.35)' } : undefined}>
      {Comp ? <Comp /> : null}
    </svg>
  );
}
