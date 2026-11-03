import { Star } from './Icons';

/** Unica animazione festosa dell'app: solo nella schermata dei premi, disattivata con "riduci movimento". */
export function Celebration({ count = 14 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="festa-stella absolute top-0"
          style={{ left: `${(i * 67) % 100}%`, animationDelay: `${(i % 7) * 0.25}s` }}
        >
          <Star size={18 + ((i * 7) % 16)} />
        </span>
      ))}
    </div>
  );
}
