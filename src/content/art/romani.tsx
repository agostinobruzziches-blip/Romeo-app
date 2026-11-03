import type { FC } from 'react';

/* Illustrazioni originali. Palette: rosso pompeiano, oro, marmo, bronzo. */

const Colosseo: FC = () => (
  <g>
    <rect x="0" y="100" width="120" height="20" fill="#cdb894" />
    <path d="M8 100 V34 Q60 18 112 34 V100 Z" fill="#e2c9a0" />
    <path d="M8 34 Q60 18 112 34 L112 44 Q60 28 8 44 Z" fill="#d1b386" />
    {[50, 70, 90].map((y, row) => (
      <g key={y}>
        <path d={`M8 ${y - 4} H112`} stroke="#b8975f" strokeWidth="2" />
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d={`M${14 + i * 12.5} ${y + 8} v-7 a4.5 4.5 0 0 1 9 0 v7 Z`}
            fill={row === 0 ? '#a8312a' : '#8a6a3c'}
            opacity={row === 0 ? 0.55 : 0.75}
          />
        ))}
      </g>
    ))}
  </g>
);

const Appia: FC = () => (
  <g>
    <rect x="0" y="0" width="120" height="56" fill="#f6e7c9" />
    <rect x="0" y="54" width="120" height="66" fill="#9cbf7a" />
    <path d="M44 54 H76 L110 120 H10 Z" fill="#8f8a80" />
    {/* basoli */}
    {[
      [56, 60, 4],
      [64, 60, 4],
      [52, 70, 6],
      [64, 70, 6],
      [46, 84, 8],
      [62, 84, 8],
      [76, 84, 7],
      [38, 102, 10],
      [58, 102, 10],
      [80, 102, 10],
    ].map(([x, y, r]) => (
      <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={r} ry={r * 0.55} fill="#a7a299" stroke="#77736b" strokeWidth="1" />
    ))}
    {/* pino marittimo e pietra miliare */}
    <path d="M18 54 V30" stroke="#6a4127" strokeWidth="3" />
    <ellipse cx="18" cy="26" rx="16" ry="7" fill="#3f6d3a" />
    <rect x="94" y="64" width="8" height="18" rx="2" fill="#e6e1d6" stroke="#b9b2a4" />
    <text x="98" y="76" fontSize="6" textAnchor="middle" fill="#a8312a" fontFamily="serif">
      I
    </text>
  </g>
);

