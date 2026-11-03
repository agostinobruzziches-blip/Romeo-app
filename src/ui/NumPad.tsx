import { sounds } from '../core/sound';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  maxLength?: number;
  submitLabel?: string;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'canc', '0', 'ok'] as const;

/** Tastierino numerico grande, sempre uguale e nella stessa posizione. */
export function NumPad({ value, onChange, onSubmit, disabled, maxLength = 3, submitLabel = 'OK' }: Props) {
  const press = (k: (typeof KEYS)[number]) => {
    if (disabled) return;
    sounds.tocco();
    if (k === 'canc') onChange(value.slice(0, -1));
    else if (k === 'ok') {
      if (value.length) onSubmit();
    } else if (value.length < maxLength) onChange(value === '0' ? k : value + k);
  };
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tastierino numerico">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          disabled={disabled || (k === 'ok' && !value.length)}
          onClick={() => press(k)}
          aria-label={k === 'canc' ? 'Cancella' : k === 'ok' ? 'Conferma' : k}
          className={`h-16 rounded-2xl text-3xl font-bold select-none disabled:opacity-40 ${
            k === 'ok'
              ? 'bg-oliva text-white shadow-[0_3px_0_#2b5a40] active:brightness-90'
              : k === 'canc'
                ? 'bg-carta-2 text-inchiostro-2 active:brightness-95'
                : 'bg-white text-inchiostro shadow-[0_3px_0_var(--color-carta-2)] active:bg-carta-2'
          }`}
        >
          {k === 'canc' ? '⌫' : k === 'ok' ? submitLabel : k}
        </button>
      ))}
    </div>
  );
}
