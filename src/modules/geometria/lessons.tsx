import { useState, type ReactNode } from 'react';
import { BigButton } from '../../ui/BigButton';
import { LessonChoice, type LessonPage } from '../../ui/Lesson';
import { Figure } from './Figure';

function Counting({ mode, onAll }: { mode: 'cells' | 'edges'; onAll: () => void }) {
  const [n, setN] = useState(0);
  const total = mode === 'cells' ? 12 : 14;
  return (
    <div className="flex flex-col items-center gap-2">
      <Figure
        shape={{ type: 'rettangolo', b: 4, h: 3 }}
        grid
        labels={false}
        mode={mode}
        highlight={mode === 'edges' ? 'contorno' : null}
        onMark={(m) => {
          setN(m);
          if (m === total) onAll();
        }}
      />
      <p className="rounded-xl bg-white px-4 py-2 text-2xl font-bold tabular-nums">
        {mode === 'cells' ? `Quadretti colorati: ${n}` : `Lati contati: ${n}`}
      </p>
    </div>
  );
}

function Toggle({ label, onOn, children }: { label: string; onOn: () => void; children: (on: boolean) => ReactNode }) {
  const [on, setOn] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      {children(on)}
      {!on && (
        <BigButton
          variant="secondario"
          onClick={() => {
            setOn(true);
            onOn();
          }}
        >
          {label}
        </BigButton>
      )}
    </div>
  );
}

