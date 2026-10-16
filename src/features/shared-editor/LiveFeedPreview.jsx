import { useEffect, useRef } from 'react';
import useLiveFeed from '../../hooks/useLiveFeed.js';
import { loadFeed } from '../../services/feed.js';
import { useToast } from '../../ui-kit';

const SAID = { published: 'Feed refreshed — put on air', saved: 'Feed refreshed — saved' };

// Polls the graphic's feed while it's open and hands each fresh read to onFeed, which applies
// it (and saves or republishes it when that's safe); the preview just shows the graphic. When
// other changes keep a refresh off air, it says which — once, not on every poll.
export default function LiveFeedPreview({ st, refreshedAt: lastAt, onFeed, children }) {
  const url = (st.rssUrl || '').trim();
  const toast = useToast();
  const toldHeld = useRef('');
  // Read once on open (so a stale draft or on-air version catches up at once), then on the
  // interval — unless this graphic's feed was read less than an interval ago.
  const { items, refreshedAt } = useLiveFeed(st, {
    feedKey: url,
    load: () => loadFeed(url),
    immediate: true,
    lastAt,
  });

  useEffect(() => {
    if (!items || !onFeed) return;
    onFeed(items)
      .then(({ done, heldBy }) => {
        if (SAID[done]) toast(SAID[done]);
        const held = heldBy?.length ? heldBy.slice(0, 3).join(', ') + (heldBy.length > 3 ? ` +${heldBy.length - 3} more` : '') : '';
        if (held && held !== toldHeld.current) {
          toast(`Feed refreshed, but not put on air automatically — publish your other changes first: ${held}`);
        }
        toldHeld.current = held;
      })
      .catch((err) => toast(`Feed refreshed, but ${err.message}`, 'bad'));
  }, [refreshedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  return children(st);
}
