/** Barra di avanzamento: conta gli esercizi, non il tempo. Sempre visibile durante la missione. */
export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3" aria-label={`Esercizio ${Math.min(done + 1, total)} di ${total}`}>
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-carta-2">
        <div className="h-full rounded-full bg-oro" style={{ width: `${pct}%` }} />
      </div>
      <span className="min-w-16 text-right text-base font-bold text-inchiostro-2 tabular-nums">
        {Math.min(done, total)} / {total}
      </span>
    </div>
  );
}
