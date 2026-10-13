import { useEffect, useMemo, useRef, useState } from 'react';
import { withFeedItems } from '../services/feed.js';

export default function useLiveFeed(kind, st, { feedKey, load, immediate = false }) {
  const [live, setLive] = useState(null); // { items?, at?, error? } for feedKey
  const loadRef = useRef(load);
  loadRef.current = load;

  const secs = st.src === 'rss' ? Number(st.rssRefreshSec) || 0 : 0;
  const on = secs > 0 && !!feedKey;

  useEffect(() => {
    setLive(null);
    if (!on) return undefined;
    let stopped = false;
    const run = () => loadRef.current()
      .then((items) => { if (!stopped) setLive({ items, at: Date.now() }); })
      .catch((err) => { if (!stopped) setLive((l) => ({ ...l, error: err.message })); });
    if (immediate) run();
    const timer = setInterval(run, secs * 1000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [on, secs, feedKey, immediate]);

  const items = on ? live?.items : null;
  const liveSt = useMemo(() => (items ? withFeedItems(kind, st, items) : st), [kind, st, items]);
  return {
    st: liveSt,
    secs,
    refreshedAt: live?.at || null,
    error: live?.error || '',
  };
}
