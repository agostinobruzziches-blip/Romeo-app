# Romeo e il Viaggio nel Tempo — Progetto (Fase 1)

Documento di proposta: struttura del progetto, modello dati e regole di funzionamento.
Nessun codice applicativo è ancora scritto: si parte dopo la conferma.

---

## 1. Scelte tecniche

| Area | Scelta | Perché |
|---|---|---|
| Build | Vite + React 18 + TypeScript (strict) | come richiesto |
| Stile | Tailwind CSS, palette per epoca come token | coerenza visiva, facile da tematizzare |
| Dati | Dexie (IndexedDB) | tutto in locale, nessun account |
| Navigazione | `HashRouter` | funziona su GitHub Pages senza configurazioni |
| Flusso missione | macchina a stati esplicita (`useReducer`) | stessa sequenza sempre, nessuno stato "a sorpresa" |
| Font | **Atkinson Hyperlegible** incluso nel pacchetto (licenza OFL, via `@fontsource`) | progettato per la massima leggibilità, niente download da Google |
| Suoni | generati con Web Audio API (nessun file audio), volume 20% di default | leggeri, offline, disattivabili |
| Voce | Web Speech API `it-IT`, solo su richiesta | opzionale, mai automatica |
| Illustrazioni | componenti React che restituiscono SVG inline | nessuna immagine esterna, nitide su ogni schermo |
| Test | Vitest per il "motore" (Leitner, generatori, stanchezza, premi) | la logica pedagogica deve essere verificabile |
| PWA | `vite-plugin-pwa` (Workbox, precache totale) | installabile e offline (Fase 5) |

Vincoli rispettati ovunque: nessun link esterno, nessun tracciamento, nessuna richiesta di rete dopo il primo caricamento.

---

## 2. Struttura delle cartelle

```
romeo-app/
├─ index.html
├─ vite.config.ts            # base path per GitHub Pages, plugin PWA
├─ tailwind.config.ts        # palette epoche, dimensioni minime touch (48px)
├─ public/                   # icone PWA (generate da SVG)
├─ docs/PROGETTO.md          # questo documento
└─ src/
   ├─ main.tsx, App.tsx      # router, provider dati e impostazioni
   ├─ core/                  # LOGICA PURA, senza React, tutta testata
   │  ├─ module.ts           # interfaccia comune dei moduli (vedi §4)
   │  ├─ mission/            # composizione missione, macchina a stati
   │  ├─ fatigue.ts          # rilevamento stanchezza
   │  ├─ rewards.ts          # stelle, medaglie della tenacia, serie giorni
   │  ├─ streak.ts
   │  └─ random.ts           # generatore casuale con seme (riproducibile nei test)
   ├─ db/
   │  ├─ schema.ts           # Dexie: tabelle e versioni
   │  ├─ repo.ts             # funzioni di lettura/scrittura usate dall'app
   │  └─ backup.ts           # esporta/importa JSON con validazione
   ├─ modules/
   │  ├─ tabelline/
   │  │  ├─ index.ts         # implementa LearningModule
   │  │  ├─ leitner.ts       # livelli 0–5 e scadenze
   │  │  ├─ stages.ts        # 4 tappe per tabellina
   │  │  ├─ generator.ts     # formati: "7 × 8 = ?", "7 × ? = 56", vero/falso
   │  │  ├─ HelpDots.tsx     # griglia di pallini righe × colonne
   │  │  └─ Exercise.tsx
   │  └─ problemi/           # Fase 4
   │     ├─ templates/       # un file per categoria
   │     ├─ contexts.ts      # contesti storici e quotidiani
   │     ├─ BarModel.tsx     # modello a barre (metodo Singapore)
   │     └─ steps/           # Leggi, ToccaNumeri, Domanda, Operazione, Scrivi
   ├─ content/               # Fase 3
   │  ├─ epochs.ts           # epoche, colori, soglie di sblocco
   │  ├─ cards/              # catalogo carte per epoca (testo + curiosità + fonte)
   │  └─ art/                # illustrazioni SVG come componenti
   ├─ ui/                    # componenti condivisi
   │  ├─ BigButton.tsx, NumPad.tsx, ProgressBar.tsx
   │  ├─ Guide.tsx           # personaggio guida + fumetto
   │  └─ Celebration.tsx     # unica animazione, solo fuori dagli esercizi
   ├─ screens/
   │  ├─ Home.tsx            # "Missione del giorno" (un solo grande pulsante)
   │  ├─ Mission.tsx         # inizio → esercizi → riepilogo → premio → fine
   │  ├─ Timeline.tsx, Album.tsx         # Fase 3
   │  └─ parent/             # area genitori con PIN
   └─ i18n/testi.ts          # tutte le frasi in un unico file (tono coerente)
```

