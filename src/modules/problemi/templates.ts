import { pick, randInt, shuffle, type Rng } from '../../core/random';
import type { Op, ProblemCategory, ProblemData, Segment, Step } from './types';

/* ------------------------------------------------------------------
 * Piccolo linguaggio per scrivere i testi:
 *   N('a', 12)        → numero importante (da toccare)
 *   X('d', 3)         → numero NON importante (distrattore)
 *   Q('Quante ...?')  → la domanda (viene evidenziata quando serve)
 * ------------------------------------------------------------------ */

type Part = string | Segment | Segment[];
const N = (id: string, n: number): Segment => ({ n, id, important: true });
const X = (id: string, n: number): Segment => ({ n, id, important: false });
const Q = (...parts: Array<string | Segment>): Segment[] =>
  parts.map((p) => (typeof p === 'string' ? { t: p, q: true } : { ...p, q: true }));
function seg(...parts: Part[]): Segment[] {
  return parts.flatMap((p) => (typeof p === 'string' ? [{ t: p }] : Array.isArray(p) ? p : [p]));
}

const step = (op: Op, a: number, aRef: string, b: number, bRef: string, goal?: string): Step => ({
  op,
  a: { value: a, ref: aRef },
  b: { value: b, ref: bRef },
  result: op === '+' ? a + b : op === '-' ? a - b : op === '×' ? a * b : a / b,
  ordered: op === '-' || op === ':',
  goal,
});

/** Frasi con un numero che non serve: dal livello 3 allenano a scegliere i dati giusti. */
const DISTRACTORS: Array<(rng: Rng) => Part[]> = [
  (rng) => ['È il giorno ', X('d', randInt(rng, 2, 28)), ' del mese. '],
  (rng) => ['Sono le ', X('d', randInt(rng, 8, 11)), ' del mattino. '],
  (rng) => ['Mancano ', X('d', randInt(rng, 3, 9)), ' giorni alla grande festa. '],
];
const maybeDistractor = (rng: Rng, level: number): Part[] => (level >= 3 ? pick(rng, DISTRACTORS)(rng) : []);

/** Intervalli dei numeri per livello: si parte facilissimo. */
function sumRange(level: number): [number, number] {
  return level <= 1 ? [2, 10] : level === 2 ? [5, 30] : level <= 4 ? [10, 60] : [50, 400];
}
const factorMax = (level: number) => (level <= 2 ? 5 : 10);

const NAMES = ['Luca', 'Sara', 'Giulia', 'Marco', 'Anna', 'Matteo', 'Sofia', 'Leo'];
const twoNames = (rng: Rng) => {
  const [a, b] = shuffle(rng, NAMES);
  return [a, b];
};

export interface Template {
  id: string;
  category: ProblemCategory;
  minLevel: number;
  theme: 'storia' | 'quotidiano';
  make(rng: Rng, level: number): Omit<ProblemData, 'templateId' | 'category' | 'level' | 'theme'>;
}

