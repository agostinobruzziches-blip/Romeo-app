import { useEffect, useState } from 'react';
import { fmt, parseNum } from '../../core/format';
import type { ExerciseProps, MissionItem } from '../../core/module';
import { BigButton } from '../../ui/BigButton';
import { LessonView } from '../../ui/Lesson';
import { NumPad } from '../../ui/NumPad';
import { OP_CHOICES, opLabel, type EqData } from './generator';
import { MIS_LESSONS, lessonForLevel } from './lessons';
import { UnitTable } from './UnitTable';
import { unitName } from './units';

export type MisData = ({ kind: 'eq' } & EqData) | { kind: 'lezione'; lessonId: string };
type Phase = 'unita' | 'numero' | 'operazione' | 'risultato';

export const misLive = new Map<string, Phase>();

const TITLES: Record<Phase, string> = {
  unita: 'L’unità',
  numero: 'Il numero',
  operazione: 'Quale operazione?',
  risultato: 'Scrivi il risultato',
};
const ORDER: Phase[] = ['unita', 'numero', 'operazione', 'risultato'];

function Choice({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <BigButton variant="tenue" className="text-lg" disabled={disabled} onClick={onClick}>
      {label}
    </BigButton>
  );
}

export function MisExercise({ item, locked, onSubmit, onStep, feedback, toolbar, attemptNo }: ExerciseProps<MisData, number | string>) {
  const d = item.data;
  const [phase, setPhase] = useState<Phase>('unita');
  const [note, setNote] = useState<string | null>(null);
  const [arrows, setArrows] = useState(false);
  const [value, setValue] = useState('');
  useEffect(() => {
    misLive.set(item.uid, phase);
  }, [item.uid, phase]);
  useEffect(() => setValue(''), [attemptNo]);

  if (d.kind === 'lezione') {
    const l = MIS_LESSONS[d.lessonId];
    return <LessonView title={l.title} pages={l.pages} onFinish={() => onSubmit('fatto')} />;
  }

  const toSmaller = d.steps > 0;
  const go = (p: Phase) => {
    setNote(null);
    setPhase(p);
  };
  const wrong = (step: string, errorType: 'concetto' | 'operazione', msg: string) => {
    onStep?.({ step, correct: false, errorType });
    setNote(msg);
  };

  let panel;
  if (phase === 'unita') {
    panel = (
      <>
        <p className="text-lg">
          Da <b>{unitName(d.family, d.from)}</b> a <b>{unitName(d.family, d.to)}</b>: l’unità diventa…
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map((bigger) => (
            <Choice
              key={String(bigger)}
              disabled={locked}
              label={bigger ? 'più grande' : 'più piccola'}
              onClick={() => {
                if (bigger === !toSmaller) {
                  onStep?.({ step: 'unita', correct: true });
                  go('numero');
                } else wrong('unita', 'concetto', 'Guarda la tabella: le unità più grandi sono a sinistra, le più piccole a destra.');
              }}
            />
          ))}
        </div>
      </>
    );
  } else if (phase === 'numero') {
    panel = (
      <>
        <p className="text-lg">
          L’unità diventa {toSmaller ? 'più piccola' : 'più grande'}. Allora il numero…
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map((bigger) => (
            <Choice
              key={String(bigger)}
              disabled={locked}
              label={bigger ? 'diventa più grande' : 'diventa più piccolo'}
              onClick={() => {
                if (bigger === toSmaller) {
                  onStep?.({ step: 'numero', correct: true });
                  go('operazione');
                } else
                  wrong(
                    'numero',
                    'concetto',
                    toSmaller
                      ? 'Con un’unità più piccola ne servono di più: pensa a 1 m = 100 cm.'
                      : 'Con un’unità più grande ne servono di meno: pensa a 100 cm = 1 m.',
                  );
              }}
            />
          ))}
        </div>
      </>
    );
  } else if (phase === 'operazione') {
    panel = (
      <>
        <p className="text-lg">Quanti passi nella tabella? Quale operazione serve?</p>
        <div className="grid grid-cols-3 gap-2">
          {OP_CHOICES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={locked}
              onClick={() => {
                if (s === d.steps) {
                  onStep?.({ step: 'operazione', correct: true });
                  go('risultato');
                } else {
                  setArrows(true);
                  const n = Math.abs(d.steps);
                  wrong(
                    'operazione',
                    'operazione',
                    Math.sign(s) !== Math.sign(d.steps)
                      ? `Il numero deve diventare ${toSmaller ? 'più grande: si moltiplica' : 'più piccolo: si divide'}.`
                      : `Conta le colonne da ${d.from} a ${d.to}: sono ${n} ${n === 1 ? 'passo' : 'passi'}.`,
                  );
                }
              }}
              className="h-16 rounded-2xl bg-white text-2xl font-bold shadow-[0_3px_0_var(--color-carta-2)] disabled:opacity-40"
            >
              {opLabel(s)}
            </button>
          ))}
        </div>
      </>
    );
  } else {
    panel = (
      <p className="text-center text-lg">
        {fmt(d.value)} {opLabel(d.steps)} = ?
      </p>
    );
  }

  const idx = ORDER.indexOf(phase);
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto pt-2">
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
      <p className="text-center text-[clamp(2.2rem,11vw,3.4rem)] font-bold whitespace-nowrap tabular-nums">
        {fmt(d.value)} {d.from} = <span className="rounded-xl border-4 border-dashed border-oliva/50 bg-white px-2 text-oliva">{value || '?'}</span>{' '}
        {d.to}
      </p>
      <UnitTable family={d.family} from={d.from} to={d.to} showArrows={arrows} />
      {panel}
      <div className="flex min-h-12 items-center justify-center text-center">
        {note ? <p className="text-lg font-bold text-ambra">{note}</p> : feedback}
      </div>
      <div className="mt-auto">{toolbar}</div>
      {phase === 'risultato' && (
        <NumPad
          value={value}
          onChange={setValue}
          decimal={d.level >= 4}
          maxLength={6}
          disabled={locked}
          onSubmit={() => onSubmit(parseNum(value))}
        />
      )}
    </div>
  );
}

