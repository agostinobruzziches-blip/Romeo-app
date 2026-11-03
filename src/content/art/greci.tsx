import type { FC } from 'react';

/* Illustrazioni originali. Palette: marmo bianco, blu, terracotta, nero. */

const Partenone: FC = () => (
  <g>
    <rect x="0" y="98" width="120" height="22" fill="#b9a98a" />
    <path d="M6 98 h108 v-6 h-108 Z" fill="#d6d0c2" />
    <path d="M10 92 h100 v-5 h-100 Z" fill="#e6e1d6" />
    {[16, 30, 44, 58, 72, 86, 100].map((x) => (
      <g key={x}>
        <rect x={x - 4} y="46" width="8" height="41" fill="#f4f1ea" />
        <path d={`M${x - 2} 48 v37 M${x + 2} 48 v37`} stroke="#d6d0c2" strokeWidth="1" />
      </g>
    ))}
    <rect x="8" y="40" width="104" height="7" fill="#e6e1d6" />
    <path d="M8 40 L60 18 L112 40 Z" fill="#f4f1ea" stroke="#d6d0c2" strokeWidth="1.5" />
    <path d="M24 36 L60 22 L96 36 Z" fill="#c8553d" opacity="0.35" />
  </g>
);

const Olimpiadi: FC = () => (
  <g>
    {/* corona d'olivo */}
    <path d="M60 104 Q20 96 22 56 Q24 30 44 18" stroke="#5e7d3a" strokeWidth="3" fill="none" />
    <path d="M60 104 Q100 96 98 56 Q96 30 76 18" stroke="#5e7d3a" strokeWidth="3" fill="none" />
    {[
      [26, 84, -40],
      [22, 66, -15],
      [26, 46, 15],
      [36, 30, 35],
      [94, 84, 40],
      [98, 66, 15],
      [94, 46, -15],
      [84, 30, -35],
      [40, 98, -70],
      [80, 98, 70],
    ].map(([x, y, r]) => (
      <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="9" ry="4" fill="#7da24a" transform={`rotate(${r} ${x} ${y})`} />
    ))}
    {[
      [30, 76],
      [90, 76],
      [32, 38],
      [88, 38],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#2b2a33" />
    ))}
    {/* corridore stilizzato come sui vasi */}
    <circle cx="62" cy="44" r="6" fill="#c8553d" />
    <path d="M62 50 L58 70 M58 70 L48 84 M58 70 L70 82 M60 56 L48 60 M60 56 L74 50" stroke="#c8553d" strokeWidth="5" strokeLinecap="round" fill="none" />
  </g>
);

const Teatro: FC = () => (
  <g>
    <rect x="0" y="0" width="120" height="120" fill="#cfe0c3" />
    {/* gradinate a semicerchio viste dall'alto */}
    {[88, 78, 68, 58, 48, 38].map((r, i) => (
      <path
        key={r}
        d={`M${60 - r} 104 A ${r} ${r} 0 0 1 ${60 + r} 104`}
        stroke={i % 2 ? '#d6cfbf' : '#ebe6db'}
        strokeWidth="9"
        fill="none"
      />
    ))}
    <path d="M60 104 L60 18 M60 104 L20 40 M60 104 L100 40" stroke="#bdb6a8" strokeWidth="2" />
    <path d="M28 104 A 32 32 0 0 1 92 104 Z" fill="#e6d3a8" stroke="#c9b383" strokeWidth="1.5" />
    <rect x="0" y="104" width="120" height="16" fill="#b9a98a" />
    <circle cx="60" cy="96" r="3" fill="#c8553d" />
    {/* onde sonore */}
    <path d="M66 88 q6 -4 6 -12 M72 92 q10 -6 10 -20" stroke="#2e5e8c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </g>
);

