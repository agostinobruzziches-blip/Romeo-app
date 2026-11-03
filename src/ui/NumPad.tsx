import { sounds } from '../core/sound';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  maxLength?: number;
  submitLabel?: string;
  /** Mostra il tasto della virgola (numeri decimali). */
  decimal?: boolean;
}

type Key = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | ',' | 'canc' | 'ok';
const INT_KEYS: Key[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'canc', '0', 'ok'];
const DEC_KEYS: Key[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'canc', 'ok'];

/** Tastierino numerico grande, sempre uguale e nella stessa posizione. */
export function NumPad({ value, onChange, onSubmit, disabled, maxLength = 3, submitLabel = 'OK', decimal = false }: Props) {
  const keys = decimal ? DEC_KEYS : INT_KEYS;
  const press = (k: Key) => {
    if (disabled) return;
    sounds.tocco();
    if (k === 'canc') onChange(value.slice(0, -1));
    else if (k === 'ok') {
      if (value.length && value !== ',') onSubmit();
    } else if (k === ',') {
      if (!value.includes(',')) onChange((value || '0') + ',');
    } else if (value.replace(',', '').length < maxLength) onChange(value === '0' ? k : value + k);
  };
  const h = decimal ? 'h-14' : 'h-16';
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tastierino numerico">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          disabled={disabled || (k === 'ok' && !value.length)}
          onClick={() => press(k)}
          aria-label={k === 'canc' ? 'Cancella' : k === 'ok' ? 'Conferma' : k === ',' ? 'Virgola' : k}
          className={`${h} rounded-2xl text-3xl font-bold select-none disabled:opacity-40 ${
            k === 'ok' && decimal ? 'col-span-3' : ''
          } ${
            k === 'ok'
              ? 'bg-oliva text-white shadow-[0_3px_0_#2b5a40] active:brightness-90'
              : k === 'canc'
                ? 'bg-carta-2 text-inchiostro-2 active:brightness-95'
                : k === ','
                  ? 'bg-egeo-chiaro text-egeo active:brightness-95'
                  : 'bg-white text-inchiostro shadow-[0_3px_0_var(--color-carta-2)] active:bg-carta-2'
          }`}
        >
          {k === 'canc' ? '⌫' : k === 'ok' ? submitLabel : k}
        </button>
      ))}
    </div>
  );
}
