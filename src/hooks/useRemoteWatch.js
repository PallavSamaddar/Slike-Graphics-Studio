import { useEffect, useState } from 'react';
import { getGraphic } from '../services/graphics.js';

const WATCH_EVERY_MS = 10 * 1000;

// Watches the open graphic for someone else's save: asks the backend for it now and then and
// compares its `mt` with the one the editor loaded. Returns { mt, by, at } once a newer
// version is there, null otherwise. Quiet on failures — the next tick asks again — and
// paused while the tab is hidden.
export default function useRemoteWatch(id, mt) {
  const [remote, setRemote] = useState(null);

  useEffect(() => {
    setRemote(null);
    if (!id || !mt) return undefined;
    let stopped = false;
    const tick = () => {
      if (document.hidden) return;
      getGraphic(id)
        .then((g) => {
          if (stopped || !g || g.mt === mt) return;
          setRemote({ mt: g.mt, by: g.mtby || g.updated_by || '', at: Date.now() });
        })
        .catch(() => {});
    };
    const timer = setInterval(tick, WATCH_EVERY_MS);
    return () => { stopped = true; clearInterval(timer); };
  }, [id, mt]);

  return remote;
}
