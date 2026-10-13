import { useState } from 'react';
import ItemsEditor from './ItemsEditor.jsx';
import { loadFeed } from '../../services/feed.js';
import { templateHasImage } from '../../constants/widgetTemplates.js';
import { SOURCE_LABEL } from '../../services/graphics.js';
import { Field, Row, Section, SegmentedControl, Toggle } from '../../ui-kit';

const SOURCE_OPTIONS = Object.entries(SOURCE_LABEL).map(([value, label]) => ({ value, label }));

const isValidFeedUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

function activateSource(s, key, kind) {
  if (s.src === key) return s;
  const drafts = s.drafts || {};
  if (kind !== 'widget') return { ...s, src: key, items: drafts[key] || [] };
  // A feed's first line is its heading; the rest are the description lines.
  const headings = { ...s.headings, [s.src]: s.heading };
  const lines = drafts[key] || [];
  const heading = headings[key] ?? (key === 'rss' ? lines[0] || '' : '');
  return { ...s, src: key, headings, heading, items: key === 'rss' ? lines.slice(1) : lines };
}
export function ContentSourceSwitch({ st, setSt, kind = 'ticker' }) {
  return (
    <SegmentedControl
      value={st.src}
      options={SOURCE_OPTIONS}
      onChange={(key) => setSt((s) => activateSource(s, key, kind))}
      ariaLabel="Content source"
    />
  );
}

export default function ContentSource({ st, setSt, title = 'Content source', bare = false, kind = 'ticker', itemsLabel, afterUrl = null }) {
  const [rssLoaded, setRssLoaded] = useState(() => (st.drafts?.rss || []).length > 0);
  const [rssError, setRssError] = useState('');
  const [rssLoading, setRssLoading] = useState(false);
  const [rssItems, setRssItems] = useState([]); // the validated feed: [{ title, description, media }]

  const drafts = st.drafts || { manual: [], rss: [] };
  const media = st.media || { rss: [] };
  const [mediaEnabled, setMediaEnabled] = useState(() => (st.media?.rss || []).some(Boolean));

  // Editing a source's content (typing, or validating a Feed URL) makes it the live content
  // at once; the widget keeps a feed's first line as that feed's heading.
  const setDraft = (key, items) =>
    setSt((s) => {
      const next = { ...s, drafts: { ...(s.drafts || {}), [key]: items }, src: key, items };
      if (kind === 'widget' && key !== 'manual' && items.length) {
        next.heading = items[0];
        next.headings = { ...s.headings, [key]: items[0] };
        next.items = items.slice(1);
        const mediaList = (s.media || media)[key] || [];
        next.media = { ...(s.media || media), [key]: mediaList.slice(1) };
      }
      return next;
    });

  const mediaPos = media.rss?.find(Boolean)?.pos || 'left';

  // No per-headline picking — toggling "Include images/videos" on/off applies to every Feed
  // headline at once. A validated feed gives each headline its own media (url); an item
  // without media gets none.
  const setFeedMedia = (on) =>
    setSt((s) => {
      const count = (s.drafts?.rss || []).length;
      const list = !on ? [] : Array.from({ length: count }, (_, i) => {
        if (!rssItems.length) return { pos: mediaPos };
        return rssItems[i]?.media ? { pos: mediaPos, url: rssItems[i].media } : null;
      });
      return { ...s, media: { ...(s.media || media), rss: list } };
    });

  const setMediaPos = (pos) =>
    setSt((s) => {
      const list = (s.media?.rss || []).map((m) => (m ? { ...m, pos } : m));
      return { ...s, media: { ...(s.media || media), rss: list } };
    });

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
      setRssItems(items);
      setMediaEnabled(false);
      setSt((s) => ({ ...s, media: { ...(s.media || media), rss: [] } }));
      setDraft('rss', items.map((i) => i.title));
      setRssLoaded(true);
    } catch (err) {
      setRssError(err.message);
    } finally {
      setRssLoading(false);
    }
  };

  const body = (
    <>
      {st.src === 'manual' && (
        <Field label={itemsLabel} grow path={['items', 'drafts.manual']} className="items-field">
          <ItemsEditor items={drafts.manual} onChange={(v) => setDraft('manual', v)} />
        </Field>
      )}

      {st.src === 'rss' && (
        <Field label="Feed URL" grow path="rssUrl" err={rssError || null}>
          <div className="rss-row">
            <input
              type="text"
              placeholder="Paste any RSS/Atom feed URL — e.g. https://feeds.timesofindia.com/..."
              value={st.rssUrl}
              onChange={(e) => { setRssLoaded(false); setSt((s) => ({ ...s, rssUrl: e.target.value })); }}
            />
            <button type="button" className="btn ghost" onClick={loadRss} disabled={rssLoading}>
              {rssLoading ? 'Validating…' : rssLoaded && !rssError ? 'Validated' : 'Validate'}
            </button>
          </div>
        </Field>
      )}

      {st.src === 'rss' && afterUrl}

      {st.src === 'rss' && (
        <div id="rssSec">
          {rssLoaded && !rssError && (
            <>
              <Field grow className="items-field">
                <ItemsEditor items={drafts.rss} onChange={() => {}} readOnly />
              </Field>
              {kind === 'widget' && templateHasImage(st.template) && (
                <MediaPicker
                  enabled={mediaEnabled}
                  onToggleEnabled={() => {
                    setMediaEnabled(!mediaEnabled);
                    setFeedMedia(!mediaEnabled);
                  }}
                  pos={mediaPos}
                  onSetPos={setMediaPos}
                />
              )}
            </>
          )}
        </div>
      )}

    </>
  );

  if (bare) return body;

  return (
    <Section title={title} action={<ContentSourceSwitch st={st} setSt={setSt} kind={kind} />}>
      {body}
    </Section>
  );
}

function MediaPicker({ enabled, onToggleEnabled, pos, onSetPos }) {
  return (
    <Row className="media-picker">
      <Field>
        <Toggle on={enabled} onChange={onToggleEnabled}>Include images/videos with these headlines</Toggle>
      </Field>
      {enabled && (
        <SegmentedControl value={pos} onChange={onSetPos} ariaLabel="Image position" options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]} />
      )}
    </Row>
  );
}