La separazione `core/` (logica pura) ↔ `modules/` ↔ `screens/` è la chiave per aggiungere frazioni, divisioni in colonna, decimali, misure e geometria senza toccare la missione.

---

## 3. Modello dati (Dexie / IndexedDB)

```ts
// Una sola riga: chi usa l'app e come è configurata
interface Settings {
  id: 'main';
  childName: string;                 // "Romeo"
  missionMinutes: number;            // default 9 (range 5–15)
  activeModules: ModuleId[];         // ['tabelline'] poi ['tabelline','problemi']
  activeTables: number[];            // es. [2,3,4,5,6,7,8,9,10]
  soundOn: boolean;                  // default true
  volume: number;                    // 0–1, default 0.2
  readAloud: boolean;                // pulsante "Leggi per me" visibile
  parentLabel: string;               // "papà/mamma" (personalizzabile)
  pinHash: string; pinSalt: string;  // PIN genitori (SHA-256, mai in chiaro)
  createdAt: number;
}

// Un "fatto" delle tabelline. 7×8 e 8×7 condividono la stessa chiave "7x8"
interface Fact {
  key: string;            // `${min}x${max}`, es. "7x8"
  a: number; b: number;   // a ≤ b
  box: 0|1|2|3|4|5;       // livello di padronanza (Leitner)
  dueDay: string;         // quando riproporlo ('YYYY-MM-DD')
  lastPromotedDay: string;// si sale di livello al massimo una volta al giorno
  everSecure: boolean;    // è già arrivato a livello 3 almeno una volta
  seen: number;
  firstTry: number;       // giuste al primo colpo
  afterRetry: number;     // giuste dopo un errore (tenacia)
  wrong: number;          // tentativi sbagliati
  helpUsed: number;
  medianMs: number;       // solo statistica
  lastSeenAt: number;
}

// Avanzamento per tabellina nelle 4 tappe
interface TableProgress {
  table: number;                      // 2..10
  stage: 1|2|3|4;                     // in ordine → mescolata → due tabelline → mix
  goodSessionsAtStage: number;        // sessioni consecutive ≥ 90%
  conqueredAt?: number;               // "Tabellina del 7 conquistata"
}

// Una missione (sessione)
interface Session {
  id: string;
  day: string;                        // 'YYYY-MM-DD' (ora locale)
  startedAt: number; endedAt?: number;
  plannedItems: number; doneItems: number;
  endReason?: 'completata' | 'stanchezza' | 'genitore' | 'interrotta';
  isRepeat: boolean;                  // seconda missione nello stesso giorno
  fatigueSignals: FatigueSignal[];    // registrati, mai mostrati come rimprovero
  firstTryCorrect: number; tenacityMedals: number;
  parentHelpCount: number;
}

// Ogni singolo tentativo (base di tutte le statistiche)
interface Attempt {
  id?: number;                        // auto-increment
  sessionId: string;
  moduleId: ModuleId;                 // 'tabelline' | 'problemi' | ...
  itemKey: string;                    // "7x8" oppure "gruppi-uguali/anfore#seed"
  format: string;                     // 'prodotto' | 'fattore-mancante' | 'vero-falso' | 'problema'
  category?: string;                  // per i problemi
  attemptNo: number;                  // 1 = primo tentativo
  correct: boolean;
  errorType?: 'calcolo' | 'operazione' | 'dati' | 'domanda';
  ms: number;                         // solo statistica, mai mostrato al bambino
  helpUsed?: 'pallini' | 'fatto-vicino' | 'barre';
  at: number;
}

// Registro dei premi (si somma, non si toglie mai nulla)
interface RewardEvent {
  id?: number;
  at: number; sessionId?: string;
  kind: 'stella' | 'medaglia-tenacia' | 'carta' | 'bonus-serie' | 'traguardo';
  reason: string;                     // "Missione completata", "7×8 conquistato"…
  ref?: string;                       // id carta o traguardo
}

// Carte possedute (il catalogo vive nel codice, qui solo lo stato)
interface OwnedCard { cardId: string; unlockedAt: number; seen: boolean; }

// Progressi dei problemi per categoria (Fase 4)
interface ProblemProgress { category: string; level: 1|2|3|4|5; goodSessions: number; }
```

