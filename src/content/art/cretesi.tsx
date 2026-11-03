import type { FC } from 'react';

/* Illustrazioni originali. Palette: azzurro mare, rosso affresco, ocra gialla. */

const Cnosso: FC = () => (
  <g>
    <rect x="0" y="96" width="120" height="24" fill="#d8c08f" />
    <rect x="10" y="50" width="100" height="46" fill="#f2e6cf" />
    <rect x="10" y="44" width="100" height="8" fill="#b8382b" />
    <rect x="30" y="30" width="60" height="16" fill="#f2e6cf" />
    <rect x="30" y="26" width="60" height="6" fill="#b8382b" />
    {/* colonne minoiche: rosse, più larghe in alto */}
    {[22, 44, 66, 88].map((x) => (
      <g key={x}>
        <path d={`M${x} 60 h12 l-2 36 h-8 Z`} fill="#b8382b" />
        <rect x={x - 2} y="56" width="16" height="5" rx="2" fill="#1f3346" />
      </g>
    ))}
    {/* corna di consacrazione */}
    <path d="M50 26 q0 -10 4 -10 v8 h12 v-8 q4 0 4 10 Z" fill="#f2e6cf" stroke="#b8a780" strokeWidth="1" />
  </g>
);

const Toro: FC = () => (
  <g>
    <rect x="6" y="14" width="108" height="92" rx="4" fill="#9fd3e8" />
    <path d="M6 14 h108 v6 h-108 Z M6 100 h108 v6 h-108 Z" fill="#e9b949" />
    {/* toro in corsa */}
    <path d="M20 70 Q30 54 56 56 Q76 56 86 50 L94 54 Q90 62 84 66 L90 86 H84 L78 74 Q62 78 46 74 L36 88 H30 L36 72 Q24 74 20 70 Z" fill="#b8382b" />
    <path d="M88 52 q8 -8 6 -16 M92 56 q12 -2 14 -12" stroke="#f2e6cf" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="86" cy="56" r="1.6" fill="#1f160f" />
    {/* acrobata in volo sopra il toro */}
    <path d="M46 44 Q58 30 72 40" stroke="#1f3346" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="40" cy="46" r="4.5" fill="#1f3346" />
    <path d="M72 40 l8 -6 M72 40 l6 4" stroke="#1f3346" strokeWidth="4" strokeLinecap="round" />
  </g>
);

