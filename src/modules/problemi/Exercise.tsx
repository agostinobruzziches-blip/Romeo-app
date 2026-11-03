import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ExerciseProps, MissionItem } from '../../core/module';
import { createRng, shuffle } from '../../core/random';
import { canSpeak, speak, stopSpeaking } from '../../core/speech';
import { db } from '../../db/schema';
import { BigButton } from '../../ui/BigButton';
import { NumPad } from '../../ui/NumPad';
import { BarModel } from './BarModel';
import { OP_LABELS, numText, plainText, type Op, type Operand, type ProblemData, type Segment } from './types';
import { parseNum, sameNumber } from '../../core/format';

export type PhaseId = 'leggi' | 'numeri' | 'domanda' | 'op' | 'scrivi';

/** Dove si trova il bambino in ogni problema: serve all'aiuto e al suggerimento per il genitore. */
export const liveState = new Map<string, { phase: PhaseId; sub: number }>();

const OPS: Op[] = ['+', '-', '×', ':'];
const OP_SIGN: Record<Op, string> = { '+': '+', '-': '−', '×': '×', ':': ':' };
const FAST_MS = 1500;

function seedFrom(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const STEP_TITLES: Record<PhaseId, string> = {
  leggi: 'Leggi',
  numeri: 'I numeri importanti',
  domanda: 'Cosa chiede?',
  op: 'Quale operazione?',
  scrivi: 'Scrivi e calcola',
};
const ORDER: PhaseId[] = ['leggi', 'numeri', 'domanda', 'op', 'scrivi'];

function ProblemText({
  segments,
  phase,
  selected,
  onTap,
  highlightQuestion,
  small,
}: {
  segments: Segment[];
  phase: PhaseId;
  selected: Set<string>;
  onTap: (id: string) => void;
  highlightQuestion: boolean;
  small: boolean;
}) {
  return (
    <p className={`rounded-2xl bg-white p-4 leading-relaxed ${small ? 'text-lg' : 'text-xl'}`}>
      {segments.map((s, i) => {
        const q = s.q && highlightQuestion ? 'bg-ambra-chiaro' : '';
        if ('t' in s) {
          return (
            <span key={i} className={q}>
              {s.t}
            </span>
          );
        }
        const label = s.word ?? numText(s.n);
        const isSel = selected.has(s.id);
        if (phase === 'numeri') {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTap(s.id)}
              aria-pressed={isSel}
              className={`mx-0.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 px-2 align-middle font-bold ${
                isSel ? 'border-egeo bg-egeo text-white' : 'border-egeo/40 bg-egeo-chiaro text-egeo'
              }`}
            >
              {label}
            </button>
          );
        }
        return (
          <span key={i} className={`font-bold ${isSel ? 'rounded-md bg-egeo-chiaro px-1 text-egeo' : ''} ${q}`}>
            {label}
          </span>
        );
      })}
    </p>
  );
}

function StepDots({ phase, data, sub }: { phase: PhaseId; data: ProblemData; sub: number }) {
  const idx = ORDER.indexOf(phase);
  const two = data.steps.length > 1;
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-base font-bold text-inchiostro-2">
        Passo {idx + 1} di 5 · {STEP_TITLES[phase]}
        {two && idx >= 3 ? ` (calcolo ${sub + 1} di 2)` : ''}
      </p>
      <div className="flex gap-1.5" aria-hidden="true">
        {ORDER.map((p, i) => (
          <span key={p} className={`h-3 w-3 rounded-full ${i <= idx ? 'bg-egeo' : 'bg-carta-2'}`} />
        ))}
      </div>
    </div>
  );
}

