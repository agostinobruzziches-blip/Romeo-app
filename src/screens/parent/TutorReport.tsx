import { useEffect, useState } from 'react';
import { tutorReport } from '../../core/stats';
import { BigButton } from '../../ui/BigButton';

export function TutorReport() {
  const [days, setDays] = useState(7);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => {
    void tutorReport(days).then(setText);
  }, [days]);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Riepilogo Viaggio nel Tempo', text });
        return;
      }
    } catch {
      return; // condivisione annullata
    }
    await copy();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Testo copiato: incollalo dove vuoi.');
    } catch {
      setStatus('Tieni premuto sul testo per selezionarlo e copiarlo.');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base text-inchiostro-2">
        Un riepilogo in testo semplice da mandare a chi lo segue nello studio.
      </p>
      <div className="flex gap-2">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`min-h-12 flex-1 rounded-xl font-bold ${days === d ? 'bg-egeo text-white' : 'bg-white'}`}
          >
            {d} giorni
          </button>
        ))}
      </div>
      <pre className="rounded-xl bg-white p-3 font-sans text-base whitespace-pre-wrap select-text">{text}</pre>
      <BigButton onClick={() => void share()}>Condividi</BigButton>
      <BigButton variant="tenue" onClick={() => void copy()}>
        Copia il testo
      </BigButton>
      <p className="min-h-6 text-base text-oliva">{status}</p>
    </div>
  );
}
