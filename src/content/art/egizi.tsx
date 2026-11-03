import type { FC } from 'react';

/* Illustrazioni originali. Palette: sabbia, oro, lapislazzuli, turchese. */

const Piramide: FC = () => (
  <g>
    <circle cx="94" cy="26" r="11" fill="#f2c14e" />
    <rect x="0" y="94" width="120" height="26" fill="#e3c37a" />
    <path d="M14 96 L60 30 L106 96 Z" fill="#e8c67c" />
    <path d="M60 30 L106 96 L72 96 Z" fill="#c9a259" />
    {[44, 58, 72, 86].map((y) => (
      <path key={y} d={`M${60 - (y - 30) * 0.7} ${y} H${60 + (y - 30) * 0.7}`} stroke="#b88f47" strokeWidth="1.2" />
    ))}
    <path d="M60 30 L66 38 L54 38 Z" fill="#f6e3a8" />
    <path d="M86 96 L100 74 L114 96 Z" fill="#d9b468" />
  </g>
);

const Papiro: FC = () => (
  <g>
    {/* rotolo */}
    <rect x="20" y="30" width="80" height="60" fill="#f1dfa6" />
    <rect x="14" y="26" width="10" height="68" rx="5" fill="#d9b468" />
    <rect x="96" y="26" width="10" height="68" rx="5" fill="#d9b468" />
    <path d="M30 42 H90 M30 52 H84 M30 62 H90 M30 72 H78" stroke="#c9a259" strokeWidth="1.2" />
    <circle cx="40" cy="80" r="3" fill="#2a4d8f" />
    <path d="M52 76 h10 v8 h-10 Z" fill="none" stroke="#2a4d8f" strokeWidth="2" />
    <path d="M70 84 q6 -10 12 0" stroke="#2a4d8f" strokeWidth="2" fill="none" />
    {/* pianta di papiro */}
    <path d="M110 120 L108 92" stroke="#3e7d5a" strokeWidth="2" />
    <path d="M108 92 l-8 -8 M108 92 l0 -10 M108 92 l8 -8" stroke="#3e7d5a" strokeWidth="2" />
  </g>
);

const Geroglifici: FC = () => (
  <g>
    <rect x="28" y="12" width="64" height="96" rx="4" fill="#e8d3a0" stroke="#b88f47" strokeWidth="2" />
    {/* occhio */}
    <path d="M38 28 Q50 18 62 28 Q50 36 38 28 Z" fill="none" stroke="#2a4d8f" strokeWidth="2.5" />
    <circle cx="50" cy="28" r="3.5" fill="#2a4d8f" />
    <path d="M50 32 l-2 8 M56 31 q6 6 2 10" stroke="#2a4d8f" strokeWidth="2" fill="none" />
    {/* uccello */}
    <path d="M68 40 q6 -14 16 -8 l4 -2 l-2 4 q0 10 -10 12 l-6 6 h-4 l4 -6 Z" fill="#a8312a" />
    {/* acqua */}
    <path d="M38 58 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4" stroke="#3aa6a0" strokeWidth="2.5" fill="none" />
    {/* ankh */}
    <path d="M78 56 q-6 -6 0 -12 q6 6 0 12 v18 M70 62 h16" stroke="#d9a520" strokeWidth="3" fill="none" />
    {/* cartiglio */}
    <rect x="38" y="80" width="44" height="20" rx="10" fill="none" stroke="#2a4d8f" strokeWidth="2.5" />
    <circle cx="50" cy="90" r="4" fill="#a8312a" />
    <path d="M60 84 v12 M66 84 v12" stroke="#2a4d8f" strokeWidth="2.5" />
    <path d="M72 94 q4 -8 6 0" stroke="#2a4d8f" strokeWidth="2.5" fill="none" />
  </g>
);

const Nilo: FC = () => (
  <g>
    <rect x="0" y="0" width="120" height="60" fill="#f7e7bd" />
    <rect x="0" y="56" width="120" height="64" fill="#3f6d3a" />
    <path d="M30 120 Q50 90 46 70 Q42 56 60 50 Q80 46 120 50 V60 Q86 58 72 62 Q60 66 62 80 Q66 100 54 120 Z" fill="#2f7fb5" />
    <path d="M40 112 q6 -4 10 0 M52 92 q6 -4 10 0 M86 56 q6 -4 10 0" stroke="#8cc6e8" strokeWidth="2" fill="none" />
    {/* barca a vela */}
    <path d="M74 70 h20 l-4 6 h-12 Z" fill="#8a5a3b" />
    <path d="M84 70 V50 L96 66 Z" fill="#fff6e0" />
    {/* palme */}
    <path d="M18 70 v-22" stroke="#6a4127" strokeWidth="3" />
    <path d="M18 48 q-10 -2 -14 6 M18 48 q10 -2 14 6 M18 48 q-6 -8 -12 -6 M18 48 q6 -8 12 -6" stroke="#2f6b3a" strokeWidth="3" fill="none" />
  </g>
);

