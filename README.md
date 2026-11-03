# Viaggio nel Tempo

Web app di matematica per un bambino di quinta elementare: brevi missioni quotidiane, una domanda per schermata,
nessun timer visibile, errori trattati con gentilezza e la **medaglia della tenacia** per chi ci riprova.
Tutto in italiano, tutto sul telefono: nessun account, nessun server, nessun link esterno, nessuna pubblicità.

Il progetto completo (principi, modello dati, regole) è in [`docs/PROGETTO.md`](docs/PROGETTO.md).

## Stato

| Fase | Contenuto | Stato |
|---|---|---|
| 1 | Struttura e modello dati | ✅ |
| 2 | Tabelline, missione del giorno, stelle, medaglia della tenacia, area genitori base | ✅ |
| 3 | Linea del tempo, epoche, album delle carte | ✅ |
| 4 | Modulo problemi | ✅ |
| 5 | PWA offline e installabile | ✅ |
| + | Misure (equivalenze), geometria (perimetro e area), problemi avanzati, lezioni “Scopri” | ✅ |

## Provarla sul computer

Serve Node.js 20 o più recente.

```bash
npm install
npm run dev        # apre http://localhost:5173
npm test           # test del "motore" (Leitner, tappe, stanchezza, premi, backup)
npm run build      # versione definitiva in dist/
```

Per provarla dal telefono collegato alla stessa rete Wi‑Fi: `npm run dev -- --host` e apri dal telefono
l'indirizzo `http://<ip-del-computer>:5173` che compare nel terminale.

## Pubblicare su GitHub Pages

1. Il repository deve essere **pubblico** (con un piano gratuito).
2. Su GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Ogni modifica che arriva sul branch `main` viene verificata (test) e pubblicata dal workflow
   `.github/workflows/deploy.yml`. Si può anche lanciare a mano da **Actions → Pubblica su GitHub Pages → Run workflow**.
4. L'indirizzo sarà `https://<utente>.github.io/Romeo-app/`.

L'app usa percorsi relativi e la navigazione con `#`, quindi funziona con qualunque nome di repository.

## Installarla sul telefono

Apri l'indirizzo dell'app una volta **con internet**, poi:

- **iPhone (Safari)**: pulsante **Condividi** → **Aggiungi alla schermata Home** → **Aggiungi**.
- **Android (Chrome)**: menu **⋮** → **Installa app** (o **Aggiungi a schermata Home**).
  In **Area genitori → App** c'è anche il pulsante **Installa l'app** quando il telefono lo permette.

Da installata si apre a schermo intero, in verticale, con l'icona della civetta Glauco.

**Senza internet**: dopo la prima apertura tutti i file sono salvati sul telefono e l'app funziona anche offline
(la lettura ad alta voce dipende dalle voci installate sul telefono).

**Aggiornamenti**: quando c'è internet la nuova versione si scarica da sola e si applica solo dalla schermata iniziale,
mai durante una missione. In **Area genitori → App** si vedono la versione e lo stato (installata, offline, dati protetti).

## Dati e privacy

- Tutti i dati sono nel browser del telefono (IndexedDB). Ogni telefono ha i suoi dati:
  per spostarli usa **Area genitori → Backup → Esporta** e poi **Importa** sull'altro telefono.
- Cancellare i dati del sito dal browser cancella anche i progressi: fai un backup ogni tanto.
- L'app chiede al browser di proteggere i dati dalla pulizia automatica ("archiviazione persistente").
- L'area genitori è protetta da un PIN di 4 cifre (serve a tenere fuori il bambino, non è una protezione forte).

## Struttura

```
src/
  core/        logica pura e testata: missione, stanchezza, premi, serie di giorni
  db/          database locale (Dexie), backup
  modules/     un modulo per argomento, con interfaccia comune (generatore, valutazione, statistiche)
    tabelline/
    problemi/
    misure/
    geometria/
  screens/     Home, Missione, Area genitori
  ui/          pulsanti, tastierino, barra, Glauco la civetta
  content/     epoche, carte (curiosità + fonte) e illustrazioni SVG originali
  i18n/        tutte le frasi del bambino
```

Per aggiungere un argomento (frazioni, divisioni in colonna, misure…) si scrive un nuovo `LearningModule`
(`src/core/module.ts`) e lo si registra in `src/modules/registry.ts`.
