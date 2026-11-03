import { useEffect, useMemo, useState } from 'react';
import { fmt, parseNum } from '../../core/format';
import type { ExerciseProps, MissionItem } from '../../core/module';
import { createRng, shuffle } from '../../core/random';
import { BigButton } from '../../ui/BigButton';
import { LessonView } from '../../ui/Lesson';
import { NumPad } from '../../ui/NumPad';
import { Figure } from './Figure';
import { GEO_LESSONS } from './lessons';
import type { GeoData } from './shapes';

export type GeoItemData = ({ kind: 'geo' } & GeoData) | { kind: 'lezione'; lessonId: string };
type Phase = 'cosa' | 'come' | 'unita' | 'risultato';
export const geoLive = new Map<string, Phase>();

const ORDER: Phase[] = ['cosa', 'come', 'unita', 'risultato'];
const TITLES: Record<Phase, string> = {
  cosa: 'Cosa misuri?',
  come: 'Come si calcola?',
  unita: 'In che unità?',
  risultato: 'Scrivi il risultato',
};

function seed(s: string) {
  let h = 11;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function GeoFigure({ d, highlight, mode }: { d: GeoData; highlight?: 'contorno' | 'superficie' | null; mode?: 'cells' | 'edges' | null }) {
  return (
    <Figure
      shape={d.shape}
      grid={d.grid}
      unit={d.unit}
      labels={d.level >= 2}
      unknown={d.ask === 'lato' ? 'lato' : d.ask === 'altezza' ? 'altezza' : undefined}
      highlight={highlight}
      mode={mode}
    />
  );
}

export function GeoExercise({ item, locked, onSubmit, onStep, feedback, toolbar, attemptNo }: ExerciseProps<GeoItemData, number | string>) {
  const d = item.data;
  const [phase, setPhase] = useState<Phase>('cosa');
  const [note, setNote] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [hl, setHl] = useState<'contorno' | 'superficie' | null>(null);
  const formulas = useMemo(
    () => (d.kind === 'geo' ? shuffle(createRng(seed(item.uid)), d.formulas.map((text, i) => ({ text, ok: i === 0 }))) : []),
    [item.uid, d],
  );
  const units = useMemo(() => (d.kind === 'geo' ? shuffle(createRng(seed(item.uid) + 1), d.unitChoices) : []), [item.uid, d]);
  useEffect(() => {
    geoLive.set(item.uid, phase);
  }, [item.uid, phase]);
  useEffect(() => setValue(''), [attemptNo]);

  if (d.kind === 'lezione') {
    const l = GEO_LESSONS[d.lessonId];
    return <LessonView title={l.title} pages={l.pages} onFinish={() => onSubmit('fatto')} />;
  }

  const go = (p: Phase) => {
    setNote(null);
    setPhase(p);
  };
  const inverse = d.ask === 'lato' || d.ask === 'altezza';

  let panel;
  if (phase === 'cosa') {
    panel = (
      <>
        <p className="text-lg">{inverse ? 'Il numero che conosci misura…' : 'Cosa devi misurare?'}</p>
        <div className="grid grid-cols-2 gap-2">
          {(['contorno', 'superficie'] as const).map((m) => (
            <BigButton
              key={m}
              variant="tenue"
              disabled={locked}
              className="text-lg leading-tight"
              onClick={() => {
                if (m === d.measure) {
                  onStep?.({ step: 'cosa', correct: true });
                  setHl(m);
                  go('come');
                } else {
                  onStep?.({ step: 'cosa', correct: false, errorType: 'concetto' });
                  setNote(
                    d.measure === 'contorno'
                      ? 'Il perimetro è la strada tutto intorno al bordo: il contorno.'
                      : 'L’area è lo spazio dentro la figura: la superficie.',
                  );
                }
              }}
            >
              {m === 'contorno' ? 'il contorno (il bordo)' : 'la superficie (lo spazio dentro)'}
            </BigButton>
          ))}
        </div>
      </>
    );
  } else if (phase === 'come') {
    panel = (
      <>
        <p className="text-lg">Come si calcola?</p>
        <div className="flex flex-col gap-2">
          {formulas.map((f) => (
            <BigButton
              key={f.text}
              variant="tenue"
              disabled={locked}
              className="text-xl tabular-nums"
              onClick={() => {
                if (f.ok) {
                  onStep?.({ step: 'come', correct: true });
                  go('unita');
                } else {
                  onStep?.({ step: 'come', correct: false, errorType: 'operazione' });
                  setNote(hintFor(d));
                }
              }}
            >
              {f.text}
            </BigButton>
          ))}
        </div>
      </>
    );
  } else if (phase === 'unita') {
    panel = (
      <>
        <p className="text-lg">In che unità sarà la risposta?</p>
        <div className="grid grid-cols-2 gap-2">
          {units.map((u) => (
            <BigButton
              key={u}
              variant="tenue"
              disabled={locked}
              className="text-xl"
              onClick={() => {
                if (u === d.resultUnit) {
                  onStep?.({ step: 'unita', correct: true });
                  go('risultato');
                } else {
                  onStep?.({ step: 'unita', correct: false, errorType: 'unita' });
                  setNote(
                    d.resultUnit.includes('²') || d.resultUnit === 'quadretti'
                      ? 'L’area conta i quadretti: si misura in unità “quadrate”.'
                      : 'È una lunghezza: si misura in unità di lunghezza, non quadrate.',
                  );
                }
              }}
            >
              {u}
            </BigButton>
          ))}
        </div>
      </>
    );
  } else {
    panel = (
      <p className="text-center text-2xl font-bold tabular-nums">
        = <span className="rounded-xl border-4 border-dashed border-oliva/50 bg-white px-3 text-oliva">{value || '?'}</span>{' '}
        {d.resultUnit}
      </p>
    );
  }

  const idx = ORDER.indexOf(phase);
  const countMode = d.level <= 1 && phase === 'risultato' ? (d.ask === 'perimetro' ? 'edges' : 'cells') : null;
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto pt-2">
      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-inchiostro-2">
          Passo {idx + 1} di 4 · {TITLES[phase]}
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {ORDER.map((p, i) => (
            <span key={p} className={`h-3 w-3 rounded-full ${i <= idx ? 'bg-egeo' : 'bg-carta-2'}`} />
          ))}
        </div>
      </div>
      <p className="rounded-2xl bg-white p-3 text-xl leading-snug font-bold">{d.question}</p>
      <div className="flex justify-center">
        <GeoFigure d={d} highlight={hl} mode={countMode} />
      </div>
      {countMode && (
        <p className="text-center text-base text-inchiostro-2">
          Se vuoi, tocca {countMode === 'cells' ? 'i quadretti' : 'i lati sul bordo'} per segnarli mentre conti.
        </p>
      )}
      {panel}
      <div className="flex min-h-12 items-center justify-center text-center">
        {note ? <p className="text-lg font-bold text-ambra">{note}</p> : feedback}
      </div>
      <div className="mt-auto">{toolbar}</div>
      {phase === 'risultato' && (
        <NumPad value={value} onChange={setValue} maxLength={4} decimal={false} disabled={locked} onSubmit={() => onSubmit(parseNum(value))} />
      )}
    </div>
  );
}

