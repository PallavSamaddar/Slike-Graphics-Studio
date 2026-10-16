import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import usePoll from './usePoll.js';
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

// Polls a graphic's feed every rssRefreshSec while its source is the Feed; `items` is the latest
// read. `lastAt` is when the graphic's feed was last read (the server's last_synced_at, by its
// cron or an earlier visit): less than an interval ago, it's shown as the last refresh and the
// next read waits out the rest of the interval instead of happening on open.
export default function useLiveFeed(st, { feedKey, load, immediate = false, lastAt = null }) {
  const [live, setLive] = useState(null); // { items?, at?, error? } for feedKey

  const secs = st.src === 'rss' ? Number(st.rssRefreshSec ?? DEFAULT_FEED_REFRESH_SEC) || 0 : 0;
  const on = secs > 0 && !!feedKey;
  const remembered = useMemo(() => {
    const wait = lastAt ? lastAt + secs * 1000 - Date.now() : 0;
    return wait > 0 ? { at: lastAt, wait } : null;
  }, [secs, lastAt]);

  useEffect(() => setLive(null), [on, secs, feedKey]);
  usePoll((isStopped) => load()
    .then((items) => {
      if (isStopped()) return;
      setLive({ items, at: Date.now() });
    })
    .catch((err) => { if (!isStopped()) setLive((l) => ({ ...l, error: err.message })); }),
  secs * 1000, [feedKey], { on, immediate: immediate && !remembered, delay: remembered?.wait });

  const at = live?.at || remembered?.at || null;
  const error = live?.error || '';
  useEffect(() => {
    if (!on) return undefined;
    publishStatus(feedKey, { at, error, waiting: !at && !error });
    return () => publishStatus(feedKey, null);
  }, [on, feedKey, at, error]);

  return {
    items: on ? live?.items || null : null,
    secs,
    refreshedAt: at,
    error,
  };
}
