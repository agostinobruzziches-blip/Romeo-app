import type { ReactElement } from 'react';
import type { BarSpec } from './types';

/*
 * Modello a barre (metodo Singapore): rappresenta il problema SENZA dare il risultato.
 * Le quantità note hanno il loro numero, quella da trovare ha il punto di domanda.
 */

const W = 320;
const X0 = 10;
const BAR_W = W - 20;
const H = 34;

const C = {
  a: '#dce8f3',
  aStroke: '#2e5e8c',
  b: '#fbecc9',
  bStroke: '#b7791f',
  q: '#ffffff',
  ink: '#2b2a33',
  muted: '#5b5866',
};

function Box({ x, y, w, label, fill, stroke, dashed, hatch }: {
  x: number; y: number; w: number; label: string; fill: string; stroke: string; dashed?: boolean; hatch?: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={Math.max(w, 6)} height={H} rx="6" fill={hatch ? 'url(#tratteggio)' : fill} stroke={stroke} strokeWidth="2" strokeDasharray={dashed ? '6 4' : undefined} />
      {w > 18 && (
        <text x={x + w / 2} y={y + H / 2 + 7} textAnchor="middle" fontSize="19" fontWeight="bold" fill={C.ink}>
          {label}
        </text>
      )}
    </g>
  );
}

/** Graffa orizzontale con etichetta, sopra (dir -1) o sotto (dir 1) la barra. */
function Brace({ x1, x2, y, label, dir = -1 }: { x1: number; x2: number; y: number; label: string; dir?: 1 | -1 }) {
  const m = (x1 + x2) / 2;
  const d = 8 * dir;
  return (
    <g>
      <path d={`M${x1} ${y} q0 ${d} 8 ${d} H${m - 8} q8 0 8 ${d} q0 ${-d} 8 ${-d} H${x2 - 8} q8 0 8 ${-d}`} fill="none" stroke={C.muted} strokeWidth="2" />
      <text x={m} y={y + d * 2 + (dir === -1 ? -4 : 14)} textAnchor="middle" fontSize="17" fontWeight="bold" fill={C.ink}>
        {label}
      </text>
    </g>
  );
}

function Name({ y, text }: { y: number; text: string }) {
  return (
    <text x={X0} y={y} fontSize="15" fill={C.muted}>
      {text}
    </text>
  );
}

