import { useEffect, useState } from 'react';
import { configureSound } from './core/sound';
import { ensureInitialized } from './db/repo';
import { db } from './db/schema';
import { useLiveQuery } from 'dexie-react-hooks';
import { Home } from './screens/Home';
import { Mission } from './screens/Mission';
import { ParentArea } from './screens/parent/ParentArea';

type Route = { name: 'home' } | { name: 'missione'; repeat: boolean } | { name: 'genitori' };

function parse(hash: string): Route {
  if (hash.startsWith('#/genitori')) return { name: 'genitori' };
  // una missione non riparte da sola dopo un ricaricamento: si torna sempre alla home
  return { name: 'home' };
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  const settings = useLiveQuery(() => db.settings.get('main'), [ready]);

  useEffect(() => {
    ensureInitialized().then(() => setReady(true));
    const onHash = () => setRoute((r) => (r.name === 'missione' ? r : parse(window.location.hash)));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (settings) configureSound(settings.soundOn, settings.volume);
  }, [settings]);

  const go = (r: Route) => {
    setRoute(r);
    const hash = r.name === 'genitori' ? '#/genitori' : r.name === 'missione' ? '#/missione' : '#/';
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  };

  if (!ready) return null;
  if (route.name === 'missione') return <Mission repeat={route.repeat} onExit={() => go({ name: 'home' })} />;
  if (route.name === 'genitori') return <ParentArea onExit={() => go({ name: 'home' })} />;
  return <Home onStart={(repeat) => go({ name: 'missione', repeat })} onParent={() => go({ name: 'genitori' })} />;
}
