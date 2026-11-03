import type { FC } from 'react';

/* Illustrazioni originali, viewBox 0 0 120 120. Palette: ocra, terra, carbone. */

const Lascaux: FC = () => (
  <g>
    <path d="M6 100 Q10 30 60 18 Q110 30 114 100 Z" fill="#e2c69a" />
    <path d="M6 100 Q10 30 60 18 Q110 30 114 100" fill="none" stroke="#a87c4f" strokeWidth="3" />
    {/* cavallo */}
    <path d="M30 70 q4 -14 22 -12 q10 1 14 -6 l4 2 q-2 6 -6 8 q8 4 6 14 l-4 0 q0 -6 -4 -8 q-10 4 -20 2 l-3 10 h-4 l2 -12 q-6 -2 -7 2 Z" fill="#8a3b1f" />
    <path d="M66 52 l4 -6 l2 6" fill="#2b2a33" />
    {/* toro */}
    <path d="M60 86 q6 -10 20 -8 q8 0 12 -4 l6 2 q-2 6 -6 8 l2 10 h-4 l-2 -6 q-10 2 -18 0 l-2 6 h-4 Z" fill="#2b2a33" opacity="0.85" />
    <path d="M94 74 q4 -6 2 -10 M98 76 q6 -4 6 -10" stroke="#2b2a33" strokeWidth="2" fill="none" />
    {/* cervo */}
    <path d="M78 46 q4 -4 12 -2 l4 -4 h2 l-2 6 l-2 8 h-3 l0 -5 h-8 l-1 5 h-3 Z" fill="#c47a3a" />
    <path d="M94 40 l-2 -8 m2 8 l4 -7 m-6 0 l-3 -3 m7 3 l3 -3" stroke="#7a4a2a" strokeWidth="1.6" />
  </g>
);

const Mammut: FC = () => (
  <g>
    <ellipse cx="60" cy="104" rx="46" ry="6" fill="#d9c09a" />
    <path d="M24 70 Q24 36 58 34 Q86 32 92 56 Q100 58 100 72 L96 100 H86 L84 82 H70 L68 100 H58 L56 84 H42 L40 100 H30 L28 84 Q22 80 24 70 Z" fill="#7a4a2a" />
    <path d="M30 50 q4 -6 10 -2 M44 42 q4 -6 10 -2 M58 40 q4 -6 10 -2 M72 42 q4 -6 10 0" stroke="#5a341c" strokeWidth="2" fill="none" />
    {/* testa e proboscide */}
    <path d="M84 40 Q104 36 106 60 Q108 80 98 96 l-6 -2 q8 -16 4 -30" fill="#6a3e22" />
    <circle cx="94" cy="50" r="2.4" fill="#1f160f" />
    {/* zanne */}
    <path d="M96 64 Q118 70 110 92 Q108 80 94 72 Z" fill="#fff6e0" stroke="#d6c4a0" strokeWidth="1" />
  </g>
);

const Amigdala: FC = () => (
  <g>
    <path d="M60 14 Q92 46 84 84 Q78 106 60 108 Q42 106 36 84 Q28 46 60 14 Z" fill="#8f8a80" />
    <path d="M60 14 L50 46 L60 60 L70 46 Z" fill="#a8a296" />
    <path d="M36 84 L50 46 L60 60 L52 90 Z" fill="#7d786e" />
    <path d="M84 84 L70 46 L60 60 L68 90 Z" fill="#9c968a" />
    <path d="M52 90 L60 60 L68 90 L60 108 Z" fill="#b5afa3" />
    <path d="M60 14 Q92 46 84 84 Q78 106 60 108 Q42 106 36 84 Q28 46 60 14 Z" fill="none" stroke="#5b5650" strokeWidth="2.5" />
  </g>
);

const Otzi: FC = () => (
  <g>
    {/* montagne innevate */}
    <path d="M0 96 L30 56 L50 80 L76 40 L120 96 Z" fill="#c9d6de" />
    <path d="M30 56 L38 66 L26 66 Z M76 40 L86 54 L66 54 Z" fill="#ffffff" />
    {/* figura con mantello di pelle e cappello di pelliccia */}
    <path d="M48 104 L52 70 Q60 62 68 70 L72 104 Z" fill="#8a5a3b" />
    <path d="M52 72 L48 92 M68 72 L72 92" stroke="#6a4127" strokeWidth="3" />
    <circle cx="60" cy="60" r="9" fill="#e9c39b" />
    <path d="M50 58 Q60 44 70 58 Q60 54 50 58 Z" fill="#5a3a22" />
    <path d="M55 66 q5 4 10 0" stroke="#5a3a22" strokeWidth="3" fill="none" />
    {/* ascia di rame */}
    <path d="M76 66 L84 100" stroke="#7a4a2a" strokeWidth="3" strokeLinecap="round" />
    <path d="M74 64 L82 60 L84 68 Z" fill="#c47a3a" />
  </g>
);

