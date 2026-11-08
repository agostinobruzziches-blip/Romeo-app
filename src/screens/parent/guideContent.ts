/**
 * Guida per genitori e tutor. Testo semplice con **grassetto**; {nome} e {aiuto} vengono sostituiti
 * con il nome del bambino e con chi aiuta (impostazioni).
 */
export type GuideBlock = string | { list: string[] } | { tip: string };
export interface GuideSection {
  id: string;
  title: string;
  blocks: GuideBlock[];
}

export const GUIDE: GuideSection[] = [
  {
    id: 'breve',
    title: 'In breve',
    blocks: [
      'Il Viaggio nel Tempo è una **missione di matematica al giorno**, di 8–10 minuti, sempre con la stessa forma: inizio → esercizi → riepilogo → premio → «Missione completata, a domani!».',
      'È pensato per ridurre ansia e distrazioni: **una domanda per schermata**, nessun timer visibile, niente movimento durante gli esercizi, errori trattati con gentilezza e mai punti tolti.',
      'Ogni giorno ci sono le **tabelline** più **un argomento a rotazione** tra quelli accesi (problemi, misure, geometria). Ogni argomento nuovo parte con una breve lezione **«Scopri»**.',
      { tip: 'Il motto è «prova, prova, prova»: chi sbaglia e poi arriva alla risposta giusta vince la **medaglia della tenacia**, che vale come una risposta giusta al primo colpo.' },
    ],
  },
  {
    id: 'inizio',
    title: 'Prima di iniziare (5 minuti)',
    blocks: [
      {
        list: [
          '**Installa l’app** sulla schermata Home (Area genitori → App): si apre a schermo intero e funziona anche senza internet.',
          'In **Impostazioni** scrivi il nome, scegli chi aiuta («papà/mamma») e la **durata della missione** (consigliati 8–10 minuti).',
          'Accendi gli **argomenti** che fa a scuola e scegli il **livello di partenza** di ognuno. Nel dubbio parti basso: i livelli salgono da soli.',
          'Nelle **tabelline** puoi far partire da una tappa più avanti quelle che sa già bene (per esempio il 2, il 10 e il 5).',
          'Scegli l’**epoca di partenza** delle carte (per esempio quella che studia adesso in storia).',
          'Fai un primo **backup** (Area genitori → Backup) e ripetilo ogni tanto.',
        ],
      },
    ],
  },
  {
    id: 'missione',
    title: 'Com’è fatta la missione',
    blocks: [
      '**Il numero di esercizi è deciso all’inizio** e la barra in alto conta gli esercizi, non il tempo: {nome} vede sempre quanto manca, senza fretta.',
      'Ordine fisso: 3 tabelline facili per partire bene → la tappa su cui sta lavorando → il ripasso → l’argomento del giorno → una tabellina facile per chiudere. Si finisce sempre con una risposta giusta.',
      'Durante la missione **non c’è un pulsante per uscire**: è voluto, per non mollare al primo errore. Se serve fermarsi, si usa «Chiedi a {aiuto}» → «Fermiamoci qui» (la missione vale come completata).',
      'Una **seconda missione** nello stesso giorno si sblocca solo con il PIN del genitore: di solito una al giorno basta.',
    ],
  },
  {
    id: 'errori',
    title: 'Errori e aiuti',
    blocks: [
      'Se sbaglia compare «**Quasi! Riproviamo**», senza suoni negativi. Dopo 3 risposte sbagliate l’app mostra con calma la soluzione e propone di nuovo quell’esercizio più avanti.',
      '**«Aiutami»** dà due livelli di aiuto, senza mai dire il risultato:',
      {
        list: [
          '**Tabelline**: prima il fatto vicino (7 × 8 = 7 × 7 + 7), poi la griglia di pallini.',
          '**Problemi**: un suggerimento sul passo in cui si trova, poi il disegno a barre del problema.',
          '**Misure e geometria**: un suggerimento sul passo, poi la lezione «Scopri» da rivedere.',
        ],
      },
      'Usare l’aiuto non toglie nulla. Conta solo per l’app: quel fatto o quel livello avanza un po’ più piano.',
    ],
  },
  {
    id: 'chiedi',
    title: '«Chiedi a {aiuto}»: come aiutarlo',
    blocks: [
      'Il pulsante mette in pausa la missione e ti mostra un **suggerimento adatto a quell’esercizio e a quel passo**. Qualche regola generale:',
      {
        list: [
          '**Non dire il risultato né l’operazione.** Fai domande: «Cosa chiede il problema?», «Si aggiunge o si toglie?», «È più grande un metro o un centimetro?».',
          '**Fagli raccontare** il problema con parole sue, senza numeri.',
          '**Usate le mani**: un foglio a quadretti, le dita per contare di 7 in 7, un righello o un metro da sarta per le misure.',
          '**Lodate il tentativo**, non solo il risultato: «Hai riprovato, bravo!».',
          'Se lo vedi stanco, **fermarsi va benissimo**: «Fermiamoci qui» vale come missione completata.',
        ],
      },
    ],
  },
  {
    id: 'stanchezza',
    title: 'Stanchezza',
    blocks: [
      'L’app osserva in silenzio tre segnali: **3 errori nelle ultime 5 risposte**, **2 risposte sbagliate e velocissime** di fila (quando risponde a caso), **tempi raddoppiati** rispetto all’inizio.',
      'Se ne vede uno, Glauco propone: «Hai lavorato tanto! Vuoi fermarti qui? La stella te la sei già guadagnata». A quel punto {nome} sceglie tra «Mi fermo qui» e «Ancora un po’» (al massimo 3 esercizi facili).',
      'Nell’**Andamento** trovi i segnali di ogni missione: se si ripetono spesso, prova una missione più corta o un altro momento della giornata.',
    ],
  },
  {
    id: 'argomenti',
    title: 'Gli argomenti',
    blocks: [
      '**Tabelline.** Ogni fatto (7 × 8 vale anche per 8 × 7) ha un livello da 0 a 5 e torna dopo 1, 2, 4, 7, 14 giorni se è giusto. Ogni tabellina ha 4 tappe: in ordine → mescolata → con un’altra tabellina → mix generale. Si passa alla tappa dopo **già in una missione** con l’85% di risposte giuste al primo colpo; con il 95% si **saltano due tappe**. Chi sa già una tabellina la conquista in circa 2 missioni. Nel ripasso compaiono anche domande della tabellina successiva, per non vedere sempre la stessa.',
      '**Problemi.** Sempre 5 passi, uno alla volta: leggi (anche ad alta voce), tocca i numeri importanti, cosa chiede la domanda, quale operazione, scrivi e calcola. Se sbaglia l’operazione non riceve la soluzione: vede il **disegno a barre** e riprova. Servono a rallentarlo, perché quando va di fretta sceglie le operazioni a caso.',
      '**Misure (equivalenze).** Tabella delle unità come sul quaderno. Prima ragiona: l’unità diventa più grande o più piccola? Allora il numero? × 10, × 100 o : 100? Solo alla fine scrive il risultato.',
      '**Geometria (perimetro e area).** Prima: misuro il contorno o la superficie? Poi la formula, poi l’unità (cm o cm²), infine il calcolo. Ai primi livelli conta sui quadretti, toccandoli.',
      '**Lezioni «Scopri».** Brevi, interattive, una pagina per idea: ogni pagina si sblocca facendo qualcosa (spostare, contare, rispondere). Compaiono una volta, quando un concetto è nuovo.',
      'I **livelli** di problemi, misure e geometria salgono da soli **dopo una missione** con almeno l’80% di esercizi senza errori di ragionamento (oppure dopo 2 missioni discrete), e **non scendono mai**. Puoi cambiarli in Impostazioni.',
    ],
  },
  {
    id: 'premi',
    title: 'Stelle, medaglie e carte',
    blocks: [
      {
        list: [
          '**1 stella** per ogni missione completata (anche se fermata per stanchezza) e **1 stella** quando migliora: un fatto che diventa sicuro, una tappa o un livello superati. Mai per la velocità.',
          '**Medaglia della tenacia** quando, dopo un errore, arriva alla risposta giusta.',
          '**Una carta storica ogni 3 stelle**; le **carte rare** arrivano con i traguardi (tabellina conquistata, medaglie, giorni di esplorazione). Ogni carta ha una curiosità vera, con la fonte per verificarla.',
          '**Giorni di esplorazione**: fino a 2 giorni saltati di fila non interrompono la serie e non compare mai «serie persa».',
        ],
      },
    ],
  },
  {
    id: 'dati',
    title: 'Leggere i dati',
    blocks: [
      '**Mappa delle tabelline**: grigio = mai visto, rosso = da allenare, giallo = in crescita, verde = sicuro. Tocca una casella per i dettagli.',
      'Gli errori sono divisi per tipo, perché chiedono aiuti diversi:',
      {
        list: [
          '**Operazione sbagliata** (problemi): non ha capito la situazione → disegnatela, raccontatela con parole sue.',
          '**Dati o domanda**: ha preso i numeri sbagliati o non ha capito cosa si chiede → fategli leggere ad alta voce l’ultima frase e sottolineare i numeri che servono.',
          '**Concetto** (misure e geometria): non è chiaro che con un’unità più piccola il numero cresce, o confonde perimetro e area → righello, metro, foglio a quadretti.',
          '**Unità**: scrive cm invece di cm² → ricordategli che l’area si conta in quadretti.',
          '**Calcolo**: ha capito cosa fare e ha sbagliato il conto → è l’errore meno grave; basta ricontrollare insieme.',
        ],
      },
    ],
  },
  {
    id: 'tutor',
    title: 'Per chi lo segue nello studio',
    blocks: [
      'In **«Per la tutor»** c’è un riepilogo in testo semplice (7, 14 o 30 giorni) da mandare con «Condividi»: missioni, risposte giuste, medaglie, livelli, errori per tipo, segnali di stanchezza.',
      'Un buon uso nei pomeriggi di studio: partire dagli **errori di ragionamento** della settimana (operazione, concetto) e lavorarci con materiale concreto. Gli errori di calcolo si sistemano con la pratica.',
      'L’app non sostituisce il lavoro sul quaderno: lo prepara. Se a scuola usano parole o simboli diversi da quelli dell’app, segnalatelo.',
    ],
  },
  {
    id: 'telefono',
    title: 'Dati, backup e telefoni',
    blocks: [
      'Tutto resta **sul telefono**: nessun account, nessun server, nessuna pubblicità. Ogni telefono (e anche il browser rispetto all’app installata) ha i suoi dati.',
      'Per passare da un telefono all’altro: **Backup → Esporta** sul primo, **Importa** sul secondo. Fate un backup ogni tanto: cancellare i dati del browser cancella anche i progressi.',
      'Gli **aggiornamenti** arrivano da soli quando c’è internet e si applicano solo dalla schermata iniziale, mai durante una missione.',
    ],
  },
  {
    id: 'faq',
    title: 'Domande frequenti',
    blocks: [
      '**Vuole rifare la missione.** Puoi sbloccarne un’altra con il PIN, ma una al giorno di solito basta: meglio poco e ogni giorno.',
      '**Va troppo veloce e risponde a caso.** È proprio il segnale che l’app cerca: proporrà di fermarsi. Nei problemi i passi obbligatori servono a rallentarlo.',
      '**Si arrabbia quando sbaglia.** Ricordategli la medaglia della tenacia: riprovare vale quanto indovinare subito.',
      '**Gli argomenti sono troppo facili o troppo difficili.** Cambia il livello in Impostazioni; per le tabelline puoi cambiare la tappa di ogni tabellina.',
      '**Ho dimenticato il PIN.** Si può solo azzerare l’app dal browser (cancellando i dati del sito): per questo serve un backup recente.',
    ],
  },
];

export function fillGuide(text: string, name: string, helper: string): string {
  return text.replace(/\{nome\}/g, name).replace(/\{aiuto\}/g, helper);
}

/** Versione in testo semplice da condividere. */
export function guideAsText(name: string, helper: string): string {
  const out: string[] = ['Viaggio nel Tempo – Guida per genitori e tutor', ''];
  for (const s of GUIDE) {
    out.push(fillGuide(s.title, name, helper).toUpperCase());
    for (const b of s.blocks) {
      if (typeof b === 'string') out.push(fillGuide(b, name, helper));
      else if ('list' in b) for (const li of b.list) out.push(`• ${fillGuide(li, name, helper)}`);
      else out.push(`★ ${fillGuide(b.tip, name, helper)}`);
    }
    out.push('');
  }
  return out.join('\n').replace(/\*\*/g, '');
}
