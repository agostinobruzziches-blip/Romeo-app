import type { FC } from 'react';

/* Illustrazioni originali. Palette: verde, pergamena, pietra, blu, rosso. */

const Castello: FC = () => (
  <g>
    <rect x="0" y="0" width="120" height="120" fill="#dbe9f2" />
    <rect x="0" y="98" width="120" height="22" fill="#6d9b5a" />
    <rect x="0" y="100" width="120" height="8" fill="#5c9fca" />
    {/* torri */}
    {[10, 86].map((x) => (
      <g key={x}>
        <rect x={x} y="40" width="24" height="60" fill="#a7a299" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={x + i * 9} y="34" width="6" height="8" fill="#a7a299" />
        ))}
        <rect x={x + 9} y="56" width="6" height="12" rx="3" fill="#3b3a40" />
      </g>
    ))}
    <rect x="34" y="54" width="52" height="46" fill="#bab5ac" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={36 + i * 10.5} y="48" width="6" height="8" fill="#bab5ac" />
    ))}
    {/* portone e ponte levatoio */}
    <path d="M50 100 V80 a10 10 0 0 1 20 0 V100 Z" fill="#5a3a22" />
    <path d="M50 100 H70 L74 108 H46 Z" fill="#8a5a3b" />
    {/* bandiera */}
    <path d="M22 40 V20" stroke="#3b3a40" strokeWidth="2" />
    <path d="M22 20 h14 l-4 5 l4 5 h-14 Z" fill="#9b2d2d" />
  </g>
);

const Amanuense: FC = () => (
  <g>
    {/* leggio con libro miniato */}
    <path d="M50 68 L104 56 L104 96 L50 108 Z" fill="#efe3c4" stroke="#b9a87e" strokeWidth="1.5" />
    <rect x="58" y="70" width="12" height="12" fill="#34558b" />
    <text x="64" y="80" fontSize="10" textAnchor="middle" fill="#d9a520" fontFamily="serif" fontWeight="bold">
      A
    </text>
    <path d="M74 72 l24 -5 M74 78 l24 -5 M58 88 l40 -9 M58 94 l40 -9 M58 100 l30 -7" stroke="#6b5a3a" strokeWidth="1.4" />
    {/* monaco con saio e cappuccio */}
    <path d="M8 112 Q10 60 30 52 Q46 58 50 112 Z" fill="#7a5a3a" />
    <path d="M14 56 Q16 28 32 26 Q46 30 46 54 Q40 46 30 46 Q20 46 14 56 Z" fill="#6a4a2e" />
    <circle cx="31" cy="50" r="10" fill="#e2b48c" />
    <circle cx="35" cy="49" r="1.4" fill="#2b2a33" />
    {/* penna d'oca */}
    <path d="M44 74 Q52 70 58 74" stroke="#e2b48c" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M58 76 L72 52" stroke="#f4f1ea" strokeWidth="3" />
    <path d="M70 54 q6 -10 2 -16 q-6 6 -6 14 Z" fill="#f4f1ea" stroke="#d6d0c2" />
  </g>
);

const Cavaliere: FC = () => (
  <g>
    {/* elmo a secchio */}
    <path d="M34 24 H86 V78 Q60 88 34 78 Z" fill="#b3ada2" stroke="#77736b" strokeWidth="2" />
    <rect x="40" y="44" width="40" height="5" rx="2" fill="#2b2a33" />
    <path d="M60 52 V76" stroke="#77736b" strokeWidth="3" />
    {[46, 52, 68, 74].map((x) => (
      <circle key={x} cx={x} cy="62" r="1.6" fill="#2b2a33" />
    ))}
    {/* scudo con stemma */}
    <path d="M70 66 H108 V90 Q108 108 89 116 Q70 108 70 90 Z" fill="#34558b" stroke="#d9a520" strokeWidth="3" />
    <path d="M89 72 V108 M74 88 H104" stroke="#d9a520" strokeWidth="4" />
    {/* lancia con pennoncello */}
    <path d="M18 116 L28 8" stroke="#6a4127" strokeWidth="3" />
    <path d="M28 8 l-3 8 l6 0 Z" fill="#9a9488" />
    <path d="M27 18 l14 4 l-14 6 Z" fill="#9b2d2d" />
  </g>
);

const Fibonacci: FC = () => (
  <g>
    {/* libro aperto con cifre */}
    <path d="M10 40 Q34 32 60 40 V104 Q34 96 10 104 Z" fill="#efe3c4" stroke="#b9a87e" strokeWidth="1.5" />
    <path d="M110 40 Q86 32 60 40 V104 Q86 96 110 104 Z" fill="#f6eedb" stroke="#b9a87e" strokeWidth="1.5" />
    <text x="35" y="64" fontSize="14" textAnchor="middle" fill="#9b2d2d" fontFamily="Georgia, serif">
      1 2 3
    </text>
    <text x="35" y="86" fontSize="14" textAnchor="middle" fill="#34558b" fontFamily="Georgia, serif">
      4 5 0
    </text>
    {/* spirale di quadrati 1,1,2,3,5,8 */}
    <g transform="translate(66 50)" stroke="#4f7a4a" strokeWidth="1.2" fill="none">
      <rect x="0" y="0" width="24" height="24" />
      <rect x="24" y="0" width="15" height="15" />
      <rect x="30" y="15" width="9" height="9" />
      <rect x="24" y="18" width="6" height="6" />
      <rect x="24" y="15" width="3" height="3" />
      <path d="M24 24 A24 24 0 0 1 0 0 M24 0 A15 15 0 0 1 39 15 M39 15 A9 9 0 0 1 30 24" stroke="#9b2d2d" strokeWidth="1.6" />
    </g>
    <text x="60" y="26" fontSize="10" textAnchor="middle" fill="#24321f" fontFamily="Georgia, serif" fontStyle="italic">
      Liber Abaci · 1202
    </text>
  </g>
);