export function BarModel({ spec }: { spec: BarSpec }) {
  let body: ReactElement;
  let height = 110;
  const top = 46;

  switch (spec.kind) {
    case 'parti': {
      const tot = spec.a + spec.b;
      const wa = (spec.a / tot) * BAR_W;
      body = (
        <>
          <Brace x1={X0} x2={X0 + BAR_W} y={top - 4} label={`? ${spec.unit} in tutto`} />
          <Box x={X0} y={top} w={wa} label={String(spec.a)} fill={C.a} stroke={C.aStroke} />
          <Box x={X0 + wa} y={top} w={BAR_W - wa} label={String(spec.b)} fill={C.b} stroke={C.bStroke} />
        </>
      );
      break;
    }
    case 'togli': {
      const wp = (spec.part / spec.whole) * BAR_W;
      body = (
        <>
          <Brace x1={X0} x2={X0 + BAR_W} y={top - 4} label={`${spec.whole} ${spec.unit}`} />
          <Box x={X0} y={top} w={BAR_W - wp} label="?" fill={C.q} stroke={C.aStroke} />
          <Box x={X0 + BAR_W - wp} y={top} w={wp} label={String(spec.part)} fill={C.b} stroke={C.bStroke} hatch />
          <text x={X0 + BAR_W - wp / 2} y={top + H + 20} textAnchor="middle" fontSize="15" fill={C.muted}>
            via
          </text>
          <text x={X0 + (BAR_W - wp) / 2} y={top + H + 20} textAnchor="middle" fontSize="15" fill={C.muted}>
            restano
          </text>
        </>
      );
      height = 126;
      break;
    }
    case 'confronto': {
      const wb = (spec.small / spec.big) * (BAR_W - 70);
      const wBig = BAR_W - 70;
      body = (
        <>
          <Name y={22} text={spec.bigLabel} />
          <Box x={X0 + 70} y={8} w={wBig} label={String(spec.big)} fill={C.a} stroke={C.aStroke} />
          <Name y={22 + 50} text={spec.smallLabel} />
          <Box x={X0 + 70} y={58} w={wb} label={spec.unknown === 'small' ? '?' : String(spec.small)} fill={C.b} stroke={C.bStroke} />
          <Box
            x={X0 + 70 + wb}
            y={58}
            w={wBig - wb}
            label={spec.unknown === 'diff' ? '?' : String(spec.big - spec.small)}
            fill={C.q}
            stroke={C.muted}
            dashed
          />
          <text x={X0 + 70 + wb + (wBig - wb) / 2} y={58 + H + 18} textAnchor="middle" fontSize="15" fill={C.muted}>
            {spec.unknown === 'diff' ? 'differenza' : 'in meno'}
          </text>
        </>
      );
      height = 116;
      break;
    }
    case 'confronto-piu': {
      const tot = spec.base + spec.extra;
      const w0 = (spec.base / tot) * (BAR_W - 70);
      body = (
        <>
          <Name y={22} text={spec.baseLabel} />
          <Box x={X0 + 70} y={8} w={w0} label={String(spec.base)} fill={C.a} stroke={C.aStroke} />
          <Name y={22 + 50} text={spec.otherLabel} />
          <Box x={X0 + 70} y={58} w={w0} label={String(spec.base)} fill={C.a} stroke={C.aStroke} />
          <Box x={X0 + 70 + w0} y={58} w={BAR_W - 70 - w0} label={`${spec.extra} in più`} fill={C.b} stroke={C.bStroke} />
          <Brace x1={X0 + 70} x2={X0 + BAR_W} y={58 + H + 4} label="?" dir={1} />
        </>
      );
      height = 136;
      break;
    }
    case 'gruppi': {
      const n = spec.groups;
      const w = BAR_W / n;
      body = (
        <>
          <Brace x1={X0} x2={X0 + BAR_W} y={top - 4} label={`? ${spec.unit} in tutto`} />
          {Array.from({ length: n }, (_, i) => (
            <Box key={i} x={X0 + i * w} y={top} w={w} label={String(spec.each)} fill={i % 2 ? C.b : C.a} stroke={i % 2 ? C.bStroke : C.aStroke} />
          ))}
          <text x={X0 + BAR_W / 2} y={top + H + 20} textAnchor="middle" fontSize="15" fill={C.muted}>
            {n} gruppi uguali
          </text>
        </>
      );
      height = 126;
      break;
    }
    case 'ripartizione':
    case 'frazione': {
      const n = spec.parts;
      const w = BAR_W / n;
      body = (
        <>
          <Brace x1={X0} x2={X0 + BAR_W} y={top - 4} label={`${spec.whole} ${spec.unit}`} />
          {Array.from({ length: n }, (_, i) => (
            <Box
              key={i}
              x={X0 + i * w}
              y={top}
              w={w}
              label={i === 0 ? '?' : spec.kind === 'frazione' ? '' : '?'}
              fill={spec.kind === 'frazione' && i === 0 ? C.b : C.q}
              stroke={spec.kind === 'frazione' && i === 0 ? C.bStroke : C.aStroke}
            />
          ))}
          <text x={X0 + BAR_W / 2} y={top + H + 20} textAnchor="middle" fontSize="15" fill={C.muted}>
            {spec.kind === 'frazione' ? `${n} parti uguali: ne prendo una` : `${n} parti uguali`}
          </text>
        </>
      );
      height = 126;
      break;
    }
    case 'contenenza': {
      const w = Math.min(70, BAR_W / 4);
      body = (
        <>
          <Brace x1={X0} x2={X0 + BAR_W} y={top - 4} label={`${spec.whole} ${spec.unit}`} />
          <Box x={X0} y={top} w={w} label={String(spec.each)} fill={C.a} stroke={C.aStroke} />
          <Box x={X0 + w} y={top} w={w} label={String(spec.each)} fill={C.a} stroke={C.aStroke} />
          <Box x={X0 + 2 * w} y={top} w={BAR_W - 2 * w} label="…" fill={C.q} stroke={C.aStroke} dashed />
          <text x={X0 + BAR_W / 2} y={top + H + 20} textAnchor="middle" fontSize="15" fill={C.muted}>
            quanti pezzi da {spec.each} ci stanno?
          </text>
        </>
      );
      height = 126;
      break;
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" style={{ maxWidth: 360 }} role="img" aria-label="Modello a barre del problema">
      <defs>
        <pattern id="tratteggio" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill={C.b} />
          <line x1="0" y1="0" x2="0" y2="8" stroke={C.bStroke} strokeWidth="2" />
        </pattern>
      </defs>
      {body}
    </svg>
  );
}