const Delfini: FC = () => {
  const dolphin = 'M0 0 Q14 -14 34 -6 Q40 -4 44 -10 L44 0 Q40 0 36 2 Q20 10 6 6 L-2 12 L0 4 L-8 2 Z';
  return (
    <g>
      <rect x="0" y="0" width="120" height="120" fill="#cfe9f3" />
      <g transform="translate(20 46)">
        <path d={dolphin} fill="#2f6c9a" />
        <path d="M4 2 Q20 4 36 0" stroke="#e9b949" strokeWidth="2" fill="none" />
        <circle cx="34" cy="-4" r="1.4" fill="#fff" />
      </g>
      <g transform="translate(56 82) scale(0.9)">
        <path d={dolphin} fill="#2f6c9a" />
        <path d="M4 2 Q20 4 36 0" stroke="#e9b949" strokeWidth="2" fill="none" />
        <circle cx="34" cy="-4" r="1.4" fill="#fff" />
      </g>
      {/* pesciolini */}
      {[
        [80, 26],
        [92, 36],
        [30, 96],
      ].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y} q6 -5 12 0 q-6 5 -12 0 l-4 -3 v6 Z`} fill="#e9b949" />
      ))}
      <path d="M0 112 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#7fb8d6" strokeWidth="3" fill="none" />
    </g>
  );
};

const Pithos: FC = () => (
  <g>
    <path d="M40 18 h40 v6 Q100 34 98 66 Q96 98 74 108 H46 Q24 98 22 66 Q20 34 40 24 Z" fill="#c98a52" />
    <path d="M40 18 h40 v6 h-40 Z" fill="#a8693a" />
    <path d="M26 46 Q60 54 94 46 M24 64 Q60 72 96 64 M28 84 Q60 92 92 84" stroke="#8a5530" strokeWidth="3" fill="none" />
    {/* cordoni a rilievo con piccoli cerchi */}
    {[34, 46, 58, 70, 82].map((x) => (
      <circle key={x} cx={x} cy={56} r="2.4" fill="#8a5530" />
    ))}
    <path d="M24 36 q-8 4 -6 14 M96 36 q8 4 6 14" stroke="#a8693a" strokeWidth="5" fill="none" strokeLinecap="round" />
  </g>
);

const SPIRAL = Array.from({ length: 160 }, (_, i) => {
  const t = (i / 159) * Math.PI * 2 * 4.2;
  const r = 5 + (t / (Math.PI * 2 * 4.2)) * 37;
  return `${i ? 'L' : 'M'}${(60 + Math.cos(t) * r).toFixed(1)} ${(60 + Math.sin(t) * r).toFixed(1)}`;
}).join(' ');

const Festo: FC = () => (
  <g>
    <circle cx="60" cy="60" r="48" fill="#d8a46a" stroke="#a8693a" strokeWidth="3" />
    <path d={SPIRAL} fill="none" stroke="#8a5530" strokeWidth="1.8" />
    {/* simboli stampati */}
    <circle cx="70" cy="44" r="3" fill="#6a3e22" />
    <path d="M40 50 l6 -6 l6 6" stroke="#6a3e22" strokeWidth="2" fill="none" />
    <path d="M78 74 h8 M82 70 v8" stroke="#6a3e22" strokeWidth="2" />
    <path d="M44 80 q4 -6 8 0 q4 6 8 0" stroke="#6a3e22" strokeWidth="2" fill="none" />
    <circle cx="34" cy="68" r="2.4" fill="none" stroke="#6a3e22" strokeWidth="2" />
    <path d="M86 50 l4 -4 m-4 0 l4 4" stroke="#6a3e22" strokeWidth="2" />
    <path d="M58 92 v6 m-4 -3 h8" stroke="#6a3e22" strokeWidth="2" />
  </g>
);

const Minosse: FC = () => (
  <g>
    {/* labirinto */}
    <rect x="12" y="12" width="96" height="96" rx="4" fill="#f2e6cf" />
    <path
      d="M20 20 H100 V100 H20 V30 H90 V90 H30 V40 H80 V80 H40 V50 H70 V70 H50 V60"
      stroke="#b8382b"
      strokeWidth="5"
      fill="none"
      strokeLinejoin="round"
    />
    {/* corona */}
    <path d="M50 58 l4 6 l6 -8 l6 8 l4 -6 v10 h-20 Z" fill="#e9b949" stroke="#a87a12" strokeWidth="1" />
  </g>
);

const Lineare: FC = () => (
  <g>
    <rect x="22" y="14" width="76" height="92" rx="10" fill="#c9a07a" stroke="#8a6440" strokeWidth="2" />
    {/* segni della Lineare A */}
    <path d="M32 28 v12 M38 28 v12 M44 34 h8 M48 30 v8" stroke="#4a3220" strokeWidth="2.4" />
    <path d="M62 28 l6 12 l6 -12 M80 28 v12 h6" stroke="#4a3220" strokeWidth="2.4" fill="none" />
    {/* numeri: trattini = unità, puntini = decine */}
    <path d="M32 56 v12 M37 56 v12 M42 56 v12" stroke="#4a3220" strokeWidth="2.4" />
    <circle cx="56" cy="62" r="2.6" fill="#4a3220" />
    <circle cx="64" cy="62" r="2.6" fill="#4a3220" />
    <path d="M76 56 l6 6 l-6 6 M86 56 v12" stroke="#4a3220" strokeWidth="2.4" fill="none" />
    <path d="M32 84 h20 M42 78 v12 M64 80 q6 -6 12 0 q-6 6 -12 0 M84 78 v12 h6" stroke="#4a3220" strokeWidth="2.4" fill="none" />
  </g>
);

const Nave: FC = () => (
  <g>
    <rect x="0" y="80" width="120" height="40" fill="#5c9fca" />
    <path d="M0 86 q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#a9d0e6" strokeWidth="2" fill="none" />
    {/* scafo con prua alta */}
    <path d="M14 70 H100 Q106 70 110 58 L112 60 Q108 82 92 86 H28 Q16 84 14 70 Z" fill="#8a5530" />
    <path d="M16 74 H104" stroke="#e9b949" strokeWidth="2" />
    {/* remi */}
    {[30, 42, 54, 66, 78].map((x) => (
      <path key={x} d={`M${x} 80 l-6 14`} stroke="#6a3e22" strokeWidth="2" />
    ))}
    {/* albero e vela */}
    <path d="M60 70 V20" stroke="#6a3e22" strokeWidth="3" />
    <path d="M36 24 H84 V60 H36 Z" fill="#f2e6cf" />
    <path d="M36 36 H84 M36 48 H84" stroke="#b8382b" strokeWidth="3" />
  </g>
);

export const CRETESI_ART: Record<string, FC> = {
  'cre-cnosso': Cnosso,
  'cre-toro': Toro,
  'cre-delfini': Delfini,
  'cre-pithos': Pithos,
  'cre-festo': Festo,
  'cre-minosse': Minosse,
  'cre-lineare': Lineare,
  'cre-nave': Nave,
};
