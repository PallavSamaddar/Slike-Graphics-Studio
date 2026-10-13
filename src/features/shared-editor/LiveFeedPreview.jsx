import { Field, Select } from '../../ui-kit';
import useLiveFeed from '../../hooks/useLiveFeed.js';
import { loadFeed, REFRESH_OPTIONS } from '../../services/feed.js';

const time = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function LiveFeedPreview({ kind, st, setSt, children }) {
  const url = (st.rssUrl || '').trim();
  const live = useLiveFeed(kind, st, { feedKey: url, load: () => loadFeed(url) });
  const { secs } = live;

  const status = live.error
    ? `Last refresh failed: ${live.error}`
    : live.refreshedAt ? `Refreshed at ${time(live.refreshedAt)}` : secs ? 'Waiting for the first refresh' : 'The feed is read once, when validated';

  return (
    <>
      {st.src === 'rss' && (
        <div className="feed-refresh-bar">
          <Field label="Refresh feed" path="rssRefreshSec" err={live.error ? status : null}>
            <Select
              value={secs}
              onChange={(v) => setSt((s) => ({ ...s, rssRefreshSec: v }))}
              ariaLabel="Refresh feed"
              options={REFRESH_OPTIONS}
            />
          </Field>
          {!live.error && <span className="feed-refresh-status">{status}</span>}
        </div>
      )}
      {children(live.st)}
    </>
  );
}
