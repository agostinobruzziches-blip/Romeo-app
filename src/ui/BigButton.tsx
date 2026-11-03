import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primario' | 'secondario' | 'tenue' | 'aiuto';

const styles: Record<Variant, string> = {
  primario: 'bg-terracotta text-white active:bg-terracotta-scuro shadow-[0_3px_0_var(--color-terracotta-scuro)]',
  secondario: 'bg-egeo text-white active:brightness-90 shadow-[0_3px_0_#1f4266]',
  tenue: 'bg-white text-inchiostro border-2 border-carta-2 active:bg-carta-2',
  aiuto: 'bg-egeo-chiaro text-egeo border-2 border-egeo/20 active:brightness-95',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  full?: boolean;
}

/** Pulsante grande: almeno 56px di altezza, testo grande. */
export function BigButton({ variant = 'primario', full = true, className = '', children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`min-h-14 rounded-2xl px-5 py-3 text-xl font-bold select-none disabled:opacity-40 ${
        full ? 'w-full' : ''
      } ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
