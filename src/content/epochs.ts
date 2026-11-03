export type EpochId = 'preistoria' | 'egizi' | 'cretesi' | 'greci' | 'romani' | 'medioevo';

export interface Epoch {
  id: EpochId;
  name: string;
  /** Periodo indicativo, adatto alla scuola primaria. */
  period: string;
  /** Frase di Glauco quando si entra nell'epoca. */
  intro: string;
  colors: {
    bg: string; // sfondo della carta e della pagina
    accent: string; // colore principale della civiltà
    ink: string; // testo su sfondo bg
    soft: string; // riquadri chiari
  };
}

/** In ordine cronologico: la linea del tempo si percorre dall'alto in basso. */
export const EPOCHS: Epoch[] = [
  {
    id: 'preistoria',
    name: 'Preistoria',
    period: 'da milioni di anni fa a circa 5.000 anni fa',
    intro: 'Qui gli uomini scoprono il fuoco, scheggiano la pietra e dipingono le grotte.',
    colors: { bg: '#f3e2c3', accent: '#a8572c', ink: '#3b2a20', soft: '#faf0dc' },
  },
  {
    id: 'egizi',
    name: 'Egizi',
    period: 'circa dal 3000 al 30 a.C.',
    intro: 'Lungo il fiume Nilo nascono piramidi, faraoni e la scrittura dei geroglifici.',
    colors: { bg: '#f4e4b5', accent: '#2a4d8f', ink: '#2b2a33', soft: '#fbf3da' },
  },
  {
    id: 'cretesi',
    name: 'Cretesi',
    period: 'circa dal 2000 al 1450 a.C.',
    intro: 'Sull’isola di Creta un popolo di navigatori costruisce grandi palazzi colorati.',
    colors: { bg: '#d8ecf5', accent: '#b8382b', ink: '#1f3346', soft: '#eef7fb' },
  },
  {
    id: 'greci',
    name: 'Greci',
    period: 'circa dall’800 al 146 a.C.',
    intro: 'Città come Atene e Sparta, i templi, le Olimpiadi e i primi grandi matematici.',
    colors: { bg: '#e8eef5', accent: '#2e5e8c', ink: '#1f2b3a', soft: '#f6f8fb' },
  },
  {
    id: 'romani',
    name: 'Romani',
    period: 'dal 753 a.C. al 476 d.C.',
    intro: 'Da una piccola città nasce un grande impero, con strade, acquedotti e legioni.',
    colors: { bg: '#f5ddd5', accent: '#a8312a', ink: '#3a1f1b', soft: '#fbefea' },
  },
  {
    id: 'medioevo',
    name: 'Medioevo',
    period: 'dal 476 al 1492 d.C.',
    intro: 'Castelli, cavalieri, monasteri e mercanti che viaggiano fino in Cina.',
    colors: { bg: '#e3ecd9', accent: '#4f7a4a', ink: '#24321f', soft: '#f3f7ee' },
  },
];

export const EPOCH_BY_ID = Object.fromEntries(EPOCHS.map((e) => [e.id, e])) as Record<EpochId, Epoch>;
