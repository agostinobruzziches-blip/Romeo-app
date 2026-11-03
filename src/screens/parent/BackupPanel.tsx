import { useRef, useState } from 'react';
import { backupFileName, exportBackup, importBackup, resetAll, validateBackup } from '../../db/backup';
import { BigButton } from '../../ui/BigButton';

export function BackupPanel() {
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = async () => {
    const data = JSON.stringify(await exportBackup(), null, 1);
    const blob = new Blob([data], { type: 'application/json' });
    const file = new File([blob], backupFileName(), { type: 'application/json' });
    // Sul telefono: prova il menu "Condividi" (salva su Drive, manda per mail…), altrimenti scarica il file
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Backup Viaggio nel Tempo' });
        setMsg('Backup pronto.');
        return;
      }
    } catch {
      /* annullato: si scarica */
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Backup scaricato.');
  };

  const doImport = async (f: File) => {
    try {
      const b = validateBackup(JSON.parse(await f.text()));
      const when = new Date(b.exportedAt).toLocaleString('it-IT');
      if (!window.confirm(`Sostituire tutti i dati attuali con il backup del ${when}?`)) return;
      await importBackup(b);
      setMsg('Backup ripristinato.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'File non valido.');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base text-inchiostro-2">
        Tutti i dati restano solo su questo telefono. Fai un backup ogni tanto, e usalo per spostare i progressi
        sull’altro telefono di casa.
      </p>
      <BigButton variant="secondario" onClick={() => void doExport()}>
        Esporta backup
      </BigButton>
      <BigButton variant="tenue" onClick={() => fileRef.current?.click()}>
        Importa backup
      </BigButton>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void doImport(f);
          e.target.value = '';
        }}
      />
      <p className="min-h-6 text-oliva">{msg}</p>
      <hr className="my-2 border-carta-2" />
      <BigButton
        variant="tenue"
        onClick={async () => {
          if (!window.confirm('Cancellare tutti i progressi? Le impostazioni restano.')) return;
          if (!window.confirm('Sicuro? Non si può annullare (a meno di avere un backup).')) return;
          await resetAll(true);
          setMsg('Progressi azzerati.');
        }}
      >
        Azzera i progressi
      </BigButton>
    </div>
  );
}
