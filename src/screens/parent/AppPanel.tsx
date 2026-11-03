import { useEffect, useState } from 'react';
import { APP_VERSION, isIOS, isStandalone, isStoragePersisted, requestPersistentStorage, useInstallPrompt } from '../../core/pwa';
import { BigButton } from '../../ui/BigButton';

function Status({ ok, children }: { ok: boolean | null; children: string }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden="true">{ok ? '✅' : ok === false ? '⚪' : '•'}</span>
      <span>{children}</span>
    </li>
  );
}

/** Installazione sul telefono, funzionamento offline e protezione dei dati. */
export function AppPanel() {
  const { canInstall, install } = useInstallPrompt();
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [offline, setOffline] = useState<boolean | null>(null);
  const standalone = isStandalone();

  useEffect(() => {
    void isStoragePersisted().then(setPersisted);
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistration().then((r) => setOffline(!!r?.active));
    } else setOffline(false);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2 rounded-xl bg-white p-3 text-base">
        <Status ok={standalone}>{standalone ? 'Aperta come app installata' : 'Aperta nel browser (non ancora installata)'}</Status>
        <Status ok={offline}>
          {offline ? 'Pronta a funzionare anche senza internet' : 'Il funzionamento offline si attiva dopo la prima apertura con internet'}
        </Status>
        <Status ok={persisted}>
          {persisted
            ? 'Dati protetti: il telefono non li cancella per fare spazio'
            : persisted === false
              ? 'Dati non ancora protetti dalla pulizia automatica (installare l’app di solito aiuta)'
              : 'Protezione dei dati non disponibile su questo browser'}
        </Status>
      </ul>

      {!standalone && (
        <div className="flex flex-col gap-3 rounded-xl bg-white p-3">
          <h2 className="text-lg font-bold">Installa sulla schermata Home</h2>
          {canInstall ? (
            <BigButton onClick={() => void install()}>Installa l’app</BigButton>
          ) : isIOS() ? (
            <ol className="list-decimal pl-5 text-base leading-relaxed">
              <li>Apri questa pagina con <b>Safari</b>.</li>
              <li>
                Tocca il pulsante <b>Condividi</b> (il quadrato con la freccia in su).
              </li>
              <li>
                Scorri e tocca <b>Aggiungi alla schermata Home</b>, poi <b>Aggiungi</b>.
              </li>
            </ol>
          ) : (
            <ol className="list-decimal pl-5 text-base leading-relaxed">
              <li>Apri questa pagina con <b>Chrome</b>.</li>
              <li>
                Tocca il menu <b>⋮</b> in alto a destra.
              </li>
              <li>
                Tocca <b>Installa app</b> (oppure <b>Aggiungi a schermata Home</b>).
              </li>
            </ol>
          )}
          <p className="text-sm text-inchiostro-2">
            Installata, l’app si apre a schermo intero senza barra degli indirizzi: meno distrazioni.
          </p>
        </div>
      )}

      {persisted === false && (
        <BigButton variant="tenue" onClick={() => void requestPersistentStorage().then(setPersisted)}>
          Chiedi di proteggere i dati
        </BigButton>
      )}

      <div className="rounded-xl bg-white p-3 text-sm text-inchiostro-2">
        <p>
          Gli aggiornamenti arrivano da soli quando c’è internet e si applicano solo dalla schermata iniziale, mai durante
          una missione.
        </p>
        <p className="mt-1">Versione {APP_VERSION}</p>
      </div>
    </div>
  );
}
