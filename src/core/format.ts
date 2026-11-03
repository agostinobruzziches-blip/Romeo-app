/** Numeri all'italiana per la scuola: virgola per i decimali, nessun separatore delle migliaia. */
export function fmt(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return String(r).replace('.', ',');
}

export function parseNum(s: string): number {
  return Number(s.replace(',', '.'));
}

export function sameNumber(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

/** Euro con due decimali: 2,50 €. */
export function euro(n: number): string {
  return `${n.toFixed(2).replace('.', ',')} €`;
}
