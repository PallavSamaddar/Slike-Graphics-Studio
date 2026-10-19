import { useEffect } from 'react';
import useLiveFeed from '../../hooks/useLiveFeed.js';
import { loadFeed } from '../../services/feed.js';
import { useToast } from '../../ui-kit';

export default function LiveFeedPreview({ st, refreshedAt: lastAt, onFeed, children }) {
  const url = (st.rssUrl || '').trim();
  const toast = useToast();
  const { items, refreshedAt } = useLiveFeed(st, {
    feedKey: url,
    load: () => loadFeed(url),
    immediate: true,
    lastAt,
  });

  useEffect(() => {
    if (!items || !onFeed) return;
    onFeed(items)
      .then(({ done }) => { if (done === 'saved') toast('Feed refreshed — saved'); })
      .catch((err) => toast(`Feed refreshed, but ${err.message}`, 'bad'));
  }, [refreshedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  return children(st);
}
