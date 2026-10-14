import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import usePoll from './usePoll.js';
import { withFeedItems } from '../services/feed.js';
import { DEFAULT_FEED_REFRESH_SEC } from '../constants/initialState.js';

const statuses = new Map();
const listeners = new Set();
function publishStatus(feedKey, status) {
  if (status) statuses.set(feedKey, status);
  else statuses.delete(feedKey);
  listeners.forEach((fn) => fn());
}
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function useFeedStatus(feedKey) {
  return useSyncExternalStore(subscribe, () => statuses.get(feedKey) || null);
}

export default function useLiveFeed(kind, st, { feedKey, load, immediate = false }) {
  const [live, setLive] = useState(null); // { items?, at?, error? } for feedKey

  const secs = st.src === 'rss' ? Number(st.rssRefreshSec ?? DEFAULT_FEED_REFRESH_SEC) || 0 : 0;
  const on = secs > 0 && !!feedKey;

  useEffect(() => setLive(null), [on, secs, feedKey]);
  usePoll((isStopped) => load()
    .then((items) => { if (!isStopped()) setLive({ items, at: Date.now() }); })
    .catch((err) => { if (!isStopped()) setLive((l) => ({ ...l, error: err.message })); }),
  secs * 1000, [feedKey], { on, immediate });

  const at = live?.at || null;
  const error = live?.error || '';
  useEffect(() => {
    if (!on) return undefined;
    publishStatus(feedKey, { at, error, waiting: !at && !error });
    return () => publishStatus(feedKey, null);
  }, [on, feedKey, at, error]);

  const items = on ? live?.items : null;
  const liveSt = useMemo(() => (items ? withFeedItems(kind, st, items) : st), [kind, st, items]);
  return {
    st: liveSt,
    secs,
    refreshedAt: at,
    error,
  };
}