Indici Dexie:
```ts
db.version(1).stores({
  settings: 'id',
  facts: 'key, box, dueDay',
  tableProgress: 'table',
  sessions: 'id, day, startedAt',
  attempts: '++id, sessionId, moduleId, itemKey, category, at',
  rewards: '++id, kind, at, sessionId, ref',
  cards: 'cardId, unlockedAt',
  problemProgress: 'category',
});
```

Il **backup JSON** è semplicemente `{ app: 'romeo', schemaVersion, exportedAt, tabelle… }`; all'importazione si valida la struttura e si chiede conferma prima di sovrascrivere.

---

## 4. Interfaccia comune dei moduli

```ts
interface LearningModule<Item, Answer> {
  id: ModuleId;
  title: string;                                    // "Tabelline"
  // 1. GENERATORE: propone gli esercizi per la missione di oggi
  plan(ctx: PlanContext, count: number): Promise<Item[]>;
  // Componente che mostra UNA richiesta per schermata
  Exercise: React.FC<ExerciseProps<Item, Answer>>;
  // 2. VALUTAZIONE: giusta/sbagliata e, se sbagliata, che tipo di errore
  evaluate(item: Item, answer: Answer): Evaluation;  // { correct, errorType? }
  help(item: Item, level: 1|2): HelpContent;         // "Aiutami"
  parentTip(item: Item): string;                     // "Chiedi a papà/mamma"
  // Aggiorna padronanza dopo l'esito definitivo dell'esercizio
  record(item: Item, outcome: ItemOutcome): Promise<void>;
  // 3. STATISTICHE: dati per l'area genitori
  stats(range: DateRange): Promise<ModuleStats>;
  ParentPanel: React.FC;                              // es. mappa 10×10
  estimatedSecondsPerItem: number;                    // per dimensionare la missione
}
```

La missione chiede a ogni modulo attivo un certo numero di esercizi, li mette in fila e non sa nulla dei dettagli: per aggiungere "Frazioni" basta scrivere un nuovo `LearningModule` e registrarlo.

---

## 5. Regole di funzionamento

### 5.1 Missione del giorno
- **Numero fisso di esercizi** calcolato all'avvio da `missionMinutes` e dal tempo medio reale di Romeo (es. 9 minuti ≈ 22–26 tabelline). La barra di avanzamento conta gli esercizi, **non il tempo**: è prevedibile e non è un timer.
- Ordine sempre uguale:
  1. **Riscaldamento**: 3 fatti già sicuri (livello 4–5) → si parte con un successo
  2. **Cuore**: la tappa attuale delle tabelline (e in Fase 4 i problemi)
  3. **Ripasso**: i fatti "scaduti" secondo Leitner
  4. **Chiusura**: 1 fatto facile → si finisce sempre con una risposta giusta
- Schermate: *Inizio* (la guida dice cosa faremo oggi) → *Esercizi* → *Riepilogo* → *Premio* → **"Missione completata, a domani!"** con un solo pulsante "Esci".
- Seconda missione nello stesso giorno: solo dopo il PIN del genitore.

### 5.2 Ripetizione spaziata (Leitner, livelli 0–5)
| Livello | Si ripropone dopo |
|---|---|
| 0 | nella stessa missione |
| 1 | 1 giorno |
| 2 | 2 giorni |
| 3 | 4 giorni |
| 4 | 7 giorni |
| 5 | 14 giorni ("conquistato") |

