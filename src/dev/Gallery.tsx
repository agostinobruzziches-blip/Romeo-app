import { CARDS } from '../content/cards';
import { CardView } from '../ui/CardView';

/** Solo in sviluppo (#/galleria): tutte le carte, per controllare le illustrazioni. */
export function Gallery() {
  return (
    <div className="grid grid-cols-4 gap-2 p-2">
      {CARDS.map((c) => (
        <CardView key={c.id} id={c.id} owned />
      ))}
    </div>
  );
}
