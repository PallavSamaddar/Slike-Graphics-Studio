import { useState } from 'react';
import ItemsEditor from './ItemsEditor.jsx';
import ContentTitle from './ContentTitle.jsx';
import { loadFeed, withFeedItems, withoutFeedItems, REFRESH_OPTIONS } from '../../services/feed.js';
import { DEFAULT_FEED_REFRESH_SEC } from '../../constants/initialState.js';
import { useFeedStatus } from '../../hooks/useLiveFeed.js';
import { SOURCE_LABEL } from '../../services/graphics.js';
import { Field, Row, Section, SegmentedControl, Select } from '../../ui-kit';

const SOURCE_OPTIONS = Object.entries(SOURCE_LABEL).map(([value, label]) => ({ value, label }));

const time = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const isValidFeedUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

function activateSource(s, key) {
  if (s.src === key) return s;
  return { ...s, src: key, items: (s.drafts || {})[key] || [] };
}
export function ContentSourceSwitch({ st, setSt }) {
  return (
    <SegmentedControl
      value={st.src}
      options={SOURCE_OPTIONS}
      onChange={(key) => setSt((s) => activateSource(s, key))}
      ariaLabel="Content source"
    />
  );
}

export default function ContentSource({ st, setSt, title = 'Content source', bare = false, kind = 'ticker', itemsLabel, afterUrl = null }) {
  const [rssLoaded, setRssLoaded] = useState(() => (st.drafts?.rss || []).length > 0);
  const [rssError, setRssError] = useState('');
  const [rssLoading, setRssLoading] = useState(false);

  const drafts = st.drafts || { manual: [], rss: [] };
  const showDescriptions = st.showFeedDescription !== false;
  const setDraft = (key, items) => setSt((s) => ({ ...s, drafts: { ...(s.drafts || {}), [key]: items }, src: key, items }));

  const loadRss = async () => {
    setRssError('');
    setRssLoaded(false);
    const url = (st.rssUrl || '').trim();
    if (!url) {
      setRssError('Enter a feed URL to load.');
      return;
    }
    if (!isValidFeedUrl(url)) {
      setRssError('That doesn’t look like a valid URL — check the format (e.g. https://example.com/feed.xml).');
      return;
    }
    setRssLoading(true);
    try {
      const items = await loadFeed(url);
      setSt((s) => withFeedItems(kind, { ...s, src: 'rss' }, items));
      setRssLoaded(true);
    } catch (err) {
      setRssError(err.message);
    } finally {
      setRssLoading(false);
    }
  };

  const validated = rssLoaded && !rssError && !rssLoading;
  const feedStatus = useFeedStatus((st.rssUrl || '').trim());
  const refreshNote = !feedStatus ? ''
    : feedStatus.error ? 'last refresh failed'
      : feedStatus.at ? `last refreshed ${time(feedStatus.at)}` : 'waiting for the first refresh';

  const body = (
    <>
      {st.src === 'manual' && (
        <Field label={itemsLabel} grow path={['items', 'drafts.manual']} className="items-field">
          <ItemsEditor items={drafts.manual} onChange={(v) => setDraft('manual', v)} />
        </Field>
      )}

      {st.src === 'rss' && (
        <Row className="rss-url-row">
          <Field label="Feed URL" grow path="rssUrl" err={rssError || null}>
            <div className="rss-row">
              <div className="rss-input">
                <input
                  type="text"
                  placeholder="Paste any RSS/Atom feed URL — e.g. https://feeds.timesofindia.com/..."
                  value={st.rssUrl}
                  onChange={(e) => {
                    const rssUrl = e.target.value;
                    setRssLoaded(false);
                    setSt((s) => (rssUrl.trim() ? { ...s, rssUrl } : withoutFeedItems({ ...s, rssUrl })));
                  }}
                />
                {validated ? (
                  <svg className="rss-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Validated">
                    <title>Validated</title>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <button type="button" className="rss-validate" onClick={loadRss} disabled={rssLoading}>
                    {rssLoading ? 'Validating…' : 'Validate'}
                  </button>
                )}
              </div>
            </div>
          </Field>
          <Field
            label={<>Refresh feed {refreshNote && <span className={'field-note' + (feedStatus.error ? ' bad' : '')}>({refreshNote})</span>}</>}
            path="rssRefreshSec"
            err={feedStatus?.error ? `Last refresh failed: ${feedStatus.error}` : null}
          >
            <Select
              value={Number(st.rssRefreshSec ?? DEFAULT_FEED_REFRESH_SEC) || 0}
              onChange={(v) => setSt((s) => ({ ...s, rssRefreshSec: v }))}
              ariaLabel="Refresh feed"
              options={REFRESH_OPTIONS}
            />
          </Field>
        </Row>
      )}

      {st.src === 'rss' && afterUrl}

      {st.src === 'rss' && (
        <div id="rssSec">
          {rssLoaded && !rssError && (
            <Field grow className="items-field">
              {kind === 'widget' ? (
                <FeedItemsList titles={drafts.rss} descriptions={showDescriptions ? st.descriptions?.rss || [] : []} />
              ) : (
                <ItemsEditor items={drafts.rss} onChange={() => {}} readOnly />
              )}
            </Field>
          )}
        </div>
      )}

    </>
  );

  if (bare) return body;

  return (
    <Section title={<ContentTitle>{title}</ContentTitle>} action={<ContentSourceSwitch st={st} setSt={setSt} />}>
      {body}
    </Section>
  );
}

// The widget's validated feed, read-only: each item's title in bold, its description below.
function FeedItemsList({ titles, descriptions }) {
  return (
    <ol className="items-editor items-editor-readonly feed-items-list" title="Fetched from source — edit not allowed. Change the URL and re-validate to update.">
      {titles.map((title, i) => (
        <li className="feed-item" key={i}>
          <span className="feed-item-num">{i + 1}</span>
          <div className="feed-item-text">
            <strong className="feed-item-title">{title}</strong>
            {descriptions[i] && <div className="feed-item-desc">{descriptions[i]}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