const Acquedotto: FC = () => (
  <g>
    <rect x="0" y="100" width="120" height="20" fill="#9cbf7a" />
    <rect x="0" y="26" width="120" height="10" fill="#d1b386" />
    <rect x="0" y="22" width="120" height="5" fill="#2f7fb5" />
    <rect x="0" y="36" width="120" height="64" fill="#dcc196" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${6 + i * 29} 100 V62 a11.5 11.5 0 0 1 23 0 V100 Z`} fill="#f6e7c9" />
    ))}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <path key={i} d={`M${4 + i * 14.5} 52 V44 a5 5 0 0 1 10 0 V52 Z`} fill="#f6e7c9" />
    ))}
  </g>
);

const Legionario: FC = () => (
  <g>
    {/* scudo rettangolare curvo (scutum) */}
    <rect x="58" y="44" width="44" height="66" rx="6" fill="#a8312a" stroke="#d9a520" strokeWidth="3" />
    <circle cx="80" cy="77" r="7" fill="#d9a520" />
    <path d="M66 54 l8 8 M94 54 l-8 8 M66 100 l8 -8 M94 100 l-8 -8" stroke="#d9a520" strokeWidth="3" />
    {/* elmo con pennacchio */}
    <path d="M22 50 Q22 26 42 24 Q62 26 62 50 L56 50 L56 62 H28 L28 50 Z" fill="#9a9488" stroke="#6d685f" strokeWidth="2" />
    <path d="M24 22 Q42 4 60 22" stroke="#a8312a" strokeWidth="8" fill="none" strokeLinecap="round" />
    <circle cx="42" cy="44" r="10" fill="#e2b48c" />
    <path d="M28 50 h6 v12 M56 50 h-6 v12" stroke="#6d685f" strokeWidth="3" fill="none" />
    <circle cx="38" cy="44" r="1.4" fill="#2b2a33" />
    <circle cx="46" cy="44" r="1.4" fill="#2b2a33" />
    {/* corazza a lamine */}
    <path d="M24 64 h40 v40 h-40 Z" fill="#b3ada2" />
    {[72, 80, 88, 96].map((y) => (
      <path key={y} d={`M24 ${y} h40`} stroke="#77736b" strokeWidth="2" />
    ))}
    <path d="M14 112 L22 30" stroke="#6a4127" strokeWidth="3" />
    <path d="M22 30 l-3 -10 l7 8 Z" fill="#9a9488" />
  </g>
);

const Numeri: FC = () => (
  <g>
    <rect x="12" y="20" width="96" height="80" rx="4" fill="#efe6d4" stroke="#b9a98a" strokeWidth="2" />
    <text x="60" y="52" fontSize="26" textAnchor="middle" fill="#a8312a" fontFamily="Georgia, serif" fontWeight="bold">
      XLVII
    </text>
    <text x="60" y="82" fontSize="18" textAnchor="middle" fill="#3a1f1b" fontFamily="Georgia, serif">
      I V X L C
    </text>
  </g>
);

const Pompei: FC = () => (
  <g>
    <rect x="0" y="0" width="120" height="120" fill="#f6e1c9" />
    {/* Vesuvio */}
    <path d="M0 80 L44 30 Q60 24 76 30 L120 80 Z" fill="#8a7a6a" />
    <path d="M52 28 Q58 6 50 0 M64 28 Q70 10 78 4" stroke="#b9b2a4" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7" />
    {/* casa pompeiana con muro rosso e colonne */}
    <rect x="10" y="78" width="100" height="42" fill="#a8312a" />
    <rect x="10" y="74" width="100" height="6" fill="#e6d3a8" />
    {[22, 40, 80, 98].map((x) => (
      <rect key={x} x={x - 3} y="80" width="6" height="40" fill="#efe6d4" />
    ))}
    <rect x="50" y="88" width="20" height="32" fill="#3a1f1b" />
    {/* forno del pane */}
    <path d="M52 96 a8 8 0 0 1 16 0 v6 h-16 Z" fill="#d9a520" />
  </g>
);

const Pantheon: FC = () => (
  <g>
    <rect x="0" y="100" width="120" height="20" fill="#cdb894" />
    {/* cupola */}
    <path d="M18 64 Q18 18 66 18 Q114 18 114 64 Z" fill="#d6d0c2" />
    <ellipse cx="66" cy="20" rx="7" ry="3" fill="#7f7a70" />
    <path d="M30 60 Q34 32 66 28 M102 60 Q98 32 66 28" stroke="#bdb6a8" strokeWidth="1.5" fill="none" />
    <rect x="18" y="62" width="96" height="38" fill="#e6e1d6" />
    {/* pronao con colonne e frontone */}
    <path d="M4 56 L40 40 L76 56 Z" fill="#f4f1ea" stroke="#bdb6a8" strokeWidth="1.5" />
    <rect x="4" y="56" width="72" height="6" fill="#e6e1d6" />
    {[10, 22, 34, 46, 58, 70].map((x) => (
      <rect key={x} x={x - 3} y="62" width="6" height="38" fill="#f4f1ea" stroke="#d6d0c2" strokeWidth="1" />
    ))}
    <rect x="34" y="74" width="12" height="26" fill="#3a1f1b" opacity="0.6" />
  </g>
);

const Abaco: FC = () => (
  <g>
    <rect x="14" y="16" width="92" height="88" rx="6" fill="#8c6a3c" />
    <rect x="20" y="22" width="80" height="76" rx="3" fill="#a8844f" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <rect x={28 + i * 12} y="28" width="4" height="64" rx="2" fill="#5a4022" />
        {[0, 1, 2, 3].slice(0, (i * 3) % 5).map((k) => (
          <circle key={k} cx={30 + i * 12} cy={84 - k * 9} r="4.5" fill="#efe6d4" stroke="#b9a98a" strokeWidth="1" />
        ))}
        <circle cx={30 + i * 12} cy="36" r="4.5" fill={i % 2 ? '#efe6d4' : '#d9a520'} stroke="#b9a98a" strokeWidth="1" />
      </g>
    ))}
    <path d="M22 46 H98" stroke="#5a4022" strokeWidth="2" />
  </g>
);

export const ROMANI_ART: Record<string, FC> = {
  'rom-colosseo': Colosseo,
  'rom-appia': Appia,
  'rom-acquedotto': Acquedotto,
  'rom-legionario': Legionario,
  'rom-numeri': Numeri,
  'rom-pompei': Pompei,
  'rom-pantheon': Pantheon,
  'rom-abaco': Abaco,
};