export const TEMPLATES: Template[] = [
  // ---------------------------------------------------------------- AGGIUNGERE
  {
    id: 'agg-anfore',
    category: 'aggiungere',
    minLevel: 1,
    theme: 'storia',
    make(rng, level) {
      const [lo, hi] = sumRange(level);
      const a = randInt(rng, lo, hi);
      const b = randInt(rng, lo, hi);
      return {
        segments: seg(
          'Un mercante greco carica sulla nave ', N('a', a), ' anfore di olio. Poi carica altre ', N('b', b), ' anfore di vino. ',
          ...maybeDistractor(rng, level),
          Q('Quante anfore ci sono in tutto sulla nave?'),
        ),
        questionChoices: ['Quante anfore ci sono in tutto', 'Quante anfore di vino ci sono', 'Quante navi ha il mercante'],
        steps: [step('+', a, 'a', b, 'b')],
        unit: 'anfore',
        bars: [{ kind: 'parti', a, b, unit: 'anfore' }],
        opHint: 'Le anfore di olio e quelle di vino si mettono insieme, oppure se ne toglie qualcuna?',
      };
    },
  },
  {
    id: 'agg-figurine',
    category: 'aggiungere',
    minLevel: 1,
    theme: 'quotidiano',
    make(rng, level) {
      const [lo, hi] = sumRange(level);
      const a = randInt(rng, lo, hi);
      const b = randInt(rng, lo, hi);
      const [p] = twoNames(rng);
      return {
        segments: seg(
          `${p} ha nell’album `, N('a', a), ' carte. Oggi ne trova altre ', N('b', b), '. ',
          ...maybeDistractor(rng, level),
          Q(`Quante carte ha adesso ${p}?`),
        ),
        questionChoices: [`Quante carte ha ${p} adesso, in tutto`, `Quante carte ha trovato oggi`, `Quante carte ha regalato`],
        steps: [step('+', a, 'a', b, 'b')],
        unit: 'carte',
        bars: [{ kind: 'parti', a, b, unit: 'carte' }],
        opHint: 'Le carte nuove si aggiungono a quelle che aveva o se ne vanno via?',
      };
    },
  },
  {
    id: 'agg-legione',
    category: 'aggiungere',
    minLevel: 2,
    theme: 'storia',
    make(rng, level) {
      const [lo, hi] = sumRange(level);
      const a = randInt(rng, lo, hi);
      const b = randInt(rng, lo, hi);
      return {
        segments: seg(
          'Una legione romana marcia per ', N('a', a), ' chilometri il primo giorno e per ', N('b', b), ' chilometri il secondo giorno. ',
          ...maybeDistractor(rng, level),
          Q('Quanti chilometri percorre in tutto?'),
        ),
        questionChoices: ['Quanti chilometri in tutto, nei due giorni', 'Quanti chilometri il secondo giorno', 'Quanti soldati ci sono'],
        steps: [step('+', a, 'a', b, 'b')],
        unit: 'km',
        bars: [{ kind: 'parti', a, b, unit: 'km' }],
        opHint: 'La strada del primo giorno e quella del secondo si mettono insieme?',
      };
    },
  },

  // ---------------------------------------------------------------- TOGLIERE
  {
    id: 'tog-papiro',
    category: 'togliere',
    minLevel: 1,
    theme: 'storia',
    make(rng, level) {
      const [lo, hi] = sumRange(level);
      const b = randInt(rng, lo, hi);
      const a = b + randInt(rng, lo, hi);
      return {
        segments: seg(
          'Uno scriba egizio ha ', N('a', a), ' fogli di papiro. Ne usa ', N('b', b), ' per scrivere. ',
          ...maybeDistractor(rng, level),
          Q('Quanti fogli gli restano?'),
        ),
        questionChoices: ['Quanti fogli restano, non ancora usati', 'Quanti fogli ha usato', 'Quanti fogli aveva all’inizio'],
        steps: [step('-', a, 'a', b, 'b')],
        unit: 'fogli',
        bars: [{ kind: 'togli', whole: a, part: b, unit: 'fogli' }],
        opHint: 'I fogli usati si aggiungono o si tolgono da quelli che aveva?',
      };
    },
  },
  {
    id: 'tog-regalo',
    category: 'togliere',
    minLevel: 1,
    theme: 'quotidiano',
    make(rng, level) {
      const [lo, hi] = sumRange(level);
      const b = randInt(rng, lo, hi);
      const a = b + randInt(rng, lo, hi);
      const [p, q] = twoNames(rng);
      return {
        segments: seg(
          `${p} ha `, N('a', a), ` biglie. Ne regala `, N('b', b), ` a ${q}. `,
          ...maybeDistractor(rng, level),
          Q(`Quante biglie restano a ${p}?`),
        ),
        questionChoices: [`Quante biglie restano a ${p}`, `Quante biglie riceve ${q}`, `Quante biglie hanno insieme`],
        steps: [step('-', a, 'a', b, 'b')],
        unit: 'biglie',
        bars: [{ kind: 'togli', whole: a, part: b, unit: 'biglie' }],
        opHint: `Le biglie regalate restano a ${p} o se ne vanno via?`,
      };
    },
  },
  {
    id: 'tog-vasi',
    category: 'togliere',
    minLevel: 2,
    theme: 'storia',
    make(rng, level) {
      const [lo, hi] = sumRange(level);
      const b = randInt(rng, 2, Math.max(4, Math.floor(hi / 3)));
      const a = b + randInt(rng, lo, hi);
      return {
        segments: seg(
          'Una nave cretese parte con ', N('a', a), ' vasi decorati. Durante una tempesta se ne rompono ', N('b', b), '. ',
          ...maybeDistractor(rng, level),
          Q('Quanti vasi interi arrivano al porto?'),
        ),
        questionChoices: ['Quanti vasi arrivano interi', 'Quanti vasi si sono rotti', 'Quante navi partono'],
        steps: [step('-', a, 'a', b, 'b')],
        unit: 'vasi',
        bars: [{ kind: 'togli', whole: a, part: b, unit: 'vasi' }],
        opHint: 'I vasi rotti si aggiungono o si tolgono da quelli partiti?',
      };
    },
  },

  // ---------------------------------------------------------------- CONFRONTO
  {
    id: 'con-triremi',
    category: 'confronto',
    minLevel: 3,
    theme: 'storia',
    make(rng, level) {
      const [lo, hi] = sumRange(level);
      const b = randInt(rng, lo, hi);
      const a = b + randInt(rng, 3, Math.max(5, Math.floor(hi / 2)));
      return {
        segments: seg(
          'Atene ha ', N('a', a), ' triremi. Corinto ne ha ', N('b', b), '. ',
          ...maybeDistractor(rng, level),
          Q('Quante triremi ha Atene più di Corinto?'),
        ),
        questionChoices: ['Quante triremi in più ha Atene', 'Quante triremi hanno in tutto', 'Quante triremi ha Corinto'],
        steps: [step('-', a, 'a', b, 'b')],
        unit: 'triremi',
        bars: [{ kind: 'confronto', big: a, small: b, bigLabel: 'Atene', smallLabel: 'Corinto', unit: 'triremi', unknown: 'diff' }],
        opHint: 'Per sapere la differenza tra due quantità, si aggiunge o si toglie la più piccola dalla più grande?',
      };
    },
  },
  {
    id: 'con-piu',
    category: 'confronto',
    minLevel: 3,
    theme: 'quotidiano',
    make(rng, level) {
      const [lo, hi] = sumRange(level);
      const a = randInt(rng, lo, hi);
      const b = randInt(rng, 2, Math.max(5, Math.floor(hi / 2)));
      const [p, q] = twoNames(rng);
      return {
        segments: seg(
          `${p} ha `, N('a', a), ` carte. ${q} ne ha `, N('b', b), ` più di ${p}. `,
          ...maybeDistractor(rng, level),
          Q(`Quante carte ha ${q}?`),
        ),
        questionChoices: [`Quante carte ha ${q}`, `Quante carte in più ha ${q}`, `Quante carte ha ${p}`],
        steps: [step('+', a, 'a', b, 'b')],
        unit: 'carte',
        bars: [{ kind: 'confronto-piu', base: a, extra: b, baseLabel: p, otherLabel: q, unit: 'carte' }],
        opHint: `${q} ne ha di più o di meno di ${p}? Allora il suo numero è più grande o più piccolo?`,
      };
    },
  },
  {
    id: 'con-meno',
    category: 'confronto',
    minLevel: 4,
    theme: 'storia',
    make(rng, level) {
      const [lo, hi] = sumRange(level);
      const b = randInt(rng, 2, Math.max(5, Math.floor(hi / 3)));
      const a = b + randInt(rng, lo, hi);
      return {
        segments: seg(
          'Il tempio di Atena ha ', N('a', a), ' gradini. Il tempio di Zeus ne ha ', N('b', b), ' in meno. ',
          ...maybeDistractor(rng, level),
          Q('Quanti gradini ha il tempio di Zeus?'),
        ),
        questionChoices: ['Quanti gradini ha il tempio di Zeus', 'Quanti gradini in meno ci sono', 'Quanti gradini hanno insieme'],
        steps: [step('-', a, 'a', b, 'b')],
        unit: 'gradini',
        bars: [{ kind: 'confronto', big: a, small: a - b, bigLabel: 'Atena', smallLabel: 'Zeus', unit: 'gradini', unknown: 'small' }],
        opHint: 'Il tempio di Zeus ne ha di più o di meno? Allora il suo numero è più grande o più piccolo?',
      };
    },
  },

  // ---------------------------------------------------------------- GRUPPI UGUALI
  {
    id: 'gru-casse',
    category: 'gruppi-uguali',
    minLevel: 2,
    theme: 'storia',
    make(rng, level) {
      const n = randInt(rng, 2, factorMax(level));
      const b = randInt(rng, 2, factorMax(level) + (level >= 4 ? 5 : 0));
      return {
        segments: seg(
          'Una barca sul Nilo trasporta ', N('n', n), ' casse. In ogni cassa ci sono ', N('b', b), ' vasetti di miele. ',
          ...maybeDistractor(rng, level),
          Q('Quanti vasetti di miele ci sono in tutto?'),
        ),
        questionChoices: ['Quanti vasetti in tutto, in tutte le casse', 'Quanti vasetti in una cassa', 'Quante casse ci sono'],
        steps: [step('×', n, 'n', b, 'b')],
        unit: 'vasetti',
        bars: [{ kind: 'gruppi', groups: n, each: b, unit: 'vasetti' }],
        opHint: 'Ci sono tanti gruppi tutti uguali? Quale operazione conta in fretta tanti gruppi uguali?',
      };
    },
  },
  {
    id: 'gru-tende',
    category: 'gruppi-uguali',
    minLevel: 2,
    theme: 'storia',
    make(rng, level) {
      const n = randInt(rng, 2, factorMax(level));
      return {
        segments: seg(
          'Nell’accampamento romano ogni tenda ospita ', N('b', 8), ' legionari. Le tende sono ', N('n', n), '. ',
          ...maybeDistractor(rng, level),
          Q('Quanti legionari dormono nell’accampamento?'),
        ),
        questionChoices: ['Quanti legionari in tutto', 'Quanti legionari in una tenda', 'Quante tende ci sono'],
        steps: [step('×', n, 'n', 8, 'b')],
        unit: 'legionari',
        bars: [{ kind: 'gruppi', groups: n, each: 8, unit: 'legionari' }],
        opHint: 'Ogni tenda ha lo stesso numero di legionari: sono gruppi uguali?',
      };
    },
  },
  {
    id: 'gru-pacchetti',
    category: 'gruppi-uguali',
    minLevel: 2,
    theme: 'quotidiano',
    make(rng, level) {
      const n = randInt(rng, 2, factorMax(level));
      const b = randInt(rng, 3, factorMax(level) + 2);
      const [p] = twoNames(rng);
      return {
        segments: seg(
          `${p} compra `, N('n', n), ' bustine di carte. In ogni bustina ci sono ', N('b', b), ' carte. ',
          ...maybeDistractor(rng, level),
          Q('Quante carte nuove ha in tutto?'),
        ),
        questionChoices: ['Quante carte in tutto', 'Quante carte in una bustina', 'Quante bustine compra'],
        steps: [step('×', n, 'n', b, 'b')],
        unit: 'carte',
        bars: [{ kind: 'gruppi', groups: n, each: b, unit: 'carte' }],
        opHint: 'Ogni bustina ha lo stesso numero di carte: sono gruppi uguali?',
      };
    },
  },
  {
    id: 'gru-museo',
    category: 'gruppi-uguali',
    minLevel: 5,
    theme: 'quotidiano',
    make(rng, level) {
      const n = randInt(rng, 3, 6);
      const b = randInt(rng, 4, 15);
      return {
        segments: seg(
          'Il biglietto per il museo archeologico costa ', N('b', b), ' euro a persona. Entra una famiglia di ', N('n', n), ' persone. ',
          ...maybeDistractor(rng, level),
          Q('Quanti euro spende la famiglia?'),
        ),
        questionChoices: ['Quanto spende tutta la famiglia', 'Quanto costa un biglietto', 'Quante persone ci sono'],
        steps: [step('×', n, 'n', b, 'b')],
        unit: 'euro',
        bars: [{ kind: 'gruppi', groups: n, each: b, unit: 'euro' }],
        opHint: 'Ogni persona paga lo stesso prezzo: sono gruppi uguali?',
      };
    },
  },

  // ---------------------------------------------------------------- RIPARTIZIONE
  {
    id: 'rip-monete',
    category: 'ripartizione',
    minLevel: 2,
    theme: 'storia',
    make(rng, level) {
      const n = randInt(rng, 2, factorMax(level));
      const each = randInt(rng, 2, factorMax(level) + (level >= 4 ? 5 : 0));
      const a = n * each;
      return {
        segments: seg(
          'Un mercante fenicio divide ', N('a', a), ' monete in parti uguali tra i suoi ', N('n', n), ' figli. ',
          ...maybeDistractor(rng, level),
          Q('Quante monete riceve ogni figlio?'),
        ),
        questionChoices: ['Quante monete riceve un figlio', 'Quante monete ci sono in tutto', 'Quanti figli ha il mercante'],
        steps: [step(':', a, 'a', n, 'n')],
        unit: 'monete',
        bars: [{ kind: 'ripartizione', whole: a, parts: n, unit: 'monete' }],
        opHint: 'Le monete vengono divise in parti uguali?',
      };
    },
  },
  {
    id: 'rip-matite',
    category: 'ripartizione',
    minLevel: 2,
    theme: 'quotidiano',
    make(rng, level) {
      const n = randInt(rng, 2, factorMax(level));
      const each = randInt(rng, 2, factorMax(level) + 2);
      const a = n * each;
      return {
        segments: seg(
          'La maestra mette ', N('a', a), ' matite in ', N('n', n), ' barattoli, in parti uguali. ',
          ...maybeDistractor(rng, level),
          Q('Quante matite ci sono in ogni barattolo?'),
        ),
        questionChoices: ['Quante matite in un barattolo', 'Quante matite in tutto', 'Quanti barattoli ci sono'],
        steps: [step(':', a, 'a', n, 'n')],
        unit: 'matite',
        bars: [{ kind: 'ripartizione', whole: a, parts: n, unit: 'matite' }],
        opHint: 'Le matite vengono divise in parti uguali tra i barattoli?',
      };
    },
  },

  // ---------------------------------------------------------------- CONTENENZA
  {
    id: 'cnt-olio',
    category: 'contenenza',
    minLevel: 3,
    theme: 'storia',
    make(rng, level) {
      const b = randInt(rng, 2, factorMax(level));
      const k = randInt(rng, 2, factorMax(level));
      const a = b * k;
      return {
        segments: seg(
          'Un vasaio greco ha ', N('a', a), ' litri di olio. Ogni anfora contiene ', N('b', b), ' litri. ',
          ...maybeDistractor(rng, level),
          Q('Quante anfore riesce a riempire?'),
        ),
        questionChoices: ['Quante anfore riempie', 'Quanti litri ci sono in un’anfora', 'Quanti litri di olio ha'],
        steps: [step(':', a, 'a', b, 'b')],
        unit: 'anfore',
        bars: [{ kind: 'contenenza', whole: a, each: b, unit: 'litri' }],
        opHint: 'Quante volte i litri di un’anfora stanno nei litri di olio che ha?',
      };
    },
  },
  {
    id: 'cnt-barche',
    category: 'contenenza',
    minLevel: 3,
    theme: 'quotidiano',
    make(rng, level) {
      const b = randInt(rng, 2, Math.min(6, factorMax(level)));
      const k = randInt(rng, 2, factorMax(level));
      const a = b * k;
      return {
        segments: seg(
          'In gita al lago ci sono ', N('a', a), ' bambini. Su ogni barca salgono ', N('b', b), ' bambini. ',
          ...maybeDistractor(rng, level),
          Q('Quante barche servono?'),
        ),
        questionChoices: ['Quante barche servono', 'Quanti bambini su una barca', 'Quanti bambini ci sono'],
        steps: [step(':', a, 'a', b, 'b')],
        unit: 'barche',
        bars: [{ kind: 'contenenza', whole: a, each: b, unit: 'bambini' }],
        opHint: 'Quanti gruppi da tanti bambini si possono fare con tutti i bambini?',
      };
    },
  },

  // ---------------------------------------------------------------- FRAZIONI DI UNA QUANTITÀ
  {
    id: 'fra-anfore',
    category: 'frazioni',
    minLevel: 4,
    theme: 'storia',
    make(rng, level) {
      const [den, word] = pick(rng, [
        [2, 'La metà'],
        [3, 'Un terzo'],
        [4, 'Un quarto'],
        [5, 'Un quinto'],
      ] as const);
      const a = den * randInt(rng, 2, level >= 5 ? 20 : 10);
      return {
        segments: seg(
          'Nel magazzino del palazzo di Cnosso ci sono ', N('a', a), ' orci. ',
          { n: den, id: 'f', important: true, word },
          ' degli orci contiene grano. ',
          ...maybeDistractor(rng, level),
          Q('Quanti orci contengono grano?'),
        ),
        questionChoices: ['Quanti orci contengono grano', 'Quanti orci ci sono in tutto', 'Quanti orci sono vuoti'],
        steps: [step(':', a, 'a', den, 'f')],
        unit: 'orci',
        bars: [{ kind: 'frazione', whole: a, parts: den, unit: 'orci' }],
        opHint: `${word} vuol dire dividere tutti gli orci in ${den} parti uguali e prenderne una.`,
      };
    },
  },

  // ---------------------------------------------------------------- DUE PASSAGGI
  {
    id: 'due-grano',
    category: 'due-passaggi',
    minLevel: 4,
    theme: 'storia',
    make(rng, level) {
      const n = randInt(rng, 2, 6);
      const b = randInt(rng, 5, level >= 5 ? 25 : 10);
      const c = randInt(rng, 2, n * b - 2);
      const tot = n * b;
      return {
        segments: seg(
          'Un contadino egizio raccoglie ', N('n', n), ' sacchi di grano da ', N('b', b), ' chili l’uno. Ne dà ', N('c', c),
          ' chili al faraone. ',
          ...maybeDistractor(rng, level),
          Q('Quanti chili di grano gli restano?'),
        ),
        questionChoices: ['Quanti chili gli restano', 'Quanti chili ha raccolto', 'Quanti chili dà al faraone'],
        steps: [
          step('×', n, 'n', b, 'b', 'Prima: quanti chili ha raccolto in tutto?'),
          step('-', tot, 'prev', c, 'c', 'Poi: quanti chili gli restano?'),
        ],
        unit: 'chili',
        bars: [
          { kind: 'gruppi', groups: n, each: b, unit: 'chili' },
          { kind: 'togli', whole: tot, part: c, unit: 'chili' },
        ],
        opHint: 'Prima trova quanti chili ha in tutto, poi pensa a quelli che dà via.',
      };
    },
  },
  {
    id: 'due-carte',
    category: 'due-passaggi',
    minLevel: 4,
    theme: 'quotidiano',
    make(rng, level) {
      const a = randInt(rng, 10, level >= 5 ? 80 : 40);
      const n = randInt(rng, 2, 5);
      const b = randInt(rng, 3, 8);
      const [p] = twoNames(rng);
      return {
        segments: seg(
          `${p} ha `, N('a', a), ' carte. Compra ', N('n', n), ' bustine da ', N('b', b), ' carte ciascuna. ',
          ...maybeDistractor(rng, level),
          Q(`Quante carte ha ora ${p}?`),
        ),
        questionChoices: [`Quante carte ha ora, in tutto`, 'Quante carte ci sono nelle bustine', 'Quante bustine compra'],
        steps: [
          step('×', n, 'n', b, 'b', 'Prima: quante carte nuove ci sono nelle bustine?'),
          step('+', a, 'a', n * b, 'prev', 'Poi: quante carte ha in tutto?'),
        ],
        unit: 'carte',
        bars: [
          { kind: 'gruppi', groups: n, each: b, unit: 'carte' },
          { kind: 'parti', a, b: n * b, unit: 'carte' },
        ],
        opHint: 'Prima trova quante carte nuove arrivano dalle bustine, poi mettile insieme a quelle che aveva.',
      };
    },
  },
  {
    id: 'due-caramelle',
    category: 'due-passaggi',
    minLevel: 4,
    theme: 'quotidiano',
    make(rng) {
      const k = randInt(rng, 3, 5);
      const each = randInt(rng, 3, 8);
      const total = k * each;
      const a = randInt(rng, 2, total - 2);
      const b = total - a;
      const [p, q] = twoNames(rng);
      return {
        segments: seg(
          `${p} ha `, N('a', a), ` caramelle e ${q} ne ha `, N('b', b), '. Le mettono insieme e le dividono in parti uguali tra ',
          N('k', k), ' amici. ',
          Q('Quante caramelle riceve ogni amico?'),
        ),
        questionChoices: ['Quante caramelle riceve un amico', 'Quante caramelle hanno insieme', 'Quanti amici ci sono'],
        steps: [
          step('+', a, 'a', b, 'b', 'Prima: quante caramelle ci sono in tutto?'),
          step(':', total, 'prev', k, 'k', 'Poi: quante ne riceve ogni amico?'),
        ],
        unit: 'caramelle',
        bars: [
          { kind: 'parti', a, b, unit: 'caramelle' },
          { kind: 'ripartizione', whole: total, parts: k, unit: 'caramelle' },
        ],
        opHint: 'Prima mettile tutte insieme, poi dividile in parti uguali.',
      };
    },
  },
];

/** Categorie disponibili per livello. */
export function templatesFor(level: number): Template[] {
  return TEMPLATES.filter((t) => t.minLevel <= level);
}

export function generateProblem(rng: Rng, level: number, avoid?: ProblemCategory, templateId?: string): ProblemData {
  const pool = templateId
    ? TEMPLATES.filter((t) => t.id === templateId)
    : templatesFor(level).filter((t) => t.category !== avoid);
  // al livello più alto disponibile si preferiscono le categorie nuove, senza dimenticare le altre
  const fresh = pool.filter((t) => t.minLevel === level);
  const t = fresh.length && rng() < 0.5 ? pick(rng, fresh) : pick(rng, pool.length ? pool : TEMPLATES.slice(0, 2));
  const body = t.make(rng, level);
  return { templateId: t.id, category: t.category, level, theme: t.theme, ...body };
}
