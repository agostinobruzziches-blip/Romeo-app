# Prenotazioni – Dott.ssa Federica Spadazzi

Pagina web con cui i pazienti prenotano una visita medico-legale solo negli orari in cui la dottoressa è libera.

> Il progetto vive temporaneamente in questa cartella della repo `Romeo-app`, che contiene un'altra app.
> Va spostato in una repo dedicata appena la demo è approvata.

## Stato

| Fase | Contenuto | Stato |
|---|---|---|
| 0 | **Demo navigabile** (`demo/`): dati finti, nessun backend, serve a raccogliere il feedback di Federica | ✅ |
| 1 | MVP: backend Google Apps Script nel suo account + pagina statica su Cloudflare Pages | da fare dopo il feedback |

## La demo

`demo/` è una PWA statica senza build: `index.html` (tutto incluso: stile, configurazione, logica), `manifest.webmanifest`, `sw.js`, `icon.svg`.

Quattro sezioni, raggiungibili dalla barra gialla in alto:

- **Come funziona** (`#presentazione`): spiegazione, vantaggi, istruzioni per provarla e le domande aperte per Federica. Il pulsante "Copia le risposte" prepara un testo da mandare su WhatsApp o per mail.
- **Prenota** (`#prenota`): il percorso vero in 6 passaggi (sede, tipo di visita, giorno e ora, dati, documenti, riepilogo).
  - **Documenti:** tutti facoltativi; documento d'identità, tessera sanitaria e documentazione clinica sono segnati come consigliati, il verbale dei vigili compare solo per gli incidenti. Si accettano PDF, JPG e PNG, anche foto fatte col telefono. Su Drive i file arrivano con il tipo di documento davanti al nome, pronti per la lavorazione automatica. Le voci stanno in `CONFIG.documenti`.
  - **Fondo spese:** non compare più nella scelta del tipo di visita. Nel riepilogo c'è una casella obbligatoria "Sono a conoscenza che il fondo spese… è di X €", con l'importo calcolato dalla pratica (o la frase di esenzione). Il momento della spunta viene registrato come il consenso privacy.
  Si possono fare più prenotazioni. Gli slot sono calcolati con la stessa logica prevista per il sistema reale: finestre di disponibilità, slot da 30 minuti, impegni sottratti (anche le altre prenotazioni della demo), limite delle 18:00 del giorno prima.
- **Cambia o disdici** (`#gestisci`): la pagina che il paziente apre dal link nella mail. Permette di spostare la visita su un altro orario libero o di disdirla, fino alle 18:00 del giorno prima; dopo quell'ora indica come contattare lo studio.
- **Lato dottoressa** (`#dottoressa`): elenco delle prenotazioni. Per ognuna:
  - stato e storico di cosa è successo;
  - azioni: conferma, rifiuta, sposta, annulla;
  - notifiche, mail a lei, evento in calendario, mail al paziente (con quelle già inviate), promemoria, cartella Drive.

  Si può passare da conferma manuale ad automatica, e un pulsante riporta la demo all'inizio.

Le prenotazioni della demo restano nel `localStorage` del browser (chiave `spadazzi-demo-v4`), così Federica può interrompere e riprendere le prove. Nel sistema vero ogni prenotazione è un evento di Google Calendar con i dati nei tag privati, più una riga nel Foglio "Registro".

Nessun dato esce dal browser: i PDF scelti non vengono caricati, si legge solo il nome del file.

### Provarla in locale

```bash
cd prenotazioni-spadazzi/demo && python3 -m http.server 8080
# poi apri http://localhost:8080
```

### Pubblicarla su Cloudflare Pages (`*.pages.dev`)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → scegli questa repo.
2. Production branch: il branch della demo. Framework preset: **None**. Build command: vuoto. Build output directory: `prenotazioni-spadazzi/demo`.
3. Nome progetto, per esempio `prenota-spadazzi` → l'indirizzo sarà `https://prenota-spadazzi.pages.dev`.

In alternativa, senza collegare la repo: `npx wrangler pages deploy prenotazioni-spadazzi/demo --project-name prenota-spadazzi`.

## Architettura prevista per l'MVP (dopo il feedback)

- **Pagina statica** su Cloudflare Pages: nessun dato dei pazienti.
- **Backend Google Apps Script** nell'account `studiofedericaspadazzi@gmail.com`. Federica accede con le sue credenziali e autorizza lo script una volta sola; Agostino ha accesso da editor al progetto e non ha bisogno della password. Gestisce:
  - calcolo degli slot con freebusy su tutti i calendari (anche quelli di altri account, condivisi con lei come libero/occupato) e blocchi "Disponibile Roma";
  - evento in calendario, mail da Gmail, PDF su Drive;
  - registro del consenso su un Foglio Google;
  - trigger per promemoria e scadenze.
- **Calendari**: "Studio Fiano" (condiviso con la segretaria), "Studio Roma", "Disponibile Roma", il principale non condiviso.
- **Notifiche a Federica**: mail (app Gmail) e, se lo vuole, notifica push dedicata della PWA su Android.

### Decisioni già prese (risposte di Federica del 15/11)

- **Conferma:** manuale, una per una. Anche ogni cambio data chiesto dal paziente va riconfermato. Se lei rifiuta il cambio, resta valido l'appuntamento di prima (da confermare con lei). Durante il cambio restano bloccati sia l'orario vecchio sia quello nuovo.
- **Limiti:** prenotare entro le 18:00 del giorno prima; cambiare o disdire fino a 48 ore prima. Dopo, la pagina indica come contattare lo studio.
- **Notifiche:** sia mail sia notifica sul telefono.
- **Visite fuori studio:** prenotabili dal link con almeno 7 giorni di anticipo, nei blocchi del calendario "Disponibile fuori studio". Il paziente indica indirizzo e comune.
- **Tipi di visita:** invalidità civile e Legge 104 unite in una sola voce. INAIL comprende anche la malattia professionale. Tolta la voce "accompagnamento", da rivedere.
- **Chi ha indicato la dottoressa:** CAF, un medico (nome facoltativo), un avvocato (nome e se paga direttamente), altro (campo obbligatorio). Tolta "agenzia".
- **Documenti:** tutti facoltativi; i tre principali sono segnati come consigliati. La mail al paziente elenca quelli da portare perché non allegati.
- **Durata:** 30 minuti, ora indicata anche nel riepilogo e nelle mail.
- **Cartelle Drive:** `COGNOME Nome - tipo di visita`.
- **Logo:** caduceo vettoriale estratto dal biglietto da visita (Canva), usato nella testata e nell'icona.
- Prezzi e testi in un file di configurazione, gestito da Agostino. Allegati: al massimo 5 file da 10 MB per voce, in PDF, JPG o PNG. Si prenota fino a 60 giorni in avanti. Niente dominio per ora: si usa `pages.dev`.

### Da decidere con Federica (sono anche nella demo, in "Come funziona")

- Invalidità con richiesta di accompagnamento: come gestirla.
- Fondo spese per invalidità civile e Legge 104 (oggi 50 €, provvisorio).
- Responsabilità medica (500 €): non citata nella sua risposta, da confermare.
- Altre voci mancanti nell'elenco delle visite.
- Alternativa per chi non riesce a prenotare dal link: nella demo c'è una proposta al primo passo.
- Numero WhatsApp solo messaggi per Roma.
- Visite fuori studio: zone servite, giorni, fondo spese o costo dello spostamento.
- Cosa succede se rifiuta un cambio data.
- Nome cartelle Drive: proposta di aggiungere anno e mese.
