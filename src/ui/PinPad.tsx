import { useState } from 'react';
import { NumPad } from './NumPad';

/** Inserimento PIN a 4 cifre (le cifre non si vedono). */
export function PinPad({ title, error, onComplete }: { title: string; error?: string; onComplete: (pin: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <h2 className="text-center text-2xl font-bold">{title}</h2>
        <div className="flex gap-3" aria-label={`${value.length} cifre su 4`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-5 w-5 rounded-full ${i < value.length ? 'bg-inchiostro' : 'bg-carta-2'}`} />
          ))}
        </div>
        <p className="min-h-7 text-lg text-ambra">{error}</p>
      </div>
      <NumPad
        value={value}
        maxLength={4}
        onChange={setValue}
        submitLabel="OK"
        onSubmit={() => {
          if (value.length === 4) {
            onComplete(value);
            setValue('');
          }
        }}
      />
    </div>
  );
}
