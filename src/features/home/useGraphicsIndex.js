import { useEffect, useState } from 'react';
import { previewGraphics, getGraphicStats } from '../../services/graphics.js';
import { isAbort } from '../../services/rpc.js';
import { airFromPublished, isOnAir, liveStream } from '../../services/air.js';

export const PAGE = 12;
export const INDEX_REFRESH_MS = 1500;
const SEARCH_DEBOUNCE_MS = 300;
const STRIP_SIZE = 24;
const PUSH_SLACK_MS = 5 * 1000;

export const toCard = (g) => {
  const air = airFromPublished(g.kind, g.published);
  const published = isOnAir(air);
  const mt = g.mt ?? Date.now();
  return {
    ...g,
    source_type: g.source_type ?? g.source?.type,
    items: g.items ?? g.source?.items ?? [],
    mt,
    air,
    published,
    live: liveStream(air), // the stream using it, or null
    editedSincePush: published && mt > air.at + PUSH_SLACK_MS,
  };
};

function useDebounced(value, ms) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
}

const toFilters = ({ kind, source, state, sort }, search, page) => ({
  kind: kind === 'all' ? undefined : kind,
  sourceType: source === 'all' ? undefined : source,
  state: state === 'all' ? undefined : state,
  search,
  sort,
  size: PAGE,
  from: (page - 1) * PAGE,
});

export function useGraphicsPage(view, page, refresh) {
  const search = useDebounced(view.query.trim(), SEARCH_DEBOUNCE_MS);
  const [result, setResult] = useState({ status: 'loading', loading: true, graphics: [], count: 0, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setResult((r) => ({ ...r, loading: true }));
    previewGraphics(toFilters(view, search, page), { signal })
      .then(({ list = [], count = 0 }) => {
        if (signal.aborted) return;
        setResult({ status: 'ready', loading: false, graphics: list.map(toCard), count, error: '' });
      })
      .catch((err) => {
        if (isAbort(err) || signal.aborted) return; // replaced by a newer request
        setResult((r) => ({ ...r, status: 'error', loading: false, error: err.message }));
      });
    return () => controller.abort();
  }, [view.kind, view.source, view.state, view.sort, search, page, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...result, patch: (fn) => setResult((r) => ({ ...r, graphics: fn(r.graphics) })) };
}
export function usePublishedGraphics(refresh) {
  const [graphics, setGraphics] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    previewGraphics({ state: 'published', sort: 'published', size: STRIP_SIZE }, { signal: controller.signal })
      .then(({ list = [] }) => setGraphics(list.map(toCard)))
      .catch((err) => { if (!isAbort(err)) setGraphics([]); });
    return () => controller.abort();
  }, [refresh]);
  return graphics;
}

export function useGraphicStats(refresh) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    getGraphicStats({ signal: controller.signal }).then(setStats).catch(() => {});
    return () => controller.abort();
  }, [refresh]);
  return stats;
}
