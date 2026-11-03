import { useState } from 'react';
import { fmt } from '../../core/format';
import { BigButton } from '../../ui/BigButton';
import { LessonChoice, type LessonPage } from '../../ui/Lesson';
import { UnitTable } from './UnitTable';
import { UNITS, convert, unitIndex, type Family } from './units';

/** Metro diviso in 10 decimetri, uno dei quali diviso in 10 centimetri. */
function MetroDisegno() {
  return (
    <svg viewBox="0 0 320 120" width="100%" style={{ maxWidth: 360 }} role="img" aria-label="Un metro diviso in 10 decimetri">
      <rect x="10" y="10" width="300" height="36" rx="4" fill="#fbecc9" stroke="#b7791f" strokeWidth="2" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={10 + (i + 1) * 30} y1="10" x2={10 + (i + 1) * 30} y2="46" stroke="#b7791f" strokeWidth="2" />
      ))}
      <text x="160" y="34" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2b2a33">1 metro = 10 decimetri</text>
      {/* zoom sul primo decimetro */}
      <path d="M10 46 L10 70 M40 46 L310 70" stroke="#9fb6cf" strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="10" y="70" width="300" height="30" rx="4" fill="#dce8f3" stroke="#2e5e8c" strokeWidth="2" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={10 + (i + 1) * 30} y1="70" x2={10 + (i + 1) * 30} y2="100" stroke="#2e5e8c" strokeWidth="1.5" />
      ))}
      <text x="160" y="116" textAnchor="middle" fontSize="15" fill="#2b2a33">1 decimetro = 10 centimetri</text>
    </svg>
  );
}

/** Pagina interattiva: il numero si sposta di una colonna a ogni tocco. */
function Passi({
  family,
  value,
  from,
  to,
  onArrive,
}: {
  family: Family;
  value: number;
  from: string;
  to: string;
  onArrive: () => void;
}) {
  const units = UNITS[family];
  const dir = unitIndex(family, to) > unitIndex(family, from) ? 1 : -1;
  const [cur, setCur] = useState(from);
  const arrived = cur === to;
  const v = convert(family, value, from, cur);
  const step = () => {
    const next = units[unitIndex(family, cur) + dir].sym;
    setCur(next);
    if (next === to) onArrive();
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <UnitTable family={family} from={from} to={to} value={v} valueUnit={cur} />
      <p className="rounded-xl bg-white px-4 py-2 text-3xl font-bold tabular-nums">
        {fmt(value)} {from} = {fmt(v)} {cur}
      </p>
      {!arrived ? (
        <BigButton variant="secondario" onClick={step}>
          {dir > 0 ? `Un passo a destra → (× 10)` : `← Un passo a sinistra (: 10)`}
        </BigButton>
      ) : (
        <p className="rounded-xl bg-oliva-chiaro p-3 text-center font-bold text-oliva">
          Arrivato! {fmt(value)} {from} = {fmt(v)} {to}
        </p>
      )}
    </div>
  );
}

