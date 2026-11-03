/** Suggerimenti testuali: il "fatto vicino", senza mai dire il risultato. */

const SPECIAL = [1, 2, 5, 9, 10];

export function neighborHint(x: number, y: number): string {
  // scegliamo come "moltiplicatore" il fattore con la regola più comoda
  let m = y;
  let n = x;
  if (SPECIAL.includes(x) && !SPECIAL.includes(y)) {
    m = x;
    n = y;
  }
  const q = `${x} × ${y}`;
  switch (m) {
    case 1:
      return `${q}: è un solo gruppo da ${n}.`;
    case 10:
      return `${q}: per fare per 10, aggiungi uno zero a ${n}.`;
    case 2:
      return `${q} è il doppio di ${n}: quanto fa ${n} + ${n}?`;
    case 5:
      return `${q} è la metà di ${n} × 10. Sai che ${n} × 10 = ${n * 10}: qual è la metà?`;
    case 9:
      return `${q} = ${n} × 10 meno ${n}. Sai che ${n} × 10 = ${n * 10}: togli ${n}.`;
    default:
      return `${q} = ${n} × ${m - 1} più ${n}. Sai che ${n} × ${m - 1} = ${n * (m - 1)}: aggiungi ancora ${n}.`;
  }
}

export function skipCountHint(x: number, product: number): string {
  const first = [x, x * 2, x * 3].filter((v) => v <= product);
  return `Conta di ${x} in ${x}: ${first.join(', ')}… fino ad arrivare a ${product}. Quanti salti hai fatto?`;
}
