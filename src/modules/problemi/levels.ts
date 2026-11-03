export const LEVEL_NAMES: Record<number, string> = {
  1: 'Aggiungere e togliere, numeri piccoli',
  2: 'Anche gruppi uguali e ripartizione',
  3: 'Anche confronto e contenenza, con un numero che non serve',
  4: 'Anche due passaggi e frazioni di una quantità',
  5: 'Numeri più grandi e soldi',
  6: 'Soldi con i centesimi e misure diverse nello stesso problema',
  7: 'Perimetro e area nei problemi',
};
export const MAX_LEVEL = 7;
export const PROGRESS_KEY = 'generale';

export { evaluateLevel } from '../../core/levels';
