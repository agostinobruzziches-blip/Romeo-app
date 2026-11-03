import type { ReactNode } from 'react';

/** Contenitore a schermo intero, pensato per il telefono in verticale. */
export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mx-auto flex h-dvh max-w-md flex-col px-4 pt-[max(env(safe-area-inset-top),12px)] pb-[max(env(safe-area-inset-bottom),12px)] ${className}`}
    >
      {children}
    </div>
  );
}
