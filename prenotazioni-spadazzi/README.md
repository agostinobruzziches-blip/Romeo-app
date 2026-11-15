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
- **Prenota** (`#prenota`): il percorso vero in 5 passaggi. Si possono fare più prenotazioni. Gli slot sono calcolati con la stessa logica prevista per il sistema reale: finestre di disponibilità, slot da 30 minuti, impegni sottratti (anche le altre prenotazioni della demo), limite delle 18:00 del giorno prima.
- **Cambia o disdici** (`#gestisci`): la pagina che il paziente apre dal link nella mail. Permette di spostare la visita su un altro orario libero o di disdirla, fino alle 18:00 del giorno prima; dopo quell'ora indica come contattare lo studio.
- **Lato dottoressa** (`#dottoressa`): elenco delle prenotazioni. Per ognuna:
  - stato e storico di cosa è successo;
  - azioni: conferma, rifiuta, sposta, annulla;
  - notifiche, mail a lei, evento in calendario, mail al paziente (con quelle già inviate), promemoria, cartella Drive.

  Si può passare da conferma manuale ad automatica, e un pulsante riporta la demo all'inizio.

Le prenotazioni della demo restano nel `localStorage` del browser (chiave `spadazzi-demo-v2`), così Federica può interrompere e riprendere le prove. Nel sistema vero ogni prenotazione è un evento di Google Calendar con i dati nei tag privati, più una riga nel Foglio "Registro".

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

### Decisioni già prese

- Limite per prenotare, cambiare data e disdire: 18:00 del giorno prima. Si prenota fino a 60 giorni in avanti.
- Prezzi e testi in un file di configurazione, gestito da Agostino.
- Allegati: al massimo 5 PDF da 10 MB.
- Niente dominio per ora: si usa `pages.dev`.

### Da chiedere a Federica (sono anche nella demo)

- Conferma manuale o automatica.
- Se il paziente cambia data: resta confermata o va riconfermata (oppure niente cambio, solo disdetta).
- Elenco dei medici dello studio di Fiano.
- Convenzione dei nomi delle cartelle su Drive.
- Visite fuori studio prenotabili dal link.
- WhatsApp solo messaggi per Roma.
