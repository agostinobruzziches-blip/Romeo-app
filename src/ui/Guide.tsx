import type { ReactNode } from 'react';

/** Glauco, la civetta del tempo (in greco antico "glaux" = civetta). Illustrazione originale. */
export function Owl({ size = 96, mood = 'calmo' }: { size?: number; mood?: 'calmo' | 'felice' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      {/* ciuffi */}
      <path d="M30 30 L38 12 L48 28 Z" fill="#8a5a3b" />
      <path d="M90 30 L82 12 L72 28 Z" fill="#8a5a3b" />
      {/* corpo */}
      <ellipse cx="60" cy="66" rx="40" ry="46" fill="#a86f4a" />
      <ellipse cx="60" cy="80" rx="26" ry="28" fill="#f3e1c2" />
      {/* piume del petto */}
      <path d="M46 74 q4 4 8 0 M58 74 q4 4 8 0 M52 84 q4 4 8 0 M64 84 q4 4 8 0 M46 94 q4 4 8 0 M58 94 q4 4 8 0"
        stroke="#d6b88f" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* ali */}
      <path d="M22 62 q-6 26 14 40 q-2 -20 4 -36 Z" fill="#8a5a3b" />
      <path d="M98 62 q6 26 -14 40 q2 -20 -4 -36 Z" fill="#8a5a3b" />
      {/* occhi */}
      <circle cx="44" cy="48" r="15" fill="#fffaf0" />
      <circle cx="76" cy="48" r="15" fill="#fffaf0" />
      <circle cx="44" cy="48" r="9" fill="#d9a520" />
      <circle cx="76" cy="48" r="9" fill="#d9a520" />
      <circle cx="44" cy="48" r="5" fill="#2b2a33" />
      <circle cx="76" cy="48" r="5" fill="#2b2a33" />
      <circle cx="46" cy="46" r="1.8" fill="#fff" />
      <circle cx="78" cy="46" r="1.8" fill="#fff" />
      {mood === 'felice' && (
        <>
          <path d="M31 40 q13 -9 26 0" stroke="#8a5a3b" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M63 40 q13 -9 26 0" stroke="#8a5a3b" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* becco */}
      <path d="M55 58 L65 58 L60 68 Z" fill="#e0913a" />
      {/* clessidra del tempo al collo */}
      <path d="M60 64 L60 70" stroke="#5b5866" strokeWidth="1.5" />
      <g transform="translate(53 70)">
        <rect x="0" y="0" width="14" height="2.5" rx="1" fill="#2e5e8c" />
        <rect x="0" y="15.5" width="14" height="2.5" rx="1" fill="#2e5e8c" />
        <path d="M2 2.5 L12 2.5 L7 9 L12 15.5 L2 15.5 L7 9 Z" fill="#fff6dc" stroke="#2e5e8c" strokeWidth="1" />
        <path d="M4.5 13 L9.5 13 L7 10.5 Z M5.5 4.5 L8.5 4.5 L7 6.5 Z" fill="#d9a520" />
      </g>
      {/* zampe */}
      <path d="M48 110 l-3 6 M52 110 v6 M56 110 l3 6 M64 110 l-3 6 M68 110 v6 M72 110 l3 6"
        stroke="#e0913a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Glauco con il fumetto: frasi brevi e gentili. */
export function Guide({ children, mood, size = 84 }: { children: ReactNode; mood?: 'calmo' | 'felice'; size?: number }) {
  return (
    <div className="flex items-end gap-3">
      <div className="shrink-0">
        <Owl size={size} mood={mood} />
      </div>
      <div className="relative mb-4 flex-1 rounded-2xl bg-white px-4 py-3 text-xl leading-snug shadow-sm">
        <span className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 bg-white" aria-hidden="true" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