const Vetrata: FC = () => (
  <g>
    <path d="M30 112 V44 Q30 10 60 6 Q90 10 90 44 V112 Z" fill="#3b3a40" />
    <path d="M36 108 V46 Q36 16 60 12 Q84 16 84 46 V108 Z" fill="#34558b" />
    <path d="M60 12 V108 M36 46 H84 M36 78 H84" stroke="#3b3a40" strokeWidth="3" />
    <circle cx="60" cy="30" r="10" fill="#d9a520" stroke="#3b3a40" strokeWidth="3" />
    <path d="M38 48 h20 v28 h-20 Z" fill="#9b2d2d" />
    <path d="M62 48 h20 v28 h-20 Z" fill="#4f7a4a" />
    <path d="M38 80 h20 v26 h-20 Z" fill="#d9a520" opacity="0.85" />
    <path d="M62 80 h20 v26 h-20 Z" fill="#9b2d2d" />
    <path d="M38 62 l20 -14 M62 76 l20 -28 M38 106 l20 -26 M62 92 h20" stroke="#3b3a40" strokeWidth="2" />
  </g>
);

const MarcoPolo: FC = () => (
  <g>
    {/* carta del viaggio */}
    <rect x="6" y="14" width="108" height="92" rx="4" fill="#efe3c4" stroke="#b9a87e" strokeWidth="2" />
    <path d="M14 70 Q30 60 40 66 Q50 72 60 60 Q70 50 84 54 Q96 58 106 46" stroke="#4f7a4a" strokeWidth="10" fill="none" opacity="0.35" strokeLinecap="round" />
    <path
      d="M18 66 Q36 52 52 62 Q66 70 78 54 Q90 42 104 44"
      stroke="#9b2d2d"
      strokeWidth="2.5"
      strokeDasharray="5 4"
      fill="none"
    />
    <circle cx="18" cy="66" r="4" fill="#34558b" />
    <text x="18" y="84" fontSize="8" textAnchor="middle" fill="#24321f" fontFamily="sans-serif">
      Venezia
    </text>
    <circle cx="104" cy="44" r="4" fill="#d9a520" />
    <text x="100" y="34" fontSize="8" textAnchor="middle" fill="#24321f" fontFamily="sans-serif">
      Cina
    </text>
    {/* cammello */}
    <path d="M52 92 q2 -10 10 -10 q4 -8 8 0 q4 -8 8 0 q6 0 8 -6 l4 2 q-2 8 -8 10 v8 h-3 v-6 h-18 v6 h-3 Z" fill="#b5703d" />
  </g>
);

const Torre: FC = () => (
  <g>
    <rect x="0" y="100" width="120" height="20" fill="#6d9b5a" />
    <g transform="rotate(5 60 104)">
      <rect x="44" y="18" width="32" height="86" rx="3" fill="#f4f1ea" stroke="#d6d0c2" strokeWidth="1.5" />
      {[30, 42, 54, 66, 78, 90].map((y) => (
        <g key={y}>
          <path d={`M44 ${y} H76`} stroke="#d6d0c2" strokeWidth="1.5" />
          {[48, 56, 64, 72].map((x) => (
            <path key={x} d={`M${x - 2} ${y + 10} v-6 a2 2 0 0 1 4 0 v6`} fill="#bdb6a8" />
          ))}
        </g>
      ))}
      <rect x="48" y="8" width="24" height="12" rx="2" fill="#f4f1ea" stroke="#d6d0c2" strokeWidth="1.5" />
    </g>
    <path d="M90 100 v-20 l8 -6 l8 6 v20 Z" fill="#e6e1d6" />
  </g>
);

const Bussola: FC = () => (
  <g>
    <circle cx="60" cy="60" r="48" fill="#8c6a3c" />
    <circle cx="60" cy="60" r="40" fill="#efe3c4" stroke="#d9a520" strokeWidth="3" />
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8;
      const r1 = i % 4 === 0 ? 28 : 33;
      return (
        <path
          key={i}
          d={`M${60 + Math.sin(a) * r1} ${60 - Math.cos(a) * r1} L${60 + Math.sin(a) * 38} ${60 - Math.cos(a) * 38}`}
          stroke="#6b5a3a"
          strokeWidth="1.5"
        />
      );
    })}
    <path d="M60 24 L67 60 L60 96 L53 60 Z" fill="#34558b" />
    <path d="M60 24 L67 60 H53 Z" fill="#9b2d2d" />
    <circle cx="60" cy="60" r="4" fill="#d9a520" />
    <text x="60" y="19" fontSize="9" textAnchor="middle" fill="#efe3c4" fontFamily="serif" fontWeight="bold">
      N
    </text>
  </g>
);

export const MEDIOEVO_ART: Record<string, FC> = {
  'med-castello': Castello,
  'med-amanuense': Amanuense,
  'med-cavaliere': Cavaliere,
  'med-fibonacci': Fibonacci,
  'med-vetrata': Vetrata,
  'med-marcopolo': MarcoPolo,
  'med-torre': Torre,
  'med-bussola': Bussola,
};
