import { useState } from 'react';
import type { ExerciseProps } from '../../core/module';
import { NumPad } from '../../ui/NumPad';
import type { TabAnswer, TabData, TabItem } from './generator';
import { neighborHint, skipCountHint } from './hints';

function Box({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-[2.4em] justify-center rounded-xl border-4 border-dashed border-egeo/50 bg-white px-2 text-egeo">
      {value || ' '}
    </span>
  );
}

export function TabExercise({ item, locked, onSubmit, feedback, toolbar }: ExerciseProps<TabData, TabAnswer>) {
  const [value, setValue] = useState('');
  const { x, y, shown } = item.data;
  const submit = () => {
    if (value.length) onSubmit(Number(value));
  };

  let question;
  if (item.format === 'fattore-mancante') {
    question = (
      <>
        {x} × <Box value={value} /> = {x * y}
      </>
    );
  } else if (item.format === 'vero-falso') {
    question = (
      <>
        {x} × {y} = {shown}
      </>
    );
  } else {
    question = (
      <>
        {x} × {y} = <Box value={value} />
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        {item.format === 'vero-falso' && <p className="text-xl text-inchiostro-2">È giusto?</p>}
        <p className="question text-center text-[clamp(2.4rem,12vw,3.75rem)] font-bold whitespace-nowrap tabular-nums" aria-live="polite">
          {question}
        </p>
      </div>
      <div className="flex min-h-20 items-center justify-center text-center">{feedback}</div>
      <div className="mb-2">{toolbar}</div>
      {item.format === 'vero-falso' ? (
        <div className="grid grid-cols-2 gap-3 pb-1">
          <button
            type="button"
            disabled={locked}
            onClick={() => onSubmit(true)}
            className="h-36 rounded-2xl bg-oliva text-3xl font-bold text-white shadow-[0_3px_0_#2b5a40] disabled:opacity-40"
          >
            Vero
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => onSubmit(false)}
            className="h-36 rounded-2xl bg-egeo text-3xl font-bold text-white shadow-[0_3px_0_#1f4266] disabled:opacity-40"
          >
            Falso
          </button>
        </div>
      ) : (
        <NumPad value={value} onChange={setValue} onSubmit={submit} disabled={locked} />
      )}
    </div>
  );
}

/** Griglia di pallini righe × colonne, raggruppati a 5 per contarli facilmente. */
export function DotGrid({ rows, cols }: { rows: number; cols: number }) {
  const size = Math.max(rows, cols) > 8 ? 14 : 18;
  const gap = 4;
  const extra = 6;
  const pos = (i: number) => i * (size + gap) + (i >= 5 ? extra : 0);
  const w = pos(cols - 1) + size;
  const h = pos(rows - 1) + size;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${rows} righe da ${cols} pallini`}>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={pos(c) + size / 2}
            cy={pos(r) + size / 2}
            r={size / 2}
            fill={r % 2 ? '#c8553d' : '#2e5e8c'}
          />
        )),
      )}
    </svg>
  );
}

function Recap({ item }: { item: TabItem }) {
  const { x, y } = item.data;
  return (
    <p className="text-4xl font-bold tabular-nums text-inchiostro-2">
      {item.format === 'fattore-mancante' ? `${x} × ? = ${x * y}` : `${x} × ${y} = ?`}
    </p>
  );
}

export function TabHelp({ item, level }: { item: TabItem; level: number }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Recap item={item} />
      <HelpBody item={item} level={level} />
    </div>
  );
}

function HelpBody({ item, level }: { item: TabItem; level: number }) {
  const { x, y } = item.data;
  if (item.format === 'fattore-mancante') {
    if (level === 1) return <p className="text-2xl leading-snug">{skipCountHint(x, x * y)}</p>;
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-xl">Conta i salti da {x}:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: y }, (_, i) => (
            <span key={i} className="rounded-xl bg-egeo-chiaro px-3 py-2 text-2xl font-bold text-egeo tabular-nums">
              {x * (i + 1)}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (level === 1) return <p className="text-2xl leading-snug">{neighborHint(x, y)}</p>;
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xl">
        {x} righe da {y} pallini. Quanti sono in tutto?
      </p>
      <DotGrid rows={x} cols={y} />
    </div>
  );
}

export function TabSolution({ item }: { item: TabItem }) {
  const { x, y } = item.data;
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-5xl font-bold tabular-nums">
        {x} × {y} = {x * y}
      </p>
      {item.format === 'fattore-mancante' && <p className="text-xl">Il numero che mancava è {y}.</p>}
      <DotGrid rows={x} cols={y} />
      <p className="text-xl text-inchiostro-2">Ci riproveremo presto.</p>
    </div>
  );
}