function hintFor(d: GeoData): string {
  if (d.level <= 1) return d.ask === 'perimetro' ? 'Il perimetro è il bordo: conta i lati sul bordo.' : 'L’area è lo spazio dentro: conta i quadretti.';
  switch (d.ask) {
    case 'perimetro':
      return d.shape.type === 'quadrato'
        ? 'Il quadrato ha 4 lati uguali da sommare.'
        : 'Il contorno è base + altezza + base + altezza.';
    case 'area':
      if (d.shape.type === 'triangolo') return 'Il triangolo è metà di un rettangolo con la stessa base e altezza.';
      if (d.shape.type === 'elle') return 'Dividi la figura in due rettangoli e somma le loro aree.';
      return 'Pensa alle righe di quadretti: quante righe, e quanti quadretti in ogni riga?';
    case 'lato':
      return 'Il perimetro è fatto di 4 lati uguali: dividilo in 4 parti.';
    case 'altezza':
      return 'Area = base × altezza. Quale numero, moltiplicato per la base, dà l’area?';
  }
}

export function GeoHelp({ item, level }: { item: MissionItem<GeoItemData>; level: number }) {
  const d = item.data;
  if (d.kind === 'lezione') return <p className="text-xl">Leggi con calma: ogni pagina ha una cosa da provare.</p>;
  if (level >= 2) {
    const id =
      d.shape.type === 'triangolo'
        ? 'geo-triangolo'
        : d.shape.type === 'elle'
          ? 'geo-composte'
          : d.measure === 'contorno'
            ? 'geo-perimetro'
            : 'geo-area';
    const l = GEO_LESSONS[id];
    return (
      <div className="flex w-full flex-1 flex-col">
        <LessonView title={l.title} pages={l.pages} free />
      </div>
    );
  }
  const phase = geoLive.get(item.uid) ?? 'cosa';
  const text =
    phase === 'cosa'
      ? 'Perimetro = contorno, il bordo. Area = superficie, lo spazio dentro.'
      : phase === 'unita'
        ? 'Il perimetro e i lati sono lunghezze (cm, m). L’area si misura in quadretti, cioè cm² o m².'
        : hintFor(d);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-2xl leading-snug">{text}</p>
      <GeoFigure d={d} highlight={d.measure} />
    </div>
  );
}

export function GeoSolution({ item }: { item: MissionItem<GeoItemData> }) {
  const d = item.data;
  if (d.kind === 'lezione') return null;
  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <GeoFigure d={d} highlight={d.measure} />
      <p className="text-3xl font-bold tabular-nums">
        {d.level <= 1 ? '' : `${d.formulas[0]} = `}
        {fmt(d.result)} {d.resultUnit}
      </p>
      <p className="text-lg text-inchiostro-2">Ci riproveremo con una figura simile.</p>
    </div>
  );
}