const Stonehenge: FC = () => (
  <g>
    <rect x="0" y="92" width="120" height="28" fill="#9cbf7a" />
    <path d="M0 92 Q60 84 120 92" fill="#b3d08f" />
    <rect x="14" y="52" width="14" height="42" rx="2" fill="#8d8a82" />
    <rect x="36" y="52" width="14" height="42" rx="2" fill="#9a978f" />
    <rect x="12" y="44" width="40" height="10" rx="2" fill="#7b7870" />
    <rect x="70" y="56" width="14" height="38" rx="2" fill="#9a978f" />
    <rect x="92" y="56" width="14" height="38" rx="2" fill="#8d8a82" />
    <rect x="68" y="48" width="40" height="10" rx="2" fill="#7b7870" />
    <rect x="54" y="72" width="10" height="22" rx="2" fill="#a7a49b" />
    <circle cx="96" cy="22" r="10" fill="#f2c14e" />
  </g>
);

const Palafitte: FC = () => (
  <g>
    <rect x="0" y="80" width="120" height="40" fill="#7fb3c8" />
    <path d="M0 86 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#a9d0de" strokeWidth="2" fill="none" />
    {[28, 44, 60, 76, 92].map((x) => (
      <rect key={x} x={x - 2} y="62" width="4" height="50" fill="#6a4127" />
    ))}
    <rect x="22" y="60" width="76" height="6" fill="#8a5a3b" />
    <rect x="32" y="40" width="56" height="20" fill="#c49a62" />
    <path d="M26 42 L60 18 L94 42 Z" fill="#b8863e" />
    <path d="M30 40 L60 20 L90 40" stroke="#8a6228" strokeWidth="2" fill="none" />
    <rect x="54" y="46" width="12" height="14" fill="#5a3a22" />
  </g>
);

const Fuoco: FC = () => (
  <g>
    <ellipse cx="60" cy="100" rx="34" ry="6" fill="#6b6259" />
    {[30, 44, 58, 72, 86].map((x, i) => (
      <ellipse key={x} cx={x} cy={98 - (i % 2) * 2} rx="7" ry="5" fill="#8f8a80" />
    ))}
    <path d="M38 94 L82 84 M40 84 L82 96" stroke="#6a4127" strokeWidth="6" strokeLinecap="round" />
    <path d="M60 22 Q84 50 76 74 Q72 90 60 90 Q48 90 44 74 Q38 54 52 40 Q52 54 58 56 Q54 38 60 22 Z" fill="#e8742a" />
    <path d="M60 48 Q74 64 68 78 Q64 86 60 86 Q52 86 52 76 Q52 66 58 62 Q58 70 62 70 Q64 58 60 48 Z" fill="#f6c142" />
  </g>
);

const Mani: FC = () => {
  const hand = 'M0 30 Q-2 14 2 10 L2 -10 Q2 -14 6 -14 Q9 -14 9 -10 L9 4 L11 -18 Q11 -22 15 -22 Q18 -21 18 -17 L17 4 L20 -14 Q21 -18 25 -17 Q28 -16 27 -12 L25 8 L29 -4 Q31 -8 34 -6 Q37 -4 35 0 L30 22 Q26 36 14 38 Q2 38 0 30 Z';
  return (
    <g>
      <rect x="0" y="0" width="120" height="120" fill="#d9b98a" />
      <path d="M0 20 Q40 10 70 24 T120 14 M0 70 Q30 60 60 76 T120 66" stroke="#c9a676" strokeWidth="3" fill="none" />
      <g transform="translate(18 40)">
        <path d={hand} fill="#f3e2c3" stroke="#a8412c" strokeWidth="10" strokeLinejoin="round" opacity="0.75" />
        <path d={hand} fill="#f3e2c3" />
      </g>
      <g transform="translate(64 62) rotate(14)">
        <path d={hand} fill="#f3e2c3" stroke="#7a3b22" strokeWidth="10" strokeLinejoin="round" opacity="0.75" />
        <path d={hand} fill="#f3e2c3" />
      </g>
    </g>
  );
};

export const PREISTORIA_ART: Record<string, FC> = {
  'pre-lascaux': Lascaux,
  'pre-mammut': Mammut,
  'pre-amigdala': Amigdala,
  'pre-otzi': Otzi,
  'pre-stonehenge': Stonehenge,
  'pre-palafitte': Palafitte,
  'pre-fuoco': Fuoco,
  'pre-mani': Mani,
};
