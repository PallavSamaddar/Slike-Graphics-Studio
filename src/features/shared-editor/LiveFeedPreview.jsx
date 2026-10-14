import useLiveFeed from '../../hooks/useLiveFeed.js';
import { loadFeed } from '../../services/feed.js';

export default function LiveFeedPreview({ kind, st, children }) {
  const url = (st.rssUrl || '').trim();
  const live = useLiveFeed(kind, st, { feedKey: url, load: () => loadFeed(url) });
  return children(live.st);
}