export const GEO_LESSONS: Record<string, { title: string; level: number; pages: LessonPage[] }> = {
  'geo-perimetro': {
    title: 'il perimetro',
    level: 1,
    pages: [
      {
        title: 'Il contorno',
        render: () => (
          <>
            <p>
              Il <b>perimetro</b> è la lunghezza del <b>contorno</b> di una figura. Immagina una formica che cammina tutto
              intorno al bordo: la strada che fa è il perimetro.
            </p>
            <Figure shape={{ type: 'rettangolo', b: 4, h: 3 }} grid labels={false} highlight="contorno" />
          </>
        ),
      },
      {
        title: 'Conta i lati sul bordo',
        requiresAction: true,
        render: (api) => (
          <>
            <p>Tocca uno per uno tutti i lati dei quadretti sul bordo, facendo il giro completo.</p>
            <Counting mode="edges" onAll={api.done} />
            {api.isDone && (
              <p className="rounded-xl bg-oliva-chiaro p-3 font-bold text-oliva">
                Il perimetro è 14 lati di quadretto. Se ogni quadretto è di 1 cm, il perimetro è 14 cm.
              </p>
            )}
          </>
        ),
      },
      {
        title: 'Senza contare tutto',
        requiresAction: true,
        render: (api) => (
          <>
            <p>
              Nel rettangolo i lati opposti sono uguali: base + altezza + base + altezza. Si fa prima così:{' '}
              <b>(base + altezza) × 2</b>.
            </p>
            <p className="text-center text-3xl font-bold">(4 + 3) × 2 = 14</p>
            <LessonChoice
              api={api}
              question="E nel quadrato, che ha 4 lati uguali?"
              options={[
                { text: 'lato × 4', ok: true },
                { text: 'lato × lato', ok: false },
              ]}
              explain="Il quadrato ha 4 lati uguali: perimetro = lato × 4."
            />
          </>
        ),
      },
    ],
  },
  'geo-area': {
    title: 'l’area',
    level: 1,
    pages: [
      {
        title: 'Lo spazio dentro',
        render: () => (
          <>
            <p>
              L’<b>area</b> è quanto spazio c’è <b>dentro</b> la figura: quanti quadretti servono per coprirla tutta, come
              le piastrelle di un pavimento.
            </p>
            <Figure shape={{ type: 'rettangolo', b: 4, h: 3 }} grid labels={false} highlight="superficie" />
          </>
        ),
      },
      {
        title: 'Copri la figura',
        requiresAction: true,
        render: (api) => (
          <>
            <p>Tocca tutti i quadretti per colorarli.</p>
            <Counting mode="cells" onAll={api.done} />
          </>
        ),
      },
      {
        title: 'È una tabellina!',
        requiresAction: true,
        render: (api) => (
          <>
            <p>
              Ci sono 3 righe da 4 quadretti: invece di contarli uno a uno, si fa <b>3 × 4 = 12</b>. Nel rettangolo:{' '}
              <b>area = base × altezza</b>.
            </p>
            <LessonChoice
              api={api}
              question="Un rettangolo ha 5 righe da 6 quadretti. Quanti quadretti ci sono?"
              options={[
                { text: '30', ok: true },
                { text: '22', ok: false },
                { text: '11', ok: false },
              ]}
              explain="5 × 6 = 30 quadretti. 22 sarebbe il perimetro: è un’altra cosa!"
            />
          </>
        ),
      },
    ],
  },
  'geo-differenza': {
    title: 'perimetro o area?',
    level: 2,
    pages: [
      {
        title: 'Due cose diverse',
        render: () => (
          <>
            <p>
              Il perimetro è una <b>lunghezza</b>: si misura in cm o m. L’area è una <b>superficie</b>: si misura in{' '}
              <b>cm²</b> (centimetri quadrati), cioè quadretti di 1 cm per lato.
            </p>
            <div className="grid grid-cols-2 gap-2 text-center text-base">
              <div>
                <Figure shape={{ type: 'rettangolo', b: 4, h: 3 }} grid labels={false} highlight="contorno" maxWidth={170} />
                <p className="font-bold text-terracotta">perimetro: 14 cm</p>
              </div>
              <div>
                <Figure shape={{ type: 'rettangolo', b: 4, h: 3 }} grid labels={false} highlight="superficie" maxWidth={170} />
                <p className="font-bold text-ambra">area: 12 cm²</p>
              </div>
            </div>
          </>
        ),
      },
      {
        title: 'Nella vita',
        requiresAction: true,
        render: (api) => (
          <LessonChoice
            api={api}
            question="Il nonno vuole mettere la rete tutto intorno all’orto. Deve sapere…"
            options={[
              { text: 'il perimetro dell’orto', ok: true },
              { text: 'l’area dell’orto', ok: false },
            ]}
            explain="La rete segue il contorno: serve il perimetro. Per sapere quanta erba seminare servirebbe l’area."
          />
        ),
      },
    ],
  },
  'geo-triangolo': {
    title: 'l’area del triangolo',
    level: 4,
    pages: [
      {
        title: 'Metà di un rettangolo',
        requiresAction: true,
        render: (api) => (
          <Toggle label="Mostra il rettangolo intorno" onOn={api.done}>
            {(on) => {
              return (
                <>
                  <p>
                    Un triangolo con base 8 e altezza 6. Se lo mettiamo dentro un rettangolo con la stessa base e la stessa
                    altezza…
                  </p>
                  <Figure shape={{ type: 'triangolo', b: 8, h: 6 }} highlight="superficie" split={on} unit="cm" />
                  {on && (
                    <p className="rounded-xl bg-oliva-chiaro p-3 font-bold text-oliva">
                      …il triangolo occupa esattamente metà del rettangolo! Area = base × altezza : 2 = 8 × 6 : 2 = 24 cm².
                    </p>
                  )}
                </>
              );
            }}
          </Toggle>
        ),
      },
      {
        title: 'L’altezza',
        render: () => (
          <p>
            L’<b>altezza</b> del triangolo è la linea tratteggiata: parte dal vertice in alto e scende dritta (perpendicolare)
            sulla base. Non è il lato obliquo!
          </p>
        ),
      },
    ],
  },
  'geo-composte': {
    title: 'le figure composte',
    level: 5,
    pages: [
      {
        title: 'Dividi in rettangoli',
        requiresAction: true,
        render: (api) => (
          <Toggle label="Dividi la figura" onOn={api.done}>
            {(on) => {
              return (
                <>
                  <p>Questa figura a L non è un rettangolo. Ma possiamo tagliarla in due rettangoli!</p>
                  <Figure shape={{ type: 'elle', W: 8, H: 6, cw: 3, ch: 2 }} highlight="superficie" split={on} unit="cm" />
                  {on && (
                    <p className="rounded-xl bg-oliva-chiaro p-3 font-bold text-oliva">
                      Rettangolo di sotto: 8 × 4 = 32. Rettangolo di sopra: 5 × 2 = 10. Area totale: 32 + 10 = 42 cm².
                    </p>
                  )}
                </>
              );
            }}
          </Toggle>
        ),
      },
    ],
  },
};

export function lessonsForLevel(level: number): string[] {
  return Object.entries(GEO_LESSONS)
    .filter(([, l]) => l.level <= level)
    .map(([id]) => id);
}