export function ProblemExercise({ item, locked, onSubmit, onStep, feedback, toolbar, attemptNo }: ExerciseProps<ProblemData, number>) {
  const data = item.data;
  const settings = useLiveQuery(() => db.settings.get('main'), []);
  const [phase, setPhase] = useState<PhaseId>('leggi');
  const [sub, setSub] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<string | null>(null);
  const [showBar, setShowBar] = useState(false);
  const [opWrong, setOpWrong] = useState(0);
  const [calcWrong, setCalcWrong] = useState(0);
  const [slots, setSlots] = useState<Array<Operand | null>>([null, null]);
  const [value, setValue] = useState('');
  const [readReady, setReadReady] = useState(false);
  const [highlightQ, setHighlightQ] = useState(false);
  const phaseStart = useRef(performance.now());

  const choices = useMemo(
    () => shuffle(createRng(seedFrom(item.uid)), data.questionChoices.map((text, i) => ({ text, ok: i === 0 }))),
    [item.uid, data.questionChoices],
  );
  const current = data.steps[sub];
  const last = sub === data.steps.length - 1;
  const results = data.steps.slice(0, sub).map((s) => s.result);

  useEffect(() => {
    liveState.set(item.uid, { phase, sub });
    phaseStart.current = performance.now();
  }, [item.uid, phase, sub]);

  // "Ho letto" si attiva dopo un tempo proporzionale al testo, senza conto alla rovescia visibile
  useEffect(() => {
    const ms = Math.min(8000, Math.max(3000, plainText(data.segments).length * 45));
    const t = setTimeout(() => setReadReady(true), ms);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
  }, [data.segments]);

  // dopo una risposta finale sbagliata si riscrive solo il risultato
  useEffect(() => {
    setValue('');
  }, [attemptNo]);

  const go = (p: PhaseId) => {
    setNote(null);
    setPhase(p);
  };

  // ---------- passo 2: numeri ----------
  const checkNumbers = () => {
    const nums = data.segments.filter((s): s is Extract<Segment, { n: number }> => 'n' in s);
    const missing = nums.filter((s) => s.important && !selected.has(s.id));
    const extra = nums.filter((s) => !s.important && selected.has(s.id));
    if (extra.length) {
      onStep?.({ step: 'numeri', correct: false, errorType: 'dati' });
      setNote(`Il numero ${extra[0].word ?? extra[0].n} serve per rispondere alla domanda? Rileggi la domanda e toglilo se non serve.`);
      setHighlightQ(true);
      return;
    }
    if (missing.length) {
      onStep?.({ step: 'numeri', correct: false, errorType: 'dati' });
      setNote(missing.length === 1 ? 'Manca ancora un numero che serve.' : `Mancano ancora ${missing.length} numeri che servono.`);
      return;
    }
    onStep?.({ step: 'numeri', correct: true });
    go('domanda');
  };

  // ---------- passo 3: domanda ----------
  const chooseQuestion = (ok: boolean) => {
    if (!ok) {
      onStep?.({ step: 'domanda', correct: false, errorType: 'domanda' });
      setHighlightQ(true);
      setNote('Rileggi la frase colorata: è quella la domanda.');
      return;
    }
    onStep?.({ step: 'domanda', correct: true });
    setHighlightQ(true);
    go('op');
  };

  // ---------- passo 4: operazione ----------
  const chooseOp = (op: Op) => {
    const fast = performance.now() - phaseStart.current < FAST_MS;
    if (op !== current.op) {
      const n = opWrong + 1;
      setOpWrong(n);
      setShowBar(true);
      onStep?.({ step: 'operazione', correct: false, errorType: 'operazione' });
      if (n >= 3) setNote(`Ti aiuto io: qui serve la ${OP_LABELS[current.op]}. Guarda il disegno per capire perché.`);
      else if (n === 2) setNote(data.opHint);
      else setNote(fast ? 'Piano piano! Guarda il disegno e rileggi la domanda.' : 'Guarda il disegno: ti aiuta a capire.');
      phaseStart.current = performance.now();
      return;
    }
    onStep?.({ step: 'operazione', correct: true });
    setSlots([null, null]);
    setValue('');
    setCalcWrong(0);
    go('scrivi');
  };

  // ---------- passo 5: scrivi e calcola ----------
  const available: Array<Operand & { label: string }> = [
    ...data.segments
      .filter((s): s is Extract<Segment, { n: number }> => 'n' in s && selected.has(s.id))
      .map((s) => ({ value: s.n, ref: s.id, label: numText(s.n) })),
    ...(data.extras ?? []).map((e) => ({ value: e.value, ref: e.ref, label: e.label })),
    ...(sub > 0 ? [{ value: results[sub - 1], ref: 'prev', label: numText(results[sub - 1]) }] : []),
  ];
  const tapChip = (o: Operand) => {
    const next = [...slots];
    const i = next.findIndex((x) => x === null);
    if (i < 0) return;
    next[i] = o;
    setSlots(next);
    if (i === 1 && next[0]) {
      const [x, y] = [next[0], next[1]!];
      const exact = x.ref === current.a.ref && y.ref === current.b.ref;
      const swapped = x.ref === current.b.ref && y.ref === current.a.ref;
      if (exact || (!current.ordered && swapped)) {
        onStep?.({ step: 'dati', correct: true });
        setNote(null);
      } else {
        onStep?.({ step: 'dati', correct: false, errorType: 'dati' });
        setSlots([null, null]);
        setNote(
          swapped
            ? `Sono i numeri giusti, ma nella ${OP_LABELS[current.op]} quale va prima?`
            : 'Controlla i numeri: sono quelli che servono per questo calcolo?',
        );
      }
    }
  };
  const operandsReady = slots[0] !== null && slots[1] !== null;

  const submitResult = () => {
    const v = parseNum(value);
    if (!last) {
      if (sameNumber(v, current.result)) {
        onStep?.({ step: 'calcolo', correct: true });
        setSub(sub + 1);
        setShowBar(false);
        setOpWrong(0);
        go('op');
      } else {
        const n = calcWrong + 1;
        setCalcWrong(n);
        onStep?.({ step: 'calcolo', correct: false, errorType: 'calcolo' });
        setValue('');
        if (n >= 3) {
          setNote(`Il risultato è ${current.result}. Ora andiamo avanti!`);
          setSub(sub + 1);
          setShowBar(false);
          setOpWrong(0);
          setPhase('op');
        } else setNote('Quasi! Ricontrolla il calcolo.');
      }
      return;
    }
    onSubmit(v);
  };

  // ---------- schermata ----------
  const small = phase === 'op' || phase === 'scrivi';
  let panel;
  if (phase === 'leggi') {
    panel = (
      <div className="flex flex-col gap-2">
        <p className="text-lg">Leggi il problema con calma, fino in fondo.</p>
        {settings?.readAloud && canSpeak() && (
          <BigButton variant="aiuto" onClick={() => speak(plainText(data.segments))}>
            🔊 Leggi per me
          </BigButton>
        )}
        <BigButton disabled={!readReady} onClick={() => go('numeri')}>
          {readReady ? 'Ho letto' : 'Leggi con calma…'}
        </BigButton>
      </div>
    );
  } else if (phase === 'numeri') {
    panel = (
      <div className="flex flex-col gap-2">
        <p className="text-lg">Tocca nel testo i numeri che servono per rispondere alla domanda.</p>
        <BigButton disabled={selected.size === 0} onClick={checkNumbers}>
          Fatto
        </BigButton>
      </div>
    );
  } else if (phase === 'domanda') {
    panel = (
      <div className="flex flex-col gap-2">
        <p className="text-lg">Cosa chiede la domanda?</p>
        {choices.map((c) => (
          <BigButton key={c.text} variant="tenue" className="text-left text-lg" onClick={() => chooseQuestion(c.ok)}>
            {c.text}
          </BigButton>
        ))}
      </div>
    );
  } else if (phase === 'op') {
    panel = (
      <div className="flex flex-col gap-2">
        {current.goal && <p className="rounded-xl bg-egeo-chiaro px-3 py-2 text-lg font-bold text-egeo">{current.goal}</p>}
        <p className="text-lg">Quale operazione serve?</p>
        <div className="grid grid-cols-2 gap-2">
          {OPS.map((op) => (
            <button
              key={op}
              type="button"
              disabled={locked}
              onClick={() => chooseOp(op)}
              className={`flex h-20 flex-col items-center justify-center rounded-2xl bg-white shadow-[0_3px_0_var(--color-carta-2)] ${
                opWrong >= 3 && op === current.op ? 'ring-4 ring-oliva' : ''
              }`}
            >
              <span className="text-4xl leading-none font-bold">{OP_SIGN[op]}</span>
              <span className="text-sm text-inchiostro-2">{OP_LABELS[op]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    panel = (
      <div className="flex flex-col gap-2">
        {current.goal && <p className="rounded-xl bg-egeo-chiaro px-3 py-2 text-base font-bold text-egeo">{current.goal}</p>}
        <p className="text-base">
          {operandsReady ? 'Ora scrivi il risultato.' : 'Tocca i numeri nell’ordine giusto per scrivere l’operazione.'}
        </p>
        <div className="flex items-center justify-center gap-2 text-4xl font-bold tabular-nums">
          {[0, 1].map((i) => (
            <span key={i} className="contents">
              {i === 1 && <span>{OP_SIGN[current.op]}</span>}
              <button
                type="button"
                onClick={() => !locked && setSlots(slots.map((s, k) => (k === i ? null : s)))}
                className="min-h-14 min-w-16 rounded-xl border-4 border-dashed border-egeo/40 bg-white px-2 text-egeo"
                aria-label={slots[i] ? `Numero ${slots[i]!.value}, tocca per togliere` : 'Spazio vuoto'}
              >
                {slots[i] ? numText(slots[i]!.value) : ' '}
              </button>
            </span>
          ))}
          <span>=</span>
          <span className="min-h-14 min-w-16 rounded-xl border-4 border-dashed border-oliva/50 bg-white px-2 text-center text-oliva">
            {value || ' '}
          </span>
        </div>
        {!operandsReady && (
          <div className="flex flex-wrap justify-center gap-2">
            {available.map((o) => (
              <button
                key={o.ref}
                type="button"
                disabled={locked || slots.some((s) => s?.ref === o.ref)}
                onClick={() => tapChip(o)}
                className="min-h-12 min-w-14 rounded-xl bg-egeo px-3 text-2xl font-bold text-white disabled:opacity-30"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto pt-2">
      <StepDots phase={phase} data={data} sub={sub} />
      <ProblemText
        segments={data.segments}
        phase={phase}
        selected={selected}
        highlightQuestion={highlightQ}
        small={small}
        onTap={(id) => {
          const next = new Set(selected);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          setSelected(next);
          setNote(null);
        }}
      />
      {showBar && phase === 'op' && (
        <div className="flex justify-center rounded-2xl bg-white p-2">
          <BarModel spec={data.bars[sub]} />
        </div>
      )}
      {panel}
      <div className="flex min-h-12 items-center justify-center text-center">
        {note ? <p className="text-lg font-bold text-ambra">{note}</p> : feedback}
      </div>
      <div className="mt-auto">{toolbar}</div>
      {phase === 'scrivi' && operandsReady && (
        <div className="mt-2">
          <NumPad value={value} onChange={setValue} onSubmit={submitResult} disabled={locked} maxLength={5} decimal={!!data.decimal} />
        </div>
      )}
    </div>
  );
}

/** Aiuto per il passo in cui si trova il bambino. */
export function ProblemHelp({ item, level }: { item: MissionItem<ProblemData>; level: number }) {
  const data = item.data;
  const st = liveState.get(item.uid) ?? { phase: 'leggi' as PhaseId, sub: 0 };
  const s = data.steps[Math.min(st.sub, data.steps.length - 1)];
  const question = plainText(data.segments.filter((x) => x.q));
  if (level >= 2) {
    return (
      <div className="flex w-full flex-col items-center gap-3 text-center">
        <p className="text-xl">Ecco il problema disegnato con le barre. Il punto di domanda è quello che cerchi.</p>
        <div className="w-full rounded-2xl bg-white p-2">
          <BarModel spec={data.bars[Math.min(st.sub, data.bars.length - 1)]} />
        </div>
      </div>
    );
  }
  let text: string;
  if (st.phase === 'leggi' || st.phase === 'numeri' || st.phase === 'domanda') {
    text = `La domanda è: «${question}» Cerca i numeri che ti servono per rispondere proprio a questa domanda.`;
  } else if (st.phase === 'op') {
    text = data.opHint;
  } else {
    const a = s.a.value;
    const b = s.b.value;
    if (s.op === '+') text = `Per fare ${a} + ${b} puoi sommare prima le decine e poi le unità.`;
    else if (s.op === '-') text = `Per fare ${a} − ${b} puoi partire da ${b} e contare in avanti fino ad arrivare a ${a}.`;
    else if (s.op === '×')
      text = b >= 10 || a >= 10
        ? `Spezza il numero più grande in decine e unità, moltiplica ogni pezzo e poi somma.`
        : `È una tabellina! Pensa al fatto vicino che conosci già.`;
    else text = `Pensa alla tabellina del ${b}: ${b} per quanto fa ${a}?`;
  }
  return <p className="text-2xl leading-snug">{text}</p>;
}

export function ProblemSolution({ item }: { item: MissionItem<ProblemData> }) {
  const data = item.data;
  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <div className="w-full rounded-2xl bg-white p-2">
        <BarModel spec={data.bars[data.bars.length - 1]} />
      </div>
      {data.steps.map((s, i) => (
        <p key={i} className="text-3xl font-bold tabular-nums">
          {numText(s.a.value)} {OP_SIGN[s.op]} {numText(s.b.value)} = {numText(s.result)}
        </p>
      ))}
      <p className="text-xl">
        La risposta è <b>{numText(data.steps[data.steps.length - 1].result)} {data.unit}</b>.
      </p>
      <p className="text-lg text-inchiostro-2">Ci riproveremo con un problema simile.</p>
    </div>
  );
}