const Sfinge: FC = () => (
  <g>
    <rect x="0" y="96" width="120" height="24" fill="#e3c37a" />
    <path d="M18 96 V78 Q18 70 30 70 H76 V96 Z" fill="#d9b468" />
    <path d="M20 96 h16 v-6 h-16 Z M60 96 h16 v-6 h-16 Z" fill="#c9a259" />
    {/* testa con copricapo nemes */}
    <path d="M70 70 L72 40 Q86 30 100 40 L102 70 Q96 66 94 76 H78 Q76 66 70 70 Z" fill="#2a4d8f" />
    <path d="M74 44 l26 0 M73 52 l28 0 M72 60 l30 0" stroke="#d9a520" strokeWidth="3" />
    <path d="M78 46 Q86 42 94 46 V66 Q86 72 78 66 Z" fill="#d9b468" />
    <circle cx="82" cy="54" r="1.6" fill="#3b2a20" />
    <circle cx="90" cy="54" r="1.6" fill="#3b2a20" />
    <path d="M83 62 h6" stroke="#8a6228" strokeWidth="1.6" />
  </g>
);

const Scriba: FC = () => (
  <g>
    {/* scriba seduto a gambe incrociate */}
    <ellipse cx="60" cy="100" rx="34" ry="8" fill="#f3f0e6" />
    <path d="M34 98 Q60 86 86 98" fill="#ffffff" stroke="#d6cfbf" strokeWidth="1.5" />
    <path d="M46 92 L48 60 Q60 52 72 60 L74 92 Z" fill="#b5703d" />
    <circle cx="60" cy="44" r="12" fill="#b5703d" />
    <path d="M48 40 Q60 26 72 40 L72 46 Q60 40 48 46 Z" fill="#1f160f" />
    <circle cx="56" cy="46" r="1.4" fill="#1f160f" />
    <circle cx="64" cy="46" r="1.4" fill="#1f160f" />
    {/* rotolo sulle ginocchia */}
    <rect x="40" y="80" width="40" height="10" fill="#f1dfa6" stroke="#c9a259" strokeWidth="1" />
    <path d="M46 85 h8 M58 85 h12" stroke="#2a4d8f" strokeWidth="1.5" />
    {/* braccio con calamo */}
    <path d="M70 66 Q80 74 70 82" stroke="#b5703d" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M70 82 l6 -10" stroke="#3b2a20" strokeWidth="2" />
    {/* numeri egizi: 1 e 10 */}
    <path d="M94 30 v12 M100 30 v12 M106 30 v12" stroke="#2a4d8f" strokeWidth="2.5" />
    <path d="M94 58 q0 -10 6 -10 q6 0 6 10" stroke="#2a4d8f" strokeWidth="2.5" fill="none" />
  </g>
);

const Tutankhamon: FC = () => (
  <g>
    {/* maschera d'oro */}
    <path d="M28 112 L32 46 Q36 14 60 12 Q84 14 88 46 L92 112 Z" fill="#2a4d8f" />
    {[30, 42, 54, 66, 78, 90, 102].map((y) => (
      <path key={y} d={`M31 ${y} H89`} stroke="#d9a520" strokeWidth="5" />
    ))}
    <path d="M40 40 Q60 26 80 40 L80 78 Q60 96 40 78 Z" fill="#e9b949" />
    <path d="M44 52 Q50 48 56 52 Q50 56 44 52 Z M64 52 Q70 48 76 52 Q70 56 64 52 Z" fill="#fff" stroke="#1f160f" strokeWidth="2" />
    <circle cx="50" cy="52" r="2.2" fill="#1f160f" />
    <circle cx="70" cy="52" r="2.2" fill="#1f160f" />
    <path d="M60 56 v10 h-3" stroke="#b88f47" strokeWidth="2" fill="none" />
    <path d="M54 72 h12" stroke="#a8312a" strokeWidth="2.5" />
    <path d="M56 80 h8 l-2 20 h-4 Z" fill="#2a4d8f" stroke="#d9a520" strokeWidth="1.5" />
    {/* cobra e avvoltoio sulla fronte */}
    <path d="M58 38 q2 -8 4 0 v4 h-4 Z" fill="#d9a520" stroke="#a87a12" strokeWidth="1" />
  </g>
);

const Gatto: FC = () => (
  <g>
    <ellipse cx="60" cy="106" rx="26" ry="5" fill="#d9b468" />
    {/* gatto seduto, in bronzo */}
    <path d="M44 104 Q40 74 48 58 L46 34 L56 44 H64 L74 34 L72 58 Q80 74 76 104 Z" fill="#3b3a40" />
    <path d="M76 100 Q92 98 90 84" stroke="#3b3a40" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="54" cy="54" r="2.4" fill="#d9a520" />
    <circle cx="66" cy="54" r="2.4" fill="#d9a520" />
    <path d="M58 60 h4 l-2 3 Z" fill="#d9a520" />
    {/* collare e orecchino d'oro */}
    <path d="M50 70 Q60 76 70 70" stroke="#d9a520" strokeWidth="3" fill="none" />
    <circle cx="60" cy="78" r="3.5" fill="#3aa6a0" stroke="#d9a520" strokeWidth="1.5" />
    <circle cx="48" cy="40" r="1.8" fill="#d9a520" />
  </g>
);

export const EGIZI_ART: Record<string, FC> = {
  'egi-piramide': Piramide,
  'egi-papiro': Papiro,
  'egi-geroglifici': Geroglifici,
  'egi-nilo': Nilo,
  'egi-sfinge': Sfinge,
  'egi-scriba': Scriba,
  'egi-tutankhamon': Tutankhamon,
  'egi-gatto': Gatto,
};
