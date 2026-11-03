import { useState, type ReactNode } from 'react';
import { BigButton } from './BigButton';
import { Owl } from './Guide';

export interface LessonApi {
  /** Da chiamare quando il bambino ha fatto l'azione richiesta dalla pagina. */
  done: () => void;
  isDone: boolean;
}

export interface LessonPage {
  title: string;
  /** Se vero, "Avanti" si attiva solo dopo l'azione (toccare, spostare, rispondere). */
  requiresAction?: boolean;
  render: (api: LessonApi) => ReactNode;
}

/**
 * Lezione "Scopri": poche pagine, una idea per pagina, sempre con qualcosa da fare.
 * free = navigazione libera (quando la si rivede dall'aiuto).
 */
export function LessonView({
  title,
  pages,
  onFinish,
  free = false,
}: {
  title: string;
  pages: LessonPage[];
  onFinish?: () => void;
  free?: boolean;
}) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const page = pages[i];
  const isDone = free || !page.requiresAction || !!done[i];
  const last = i === pages.length - 1;
  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        <Owl size={52} />
        <div className="flex-1">
          <p className="text-sm font-bold tracking-wide text-terracotta uppercase">Scopri · {title}</p>
          <h2 className="text-2xl leading-tight font-bold">{page.title}</h2>
        </div>
      </div>
      <div className="flex gap-1.5" aria-label={`Pagina ${i + 1} di ${pages.length}`}>
        {pages.map((_, k) => (
          <span key={k} className={`h-2 flex-1 rounded-full ${k <= i ? 'bg-terracotta' : 'bg-carta-2'}`} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto text-xl leading-snug">
        {page.render({ done: () => setDone((d) => ({ ...d, [i]: true })), isDone: !!done[i] })}
      </div>
      <div className="flex gap-2">
        {i > 0 && (
          <BigButton variant="tenue" full={false} className="w-1/3" onClick={() => setI(i - 1)}>
            Indietro
          </BigButton>
        )}
        {!last ? (
          <BigButton className="flex-1" disabled={!isDone} onClick={() => setI(i + 1)}>
            Avanti
          </BigButton>
        ) : (
          !free && (
            <BigButton className="flex-1" disabled={!isDone} onClick={onFinish}>
              Ho capito, proviamo!
            </BigButton>
          )
        )}
      </div>
    </div>
  );
}

/** Piccolo quiz dentro una lezione: due o tre scelte, la pagina si sblocca con quella giusta. */
export function LessonChoice({
  api,
  question,
  options,
  explain,
}: {
  api: LessonApi;
  question: string;
  options: Array<{ text: string; ok: boolean }>;
  explain: string;
}) {
  const [wrong, setWrong] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">{question}</p>
      {options.map((o) => (
        <BigButton
          key={o.text}
          variant={api.isDone && o.ok ? 'secondario' : 'tenue'}
          className="text-left text-lg"
          onClick={() => {
            if (o.ok) {
              setWrong(null);
              api.done();
            } else setWrong(o.text);
          }}
        >
          {o.text}
        </BigButton>
      ))}
      {wrong && !api.isDone && <p className="font-bold text-ambra">Quasi! Ripensaci.</p>}
      {api.isDone && <p className="rounded-xl bg-oliva-chiaro p-3 font-bold text-oliva">Giusto! {explain}</p>}
    </div>
  );
}
