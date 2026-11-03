/** Icone SVG originali, statiche. */
export function Star({ size = 32, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
        fill={filled ? '#d9a520' : 'none'}
        stroke="#a87a12"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Medaglia della tenacia: un piccolo alloro attorno a tre frecce "prova, prova, prova". */
export function Medal({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M13 2 L20 14 L27 2 Z" fill="#2e5e8c" />
      <path d="M16 2 L20 9 L24 2 Z" fill="#c8553d" />
      <circle cx="20" cy="25" r="13" fill="#d9a520" stroke="#a87a12" strokeWidth="1.5" />
      <circle cx="20" cy="25" r="9.5" fill="#f1c84b" />
      <path d="M14 29 q6 -10 12 0" stroke="#3e7d5a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M15.5 25.5 l-2 -1.5 M18 22.5 l-1.5 -2 M22 22.5 l1.5 -2 M24.5 25.5 l2 -1.5" stroke="#3e7d5a" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 21 v9 M17.5 27.5 l2.5 2.5 2.5 -2.5" stroke="#a87a12" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