export const MIS_LESSONS: Record<string, { title: string; level: number; pages: LessonPage[] }> = {
  'mis-lunghezze': {
    title: 'le lunghezze',
    level: 1,
    pages: [
      {
        title: 'Il metro',
        render: () => (
          <>
            <p>Per misurare quanto è lunga una cosa usiamo il <b>metro</b> (m). Un passo grande di un adulto è circa un metro.</p>
            <MetroDisegno />
            <p>Il metro si divide in 10 <b>decimetri</b> (dm), e ogni decimetro in 10 <b>centimetri</b> (cm).</p>
          </>
        ),
      },
      {
        title: 'La tabella delle unità',
        render: () => (
          <>
            <p>
              Ogni unità è <b>10 volte</b> più grande di quella alla sua destra. A sinistra del metro ci sono le unità più
              grandi, a destra le più piccole.
            </p>
            <UnitTable family="lunghezza" showArrows from="m" />
            <p>Quindi 1 m = 10 dm = 100 cm = 1000 mm.</p>
          </>
        ),
      },
      {
        title: 'Proviamo: 3 m in cm',
        requiresAction: true,
        render: (api) => (
          <>
            <p>Tocca il pulsante per fare un passo alla volta verso i centimetri. Guarda cosa succede al numero.</p>
            <Passi family="lunghezza" value={3} from="m" to="cm" onArrive={api.done} />
          </>
        ),
      },
      {
        title: 'La regola',
        requiresAction: true,
        render: (api) => (
          <>
            <p>
              I centimetri sono <b>più piccoli</b> dei metri: per fare la stessa lunghezza ne servono <b>di più</b>. Per
              questo il numero è diventato più grande: 3 → 300.
            </p>
            <LessonChoice
              api={api}
              question="Se passo a un’unità più piccola, il numero…"
              options={[
                { text: 'diventa più grande', ok: true },
                { text: 'diventa più piccolo', ok: false },
              ]}
              explain="Unità più piccola → numero più grande: si moltiplica (× 10 per ogni passo)."
            />
          </>
        ),
      },
    ],
  },
  'mis-ritorno': {
    title: 'tornare indietro',
    level: 2,
    pages: [
      {
        title: 'Verso un’unità più grande',
        render: () => (
          <>
            <p>
              Adesso facciamo il contrario: da un’unità piccola a una più grande, per esempio dai centimetri ai metri. Le
              unità più grandi “contengono” tante unità piccole, quindi ne servono <b>di meno</b>.
            </p>
            <UnitTable family="lunghezza" from="cm" to="m" />
          </>
        ),
      },
      {
        title: 'Proviamo: 500 cm in m',
        requiresAction: true,
        render: (api) => (
          <>
            <p>A ogni passo verso sinistra si divide per 10.</p>
            <Passi family="lunghezza" value={500} from="cm" to="m" onArrive={api.done} />
          </>
        ),
      },
      {
        title: 'Anche per i litri',
        requiresAction: true,
        render: (api) => (
          <>
            <p>
              Per i liquidi si usa il <b>litro</b> (l): 1 l = 10 dl = 100 cl = 1000 ml. La tabella funziona allo stesso modo.
            </p>
            <UnitTable family="capacita" from="l" />
            <LessonChoice
              api={api}
              question="200 cl in litri: il numero diventa più grande o più piccolo?"
              options={[
                { text: 'più piccolo: 2 l', ok: true },
                { text: 'più grande: 20 000 l', ok: false },
              ]}
              explain="Il litro è più grande del centilitro, quindi il numero diventa più piccolo: 200 : 100 = 2."
            />
          </>
        ),
      },
    ],
  },
  'mis-pesi': {
    title: 'i pesi',
    level: 3,
    pages: [
      {
        title: 'Il grammo e il chilo',
        render: () => (
          <>
            <p>
              Per pesare usiamo il <b>grammo</b> (g). Una caramella pesa pochi grammi. Il <b>chilogrammo</b> (kg) vale{' '}
              <b>1000 grammi</b>: “chilo” vuol dire mille.
            </p>
            <UnitTable family="massa" showArrows from="g" />
          </>
        ),
      },
      {
        title: 'Proviamo: 2 kg in g',
        requiresAction: true,
        render: (api) => (
          <>
            <p>Dai chili ai grammi sono 3 passi a destra: × 1000.</p>
            <Passi family="massa" value={2} from="kg" to="g" onArrive={api.done} />
          </>
        ),
      },
    ],
  },
  'mis-decimali': {
    title: 'i numeri con la virgola',
    level: 4,
    pages: [
      {
        title: 'La virgola nella tabella',
        render: () => (
          <>
            <p>
              2,5 m vuol dire 2 metri e 5 decimetri. Nella tabella la cifra delle <b>unità</b> va sotto i metri, e la
              virgola sta subito dopo.
            </p>
            <UnitTable family="lunghezza" value={2.5} valueUnit="m" from="m" />
          </>
        ),
      },
      {
        title: 'Proviamo: 2,5 m in cm',
        requiresAction: true,
        render: (api) => (
          <>
            <p>A ogni passo la virgola si sposta di un posto. Dove non c’è una cifra si scrive 0.</p>
            <Passi family="lunghezza" value={2.5} from="m" to="cm" onArrive={api.done} />
          </>
        ),
      },
      {
        title: 'E al contrario: 75 cm in m',
        requiresAction: true,
        render: (api) => (
          <>
            <p>Verso sinistra la virgola si sposta a sinistra: se mancano cifre davanti si scrive 0.</p>
            <Passi family="lunghezza" value={75} from="cm" to="m" onArrive={api.done} />
          </>
        ),
      },
    ],
  },
};

export function lessonForLevel(level: number): string | null {
  return Object.entries(MIS_LESSONS).find(([, l]) => l.level === level)?.[0] ?? null;
}
