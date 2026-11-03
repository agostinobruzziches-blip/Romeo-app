import { useEffect, useState } from 'react';
import { configureSound } from './core/sound';
import { ensureInitialized } from './db/repo';
import { db } from './db/schema';
import { useLiveQuery } from 'dexie-react-hooks';
import { Home } from './screens/Home';
import { Mission } from './screens/Mission';
import { ParentArea } from './screens/parent/ParentArea';
import { Timeline } from './screens/Timeline';
import { Album } from './screens/Album';
import { syncCards } from './core/cards';
import { Gallery } from './dev/Gallery';
import { EPOCHS, type EpochId } from './content/epochs';

type Route =
  | { name: 'home' }
  | { name: 'missione'; repeat: boolean }
  | { name: 'genitori' }
  | { name: 'tempo' }
  | { name: 'album'; epoch: EpochId };

function parse(hash: string): Route {
  if (hash.startsWith('#/genitori')) return { name: 'genitori' };
  if (hash.startsWith('#/tempo')) return { name: 'tempo' };
  const album = hash.match(/^#\/album\/(\w+)/);
  if (album && EPOCHS.some((e) => e.id === album[1])) return { name: 'album', epoch: album[1] as EpochId };
  // una missione non riparte da sola dopo un ricaricamento: si torna sempre alla home
  return { name: 'home' };
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  const settings = useLiveQuery(() => db.settings.get('main'), [ready]);

  useEffect(() => {
    ensureInitialized()
      .then(() => syncCards())
      .then(() => setReady(true));
    const onHash = () => setRoute((r) => (r.name === 'missione' ? r : parse(window.location.hash)));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (settings) configureSound(settings.soundOn, settings.volume);
  }, [settings]);

  const go = (r: Route) => {
    setRoute(r);
    const hash =
      r.name === 'album' ? `#/album/${r.epoch}` : r.name === 'home' ? '#/' : `#/${r.name}`;
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
    window.scrollTo(0, 0);
  };

  if (!ready) return null;
  if (import.meta.env.DEV && window.location.hash === '#/galleria') return <Gallery />;
  if (route.name === 'missione') return <Mission repeat={route.repeat} onExit={() => go({ name: 'home' })} />;
  if (route.name === 'genitori') return <ParentArea onExit={() => go({ name: 'home' })} />;
  if (route.name === 'tempo')
    return <Timeline onOpen={(epoch) => go({ name: 'album', epoch })} onExit={() => go({ name: 'home' })} />;
  if (route.name === 'album') return <Album epochId={route.epoch} onBack={() => go({ name: 'tempo' })} />;
  return (
    <Home
      onStart={(repeat) => go({ name: 'missione', repeat })}
      onParent={() => go({ name: 'genitori' })}
      onTimeline={() => go({ name: 'tempo' })}
    />
  );
}
