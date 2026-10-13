import { useCallback, useEffect, useState } from 'react';
import { previewAllGraphics, getGraphicStats, duplicateGraphic, archiveGraphic } from '../../services/graphics.js';
import { airOf, isOnAir, liveStream } from '../../services/air.js';
import { useToast } from '../../ui-kit';

const INDEX_REFRESH_MS = 1500;
// A save that lands this long after a push counts as a draft edited since (clocks differ a little).
const PUSH_SLACK_MS = 5 * 1000;

// A card's view of a graphic: the preview row plus what its publish record says.
export const toCard = (g) => {
  const air = airOf(g.config);
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

// Every graphic of the business, as cards, with the acts a card offers. graphic.preview can
// miss a write for a moment (the search index refreshes about once a second), so an act shows
// its result in the list at once and asks again after that, so counts and order catch up.
export default function useGraphicsIndex() {
  const toast = useToast();
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [graphics, setGraphics] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, nextStats] = await Promise.all([previewAllGraphics(), getGraphicStats()]);
      setGraphics(list.map(toCard));
      setStats(nextStats);
      setError('');
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runAction = (action, id, receipt, apply) => action(id)
    .then((result) => {
      setGraphics((list) => apply(list, result));
      toast(receipt);
      setTimeout(load, INDEX_REFRESH_MS);
    })
    .catch((err) => toast(err.message, 'bad'));

  return {
    status,
    graphics,
    stats,
    error,
    reload: load,
    duplicate: (id) => runAction(duplicateGraphic, id, 'Duplicated', (list, copy) => (
      copy?.id ? [toCard(copy), ...list.filter((g) => g.id !== copy.id)] : list
    )),
    archive: (id) => runAction(archiveGraphic, id, 'Archived', (list) => list.filter((g) => g.id !== id)),
  };
}