- Giusta al primo colpo → **+1 livello** (al massimo una volta al giorno)
- Giusta dopo un errore (tenacia) → resta al livello attuale e torna più avanti nella stessa missione
- Sbagliata e risolta con "Aiutami" → scende di 1 (mai sotto 0), torna più avanti nella stessa missione
- Il livello non si vede come voto: Romeo vede solo "fatti conquistati" che crescono.

### 5.3 Le 4 tappe di ogni tabellina
1. **In ordine** (7×1 … 7×10) — quello che già sa fare, per partire sicuro
2. **Stessa tabellina mescolata**
3. **Due tabelline mescolate** (la tabellina nuova + una già conquistata)
4. **Mix generale** di tutte le tabelline attive

Si avanza quando in **2 sessioni consecutive** la tappa ha almeno il **90% di risposte giuste al primo colpo** su almeno 10 domande. Non si torna mai indietro di tappa: se una tappa va male si resta lì.

Ordine di introduzione proposto: 2, 10, 5, 3, 4, 9, 6, 8, 7 (dalle più facili; il 7 e l'8 alla fine, ma con molti "fatti vicini" già noti).

### 5.4 Formati (una richiesta per volta)
- `7 × 8 = ?` (prevalente)
- `7 × ? = 56` (dalla tappa 2)
- Vero/falso `7 × 8 = 54` (dalla tappa 2, con risposte sbagliate "plausibili")
- Tastierino numerico grande sempre nella stessa posizione; tasto "cancella" e "OK".

### 5.5 "Aiutami"
- 1° livello: **fatto vicino** già conquistato ("7 × 8 = 7 × 7 + 7").
- 2° livello: **griglia di pallini** 7 righe × 8 colonne, raggruppati a 5 per contarli facilmente.
- Usare l'aiuto non toglie nulla: è uno strumento, non un fallimento.

### 5.6 Errori e medaglia della tenacia
- Feedback: "Quasi! Riproviamo" — nessun suono negativo, nessun colore rosso sull'intera schermata.
- Fino a **3 tentativi**, poi l'app mostra la soluzione con l'aiuto e la ripropone più tardi (sostituendo un esercizio successivo, così il totale non cambia).
- Vero/falso sbagliato: non si "tira a indovinare" l'altra risposta, si chiede direttamente il risultato.
- Durante la missione non c'è un pulsante "esci" per il bambino: si chiude dal pulsante del genitore.
- **Medaglia della tenacia**: quando dopo un errore Romeo arriva alla risposta giusta. Nel riepilogo si contano le **"conquiste"** = giuste al primo colpo + medaglie della tenacia, con la stessa grafica e lo stesso peso.
- Il motto "Prova, prova, prova!" compare quando si guadagna una medaglia.

### 5.7 Stelle, carte e serie di giorni
- **1 stella** per ogni missione completata (anche se fermata per stanchezza, vedi §5.8).
- **+1 stella** di miglioramento personale: un fatto che diventa "sicuro" (livello 3) per la prima volta, una tappa superata o una tabellina conquistata in quella missione. Mai per la velocità.
- Ogni **3 stelle** si sblocca una carta dell'epoca corrente.
- **Carte rare** per traguardi: "Tabellina del 7 conquistata", "10 medaglie della tenacia", "Prima settimana di esplorazione"…
- **Serie di giorni**: contano i giorni di esplorazione; fino a 2 giorni saltati di fila sono "giorni di riposo" e non interrompono la serie. Bonus stella a 3, 7, 14, 30 giorni. Non compare mai un messaggio di "serie persa": si mostra sempre anche il totale dei giorni.

### 5.8 Rilevamento stanchezza
Segnali calcolati sugli ultimi tentativi (mai mostrati come rimprovero):
- **3 errori nelle ultime 5 risposte**
- **2 risposte sbagliate di fila molto rapide** (sotto ~1,5 s o sotto metà del suo tempo abituale): probabile risposta a caso
- **tempi che raddoppiano** rispetto all'inizio della missione

Quando scatta: la guida dice *"Hai lavorato tanto! Vuoi fermarti qui? La stella te la sei guadagnata."* con due pulsanti: **"Mi fermo"** (riepilogo + premio pieno) e **"Ancora un po'"** (massimo 3 esercizi facili, poi fine). La missione conta come completata.

### 5.9 "Chiedi a papà/mamma"
Pulsante sempre visibile durante la missione. Mette in pausa e mostra al genitore un suggerimento specifico (e la possibilità di chiudere la missione, che vale come completata), per esempio:
> *Sta lavorando su 7 × 8. Chiedigli: "Quanto fa 7 × 7?" e poi "Se aggiungi ancora un 7?". Non dire il risultato.*

### 5.10 Area genitori (PIN a 4 cifre)
- Mappa **10 × 10** delle tabelline (rosso = livello 0–1, giallo = 2–3, verde = 4–5, grigio = mai visto)
- Andamento per settimana: conquiste, medaglie, missioni, segnali di stanchezza per sessione
- (Fase 4) Errori per categoria di problema: **operazione sbagliata / dati sbagliati / calcolo sbagliato**
- **Riepilogo condivisibile** per la tutor: testo semplice generato dall'app e condiviso con il menu "Condividi" del telefono (WhatsApp, mail…) o copiato; nessun link esterno
- Impostazioni (§3) ed **esporta/importa backup JSON**

---

## 6. Problemi (Fase 4) — anticipazione del modello

```ts
interface ProblemTemplate {
  id: string;
  category: 'aggiungere-togliere' | 'confronto' | 'gruppi-uguali'
          | 'ripartizione' | 'contenenza' | 'due-passaggi' | ...;
  level: 1|2|3|4|5;                          // numeri e passaggi crescenti
  contexts: ContextId[];                     // 'mercanti-greci', 'anfore-egizie', 'spesa', ...
  params: Record<string, { min: number; max: number; step?: number }>;
  constraint?: (p) => boolean;               // es. divisione esatta
  text: (p, ctx) => Segment[];               // testo con i numeri marcati: importanti / non importanti
  question: { correct: string; distractors: string[] };
  operation: '+' | '-' | '×' | ':';
  operands: (p) => [number, number];
  barModel: (p) => BarModelSpec;             // disegno a barre per l'aiuto
}
```
- I numeri nel testo sono "toccabili"; dal livello 3 compaiono numeri **non utili** (es. "3 navi", "il giorno 5") per allenare la scelta dei dati.
- Il passo 5 si compone toccando i numeri scelti e l'operazione, poi si scrive il risultato: così si distingue **errore di operazione**, **errore di dati** ed **errore di calcolo**.
- Operazione sbagliata → nessuna soluzione: compare il modello a barre e si riprova.
- Il pulsante "Ho letto" si attiva dopo un breve tempo proporzionale alla lunghezza del testo (senza conto alla rovescia visibile).

---

## 7. Tema e contenuti (Fase 3) — anticipazione

- **Guida proposta: Glauco, la civetta del tempo** (in greco antico *glaux* significa civetta, l'animale di Atena). Frasi brevi e gentili, sempre lo stesso tono. Alternativa: un piccolo automa di bronzo ispirato a Talos, il gigante di bronzo del mito cretese.
- **Linea del tempo**: Preistoria → Egizi → Cretesi → Greci → Romani → Medioevo. Ogni epoca si sblocca con un numero di stelle; 8 carte per epoca (6 comuni + 2 rare).
- Palette: Preistoria ocra e terra; Egizi sabbia, lapislazzuli e oro; Cretesi azzurro mare e rosso affresco; Greci bianco, blu e terracotta; Romani rosso pompeiano e oro; Medioevo verde e pergamena.
- Ogni carta: nome, illustrazione SVG originale, una curiosità vera di 1–2 frasi. Nel catalogo ogni curiosità avrà anche una nota sulla fonte, per poterla verificare. Esempi del tono:
  - *Le prime Olimpiadi di cui abbiamo notizia si svolsero a Olimpia nel 776 a.C.*
  - *La Grande Piramide di Giza è rimasta per migliaia di anni la costruzione più alta fatta dall'uomo.*

---

## 8. Fasi di lavoro
1. ✅ Struttura e modello dati (questo documento)
2. ✅ MVP: tabelline + missione del giorno + stelle + medaglia della tenacia + area genitori base
3. Linea del tempo, epoche e album carte
4. Modulo problemi
5. PWA offline e deploy

Dopo ogni fase: riepilogo e istruzioni per provarla dal telefono.