const Pitagora: FC = () => (
  <g>
    {/* tavola pitagorica in miniatura */}
    <rect x="58" y="44" width="54" height="54" fill="#f6f8fb" stroke="#2e5e8c" strokeWidth="1.5" />
    {[1, 2, 3, 4].map((i) => (
      <g key={i}>
        <path d={`M${58 + i * 10.8} 44 v54 M58 ${44 + i * 10.8} h54`} stroke="#9fb6cf" strokeWidth="1" />
      </g>
    ))}
    {[1, 2, 3, 4, 5].map((r) =>
      [1, 2, 3, 4, 5].map((c) => (
        <text key={`${r}-${c}`} x={58 + (c - 0.5) * 10.8} y={44 + (r - 0.5) * 10.8 + 3} fontSize="6" textAnchor="middle" fill="#1f2b3a" fontFamily="sans-serif">
          {r * c}
        </text>
      )),
    )}
    {/* filosofo con barba e chitone */}
    <path d="M14 112 L20 66 Q34 56 48 66 L54 112 Z" fill="#f4f1ea" stroke="#d6d0c2" strokeWidth="1.5" />
    <path d="M22 70 L50 96" stroke="#c8553d" strokeWidth="4" />
    <circle cx="34" cy="44" r="13" fill="#e2b48c" />
    <path d="M22 44 Q24 30 34 30 Q46 30 46 44 Q46 36 34 36 Q24 36 22 44 Z" fill="#9a9488" />
    <path d="M24 48 Q26 66 34 66 Q42 66 44 48 Q40 56 34 56 Q28 56 24 48 Z" fill="#d6d0c2" />
    <circle cx="30" cy="44" r="1.4" fill="#2b2a33" />
    <circle cx="38" cy="44" r="1.4" fill="#2b2a33" />
    {/* triangolo rettangolo */}
    <path d="M62 30 L62 14 L86 30 Z" fill="none" stroke="#c8553d" strokeWidth="2.4" strokeLinejoin="round" />
  </g>
);

const Oplita: FC = () => (
  <g>
    {/* elmo corinzio con cresta */}
    <path d="M30 44 Q30 16 60 14 Q90 16 90 44 L90 74 Q80 78 74 70 L74 52 H46 L46 70 Q40 78 30 74 Z" fill="#b8863e" stroke="#8a6228" strokeWidth="2" />
    <path d="M52 52 v20 M68 52 v20" stroke="#2b2a33" strokeWidth="4" />
    <path d="M30 22 Q60 -2 92 22 Q96 30 90 30 Q60 10 32 30 Q26 30 30 22 Z" fill="#c8553d" />
    {/* scudo rotondo (hoplon) */}
    <circle cx="74" cy="90" r="26" fill="#2e5e8c" stroke="#b8863e" strokeWidth="4" />
    <path d="M74 74 l4 12 h12 l-10 7 l4 12 l-10 -8 l-10 8 l4 -12 l-10 -7 h12 Z" fill="#f4f1ea" />
    <path d="M10 112 L44 60" stroke="#6a4127" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M44 60 l4 -10 l-10 6 Z" fill="#9a9488" />
  </g>
);

const Anfora: FC = () => (
  <g>
    <path d="M48 14 h24 v8 Q72 30 82 40 Q96 56 92 78 Q88 98 70 106 H50 Q32 98 28 78 Q24 56 38 40 Q48 30 48 22 Z" fill="#d06a3a" />
    <path d="M48 14 h24 v6 h-24 Z" fill="#2b2a33" />
    <path d="M44 24 Q30 26 30 42 M76 24 Q90 26 90 42" stroke="#2b2a33" strokeWidth="4" fill="none" />
    <path d="M30 56 H90 M28 88 H92" stroke="#2b2a33" strokeWidth="3" />
    {/* meandro greco */}
    <path d="M32 94 h6 v-4 h-4 v2 M40 94 h6 v-4 h-4 v2 M48 94 h6 v-4 h-4 v2 M56 94 h6 v-4 h-4 v2 M64 94 h6 v-4 h-4 v2 M72 94 h6 v-4 h-4 v2 M80 94 h6 v-4 h-4 v2" stroke="#2b2a33" strokeWidth="1.5" fill="none" />
    {/* figura nera: guerriero con lancia */}
    <circle cx="58" cy="62" r="4" fill="#2b2a33" />
    <path d="M58 66 L56 78 L50 86 M56 78 L62 86 M57 70 L68 66" stroke="#2b2a33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <circle cx="48" cy="72" r="6" fill="#2b2a33" />
    <path d="M70 58 L66 86" stroke="#2b2a33" strokeWidth="1.8" />
  </g>
);

