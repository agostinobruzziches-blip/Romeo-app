import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db } from '../../db/schema';
import { BigButton } from '../../ui/BigButton';
import { GUIDE, fillGuide, guideAsText, type GuideBlock } from './guideContent';

/** Trasforma **testo** in grassetto. */
function Rich({ text }: { text: string }) {
  const parts = text.split('**');
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : <span key={i}>{p}</span>))}
    </>
  );
}

function Block({ b, fill }: { b: GuideBlock; fill: (s: string) => string }) {
  if (typeof b === 'string')
    return (
      <p>
        <Rich text={fill(b)} />
      </p>
    );
  if ('list' in b)
    return (
      <ul className="flex list-disc flex-col gap-1.5 pl-5">
        {b.list.map((li, i) => (
          <li key={i}>
            <Rich text={fill(li)} />
          </li>
        ))}
      </ul>
    );
  return (
    <p className="rounded-xl bg-ambra-chiaro p-3">
      <Rich text={fill(b.tip)} />
    </p>
  );
}

/** Guida per genitori e tutor: sezioni apribili, condivisibile come testo. */
export function Guida() {
  const s = useLiveQuery(() => db.settings.get('main'), []);
  const [status, setStatus] = useState('');
  // finché il nome non è impostato (resta quello predefinito) si scrive «il bambino»
  const name = s?.childName && s.childName !== 'Esploratore' ? s.childName : 'il bambino';
  const helper = s?.parentLabel || 'papà/mamma';
  const fill = (t: string) => fillGuide(t, name, helper);

  const share = async () => {
    const text = guideAsText(name, helper);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Guida al Viaggio nel Tempo', text });
        return;
      }
    } catch {
      return; // condivisione annullata
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Guida copiata: incollala dove vuoi.');
    } catch {
      setStatus('Non riesco a copiare il testo su questo telefono.');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base text-inchiostro-2">
        Come funziona l’app, come impostarla e come aiutare {name} senza dare la soluzione. Tocca un titolo per aprirlo.
      </p>
      {GUIDE.map((sec, i) => (
        <details key={sec.id} open={i === 0} className="group rounded-xl bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-lg font-bold">
            <span>{fill(sec.title)}</span>
            <span aria-hidden="true" className="text-inchiostro-2 group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="flex flex-col gap-2 px-3 pb-3 text-base leading-relaxed">
            {sec.blocks.map((b, k) => (
              <Block key={k} b={b} fill={fill} />
            ))}
          </div>
        </details>
      ))}
      <BigButton variant="secondario" onClick={() => void share()}>
        Condividi la guida con la tutor
      </BigButton>
      <p className="min-h-6 text-base text-oliva">{status}</p>
    </div>
  );
}
