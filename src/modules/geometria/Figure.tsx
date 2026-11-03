import { useId, useState } from 'react';
import type { Shape } from './shapes';

/*
 * Disegno della figura. Niente movimento: solo colori che cambiano quando si tocca.
 * - grid: quadretti visibili (ogni quadretto = 1 unità)
 * - highlight: 'contorno' (bordo spesso) o 'superficie' (interno colorato)
 * - mode 'cells': si toccano i quadretti per segnarli mentre si contano
 * - mode 'edges': si toccano i lati dei quadretti sul bordo
 */

const C = {
  fill: '#f6f8fb',
  stroke: '#2e5e8c',
  grid: '#b9c9dc',
  contorno: '#c8553d',
  superficie: '#fbecc9',
  marked: '#9fc3e6',
  ink: '#2b2a33',
  muted: '#5b5866',
};

type Pt = [number, number];

function outline(s: Shape): Pt[] {
  switch (s.type) {
    case 'rettangolo':
      return [[0, 0], [s.b, 0], [s.b, s.h], [0, s.h]];
    case 'quadrato':
      return [[0, 0], [s.l, 0], [s.l, s.l], [0, s.l]];
    case 'triangolo': {
      const ax = Math.round(s.b * 0.35);
      return [[ax, 0], [s.b, s.h], [0, s.h]];
    }
    case 'elle':
      return [[0, 0], [s.W - s.cw, 0], [s.W - s.cw, s.ch], [s.W, s.ch], [s.W, s.H], [0, s.H]];
  }
}

function dims(s: Shape): [number, number] {
  switch (s.type) {
    case 'rettangolo':
    case 'triangolo':
      return [s.b, s.h];
    case 'quadrato':
      return [s.l, s.l];
    case 'elle':
      return [s.W, s.H];
  }
}

/** Quadretti interni (per figure rettangolari e a L). */
function cells(s: Shape): Pt[] {
  const [w, h] = dims(s);
  const out: Pt[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (s.type === 'triangolo') continue;
      if (s.type === 'elle' && x >= s.W - s.cw && y < s.ch) continue;
      out.push([x, y]);
    }
  return out;
}

/** Lati di quadretto sul bordo (solo rettangoli e quadrati). */
function edges(s: Shape): Array<[Pt, Pt]> {
  const [w, h] = dims(s);
  const out: Array<[Pt, Pt]> = [];
  for (let x = 0; x < w; x++) out.push([[x, 0], [x + 1, 0]], [[x, h], [x + 1, h]]);
  for (let y = 0; y < h; y++) out.push([[0, y], [0, y + 1]], [[w, y], [w, y + 1]]);
  return out;
}

export interface FigureProps {
  shape: Shape;
  grid?: boolean;
  unit?: string;
  labels?: boolean;
  /** Etichette con il punto di domanda (problemi al contrario). */
  unknown?: 'lato' | 'altezza';
  highlight?: 'contorno' | 'superficie' | null;
  mode?: 'cells' | 'edges' | null;
  /** Mostra come si divide la figura (triangolo = metà rettangolo, L = due rettangoli). */
  split?: boolean;
  onMark?: (marked: number, total: number) => void;
  maxWidth?: number;
}