const Civetta: FC = () => (
  <g>
    {/* moneta d'argento */}
    <circle cx="60" cy="60" r="50" fill="#c9ccd1" stroke="#9aa0a8" strokeWidth="3" />
    <circle cx="60" cy="60" r="43" fill="none" stroke="#b3b8bf" strokeWidth="1.5" />
    {/* civetta in rilievo */}
    <path d="M42 92 Q36 56 60 46 Q84 56 78 92 Z" fill="#a7adb5" />
    <circle cx="52" cy="58" r="8" fill="#e3e6ea" stroke="#7c838c" strokeWidth="1.5" />
    <circle cx="68" cy="58" r="8" fill="#e3e6ea" stroke="#7c838c" strokeWidth="1.5" />
    <circle cx="52" cy="58" r="3" fill="#4a4f57" />
    <circle cx="68" cy="58" r="3" fill="#4a4f57" />
    <path d="M57 64 h6 l-3 6 Z" fill="#7c838c" />
    <path d="M50 76 q4 3 8 0 M62 76 q4 3 8 0 M56 84 q4 3 8 0" stroke="#7c838c" strokeWidth="1.5" fill="none" />
    {/* ramo d'olivo e lettere ΑΘΕ */}
    <path d="M82 40 q8 -6 12 -2" stroke="#7c838c" strokeWidth="2" fill="none" />
    <ellipse cx="88" cy="36" rx="4" ry="2" fill="#9aa0a8" transform="rotate(-30 88 36)" />
    <text x="92" y="74" fontSize="10" fontFamily="serif" fill="#6b727b" transform="rotate(90 92 74)">
      ΑΘΕ
    </text>
  </g>
);

const Odisseo: FC = () => (
  <g>
    <rect x="0" y="78" width="120" height="42" fill="#2e5e8c" />
    <path d="M0 84 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#7fa6cc" strokeWidth="2.5" fill="none" />
    <path d="M0 98 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#5f8cbd" strokeWidth="2.5" fill="none" />
    {/* isola di Itaca all'orizzonte */}
    <path d="M78 78 q14 -20 34 0 Z" fill="#7da24a" />
    {/* nave con occhio a prua */}
    <path d="M10 70 H76 Q84 70 88 60 L92 62 Q86 82 70 84 H22 Q12 80 10 70 Z" fill="#2b2a33" />
    <circle cx="80" cy="72" r="3" fill="#f4f1ea" />
    <circle cx="80" cy="72" r="1.4" fill="#c8553d" />
    <path d="M44 70 V22" stroke="#6a4127" strokeWidth="3" />
    <path d="M22 26 H66 Q70 46 66 62 H22 Q18 46 22 26 Z" fill="#f4f1ea" />
    <path d="M30 36 h28 M28 46 h32 M30 56 h28" stroke="#c8553d" strokeWidth="2" />
    <circle cx="96" cy="22" r="9" fill="#f2c14e" />
  </g>
);

export const GRECI_ART: Record<string, FC> = {
  'gre-partenone': Partenone,
  'gre-olimpiadi': Olimpiadi,
  'gre-teatro': Teatro,
  'gre-pitagora': Pitagora,
  'gre-oplita': Oplita,
  'gre-anfora': Anfora,
  'gre-civetta': Civetta,
  'gre-odisseo': Odisseo,
};