export function MisHelp({ item, level }: { item: MissionItem<MisData>; level: number }) {
  const d = item.data;
  if (d.kind === 'lezione') return <p className="text-xl">Leggi con calma: ogni pagina ha una cosa da provare.</p>;
  if (level >= 2) {
    const id = lessonForLevel(Math.min(d.level, 4)) ?? 'mis-lunghezze';
    const l = MIS_LESSONS[id];
    return (
      <div className="flex w-full flex-1 flex-col">
        <LessonView title={l.title} pages={l.pages} free />
      </div>
    );
  }
  const phase = misLive.get(item.uid) ?? 'unita';
  const n = Math.abs(d.steps);
  const text =
    phase === 'unita'
      ? `Nella tabella le unità più grandi sono a sinistra. Trova ${d.from} e ${d.to}: dove si trova ${d.to}?`
      : phase === 'numero'
        ? 'Pensa a 1 m = 100 cm: con l’unità più piccola (cm) il numero è più grande (100).'
        : phase === 'operazione'
          ? `Conta le colonne da ${d.from} a ${d.to}. Ogni passo è “${d.steps > 0 ? '× 10' : ': 10'}”.`
          : `Sono ${n} ${n === 1 ? 'passo' : 'passi'}: ${fmt(d.value)} ${opLabel(d.steps)}. Scrivi ${fmt(d.value)} nella tabella sotto ${d.from} e sposta la virgola di ${n} ${n === 1 ? 'posto' : 'posti'}.`;
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="text-2xl leading-snug">{text}</p>
      <UnitTable family={d.family} from={d.from} to={d.to} value={d.value} valueUnit={d.from} showArrows />
    </div>
  );
}

export function MisSolution({ item }: { item: MissionItem<MisData> }) {
  const d = item.data;
  if (d.kind === 'lezione') return null;
  return (
    <div className="flex w-full flex-col items-center gap-4 text-center">
      <UnitTable family={d.family} from={d.from} to={d.to} value={d.value} valueUnit={d.from} padTo={d.to} />
      <p className="text-3xl font-bold tabular-nums">
        {fmt(d.value)} {d.from} = {fmt(d.result)} {d.to}
      </p>
      <p className="text-lg">
        {fmt(d.value)} {opLabel(d.steps)} = {fmt(d.result)}. Gli zeri grigi sono quelli che si aggiungono spostandosi
        nella tabella.
      </p>
    </div>
  );
}