export function Figure({ shape, grid = false, unit = 'cm', labels = true, unknown, highlight = null, mode = null, split = false, onMark, maxWidth = 340 }: FigureProps) {
  const [w, h] = dims(shape);
  const u = Math.min(260 / w, 170 / h, 44);
  const M = 42;
  const W = w * u + M * 2;
  const H = h * u + M * 2;
  const P = (p: Pt) => `${M + p[0] * u},${M + p[1] * u}`;
  const poly = outline(shape).map(P).join(' ');
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const clip = `fig-${useId().replace(/:/g, '')}`;
  const toggle = (k: string, total: number) => {
    const next = new Set(marked);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setMarked(next);
    onMark?.(next.size, total);
  };
  const u1 = unit === 'quadretti' ? '' : ` ${unit}`;
  const lab = (n: number | string) => `${n}${typeof n === 'number' ? u1 : ''}`;
  const allCells = cells(shape);
  const allEdges = shape.type === 'rettangolo' || shape.type === 'quadrato' ? edges(shape) : [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth }} role="img" aria-label={`Figura: ${shape.type}`}>
      <defs>
        <clipPath id={clip}>
          <polygon points={poly} />
        </clipPath>
      </defs>
      <polygon points={poly} fill={highlight === 'superficie' ? C.superficie : C.fill} />
      {mode === 'cells' &&
        allCells.map(([x, y]) => {
          const k = `${x}-${y}`;
          return (
            <rect
              key={k}
              x={M + x * u + 1}
              y={M + y * u + 1}
              width={u - 2}
              height={u - 2}
              rx="3"
              fill={marked.has(k) ? C.marked : 'transparent'}
              onClick={() => toggle(k, allCells.length)}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
      {grid && (
        <g clipPath={`url(#${clip})`} stroke={C.grid} strokeWidth="1.2" pointerEvents="none">
          {Array.from({ length: w - 1 }, (_, i) => (
            <line key={`v${i}`} x1={M + (i + 1) * u} y1={M} x2={M + (i + 1) * u} y2={M + h * u} />
          ))}
          {Array.from({ length: h - 1 }, (_, i) => (
            <line key={`h${i}`} x1={M} y1={M + (i + 1) * u} x2={M + w * u} y2={M + (i + 1) * u} />
          ))}
        </g>
      )}
      <polygon
        points={poly}
        fill="none"
        stroke={highlight === 'contorno' ? C.contorno : C.stroke}
        strokeWidth={highlight === 'contorno' ? 6 : 3}
        strokeLinejoin="round"
        pointerEvents="none"
      />
      {mode === 'edges' &&
        allEdges.map(([a, b]) => {
          const k = `${a.join(',')}-${b.join(',')}`;
          const [x1, y1] = [M + a[0] * u, M + a[1] * u];
          const [x2, y2] = [M + b[0] * u, M + b[1] * u];
          return (
            <g key={k} onClick={() => toggle(k, allEdges.length)} style={{ cursor: 'pointer' }}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="22" />
              {marked.has(k) && <line x1={x1 + 2} y1={y1 + (y1 === y2 ? 0 : 2)} x2={x2 - (x1 === x2 ? 0 : 2)} y2={y2 - (y1 === y2 ? 0 : 2)} stroke={C.contorno} strokeWidth="7" strokeLinecap="round" />}
            </g>
          );
        })}
      {split && shape.type === 'triangolo' && (
        <>
          <polygon points={[[0, 0], [w, 0], [w, h], [0, h]].map((p) => P(p as Pt)).join(' ')} fill="none" stroke={C.muted} strokeWidth="2" strokeDasharray="6 5" />
        </>
      )}
      {split && shape.type === 'elle' && (
        <line x1={M} y1={M + shape.ch * u} x2={M + (shape.W - shape.cw) * u} y2={M + shape.ch * u} stroke={C.contorno} strokeWidth="3" strokeDasharray="7 5" />
      )}
      {shape.type === 'triangolo' && (
        <>
          <line x1={M + Math.round(w * 0.35) * u} y1={M} x2={M + Math.round(w * 0.35) * u} y2={M + h * u} stroke={C.muted} strokeWidth="2" strokeDasharray="5 4" />
          {labels && (
            <text x={M + Math.round(w * 0.35) * u + 6} y={M + (h * u) / 2} fontSize="15" fontWeight="bold" fill={C.ink}>
              h {lab(h)}
            </text>
          )}
        </>
      )}
      {labels && (
        <g fontSize="16" fontWeight="bold" fill={C.ink}>
          {/* base sotto */}
          <text x={M + (w * u) / 2} y={M + h * u + 24} textAnchor="middle">
            {unknown === 'lato' ? '?' : lab(w)}
          </text>
          {/* altezza a sinistra */}
          {shape.type !== 'triangolo' && shape.type !== 'quadrato' && (
            <text x={M - 8} y={M + (h * u) / 2 + 5} textAnchor="end">
              {unknown === 'altezza' ? '?' : shape.type === 'elle' ? lab(shape.H) : lab(h)}
            </text>
          )}
          {shape.type === 'quadrato' && (
            <text x={M - 8} y={M + (h * u) / 2 + 5} textAnchor="end">
              {unknown === 'lato' ? '?' : lab(h)}
            </text>
          )}
          {shape.type === 'elle' && (
            <>
              <text x={M + ((shape.W - shape.cw) * u) / 2} y={M - 8} textAnchor="middle">
                {lab(shape.W - shape.cw)}
              </text>
              <text x={M + w * u + 6} y={M + ((shape.ch + h) * u) / 2 + 5}>{lab(shape.H - shape.ch)}</text>
              <text x={M + (shape.W - shape.cw) * u + 6} y={M + (shape.ch * u) / 2 + 5}>{lab(shape.ch)}</text>
            </>
          )}
        </g>
      )}
    </svg>
  );
}
