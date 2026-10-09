import { useState } from 'react';
import ItemsEditor from './ItemsEditor.jsx';
import { Field, Row, Section, SegmentedControl, Tabs, Toggle } from '../../ui-kit';

const RSS_HEADLINES = [
  'PM holds high-level security review amid regional tensions',
  'Supreme Court reserves judgment on key electoral bonds case',
  'Sensex closes 450 points higher; IT and banking stocks lead gains',
  'India records 7.4% GDP growth in Q2, beats analyst expectations',
  'Delhi: Heavy rain warning for next 48 hours — IMD orange alert',
];

const JSON_HEADLINES = [
  'RBI holds repo rate steady at 6.5% for fourth straight meeting',
  'ISRO successfully launches next-gen navigation satellite',
  'Rupee strengthens to 82.4 against US dollar in early trade',
  'Monsoon session of Parliament to begin next week',
  'Metro Phase 4 construction crosses 60% completion mark',
];

const SRC_LABEL = { manual: 'Manual', rss: 'Feed', json: 'JSON' };

export default function ContentSource({ st, setSt, title = 'Content source', bare = false, kind = 'ticker', hideTabs = false, itemsLabel, viewTab: viewTabProp, onViewTabChange, afterUrl = null }) {
  const [rssLoaded, setRssLoaded] = useState(false);
  const [rssError, setRssError] = useState('');
  const [jsonLoaded, setJsonLoaded] = useState(false);
  const [jsonError, setJsonError] = useState('');


  // viewTab: which tab panel is open for editing — independent of st.src,
  // which is the source actually live on the ticker (drives the active-tab highlight).
  // Can be lifted to a parent (e.g. to render the tab bar elsewhere) via viewTab/onViewTabChange.
  const [viewTabState, setViewTabState] = useState(st.src);
  const viewTab = viewTabProp ?? viewTabState;
  const setViewTab = onViewTabChange ?? setViewTabState;

  const drafts = st.drafts || { manual: [], rss: [], json: [] };
  const media = st.media || { rss: [], json: [] };
  const [mediaEnabled, setMediaEnabled] = useState({ rss: false, json: false });

  // Editing a tab's content (typing, or validating a Feed/JSON URL) commits
  // it as the live source immediately — there's no separate Save step.
  const setDraft = (key, items) =>
    setSt((s) => {
      const next = { ...s, drafts: { ...(s.drafts || {}), [key]: items }, src: key, items };
      if (kind === 'widget' && key !== 'manual' && items.length) {
        next.heading = items[0];
        next.items = items.slice(1);
        const mediaList = (s.media || media)[key] || [];
        next.media = { ...(s.media || media), [key]: mediaList.slice(1) };
      }
      return next;
    });

  const getMediaPos = (key) => {
    const list = media[key] || [];
    const first = list.find((m) => m);
    return (first && first.pos) || 'left';
  };

  // No per-headline picking — toggling "Include images/videos" on/off applies
  // to every headline in this source at once.
  const setMediaEnabledForAll = (key, on) =>
    setSt((s) => {
      const count = ((s.drafts || drafts)[key] || []).length;
      const pos = getMediaPos(key);
      const list = on ? Array.from({ length: count }, () => ({ pos })) : [];
      return { ...s, media: { ...(s.media || media), [key]: list } };
    });

  // Position applies to the whole set of ticked headlines at once (one
  // left/right choice for the source, not per headline).
  const setMediaPos = (key, pos) =>
    setSt((s) => {
      const list = ((s.media || media)[key] || []).map((m) => (m ? { ...m, pos } : m));
      return { ...s, media: { ...(s.media || media), [key]: list } };
    });

  const isValidFeedUrl = (v) => {
    try {
      const u = new URL(v);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const loadRss = () => {
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
    // URL format is valid — fetching/parsing the actual feed happens server-side in production.
    setDraft('rss', RSS_HEADLINES);
    setRssLoaded(true);
  };

  const loadJson = () => {
    setJsonError('');
    setJsonLoaded(false);
    const raw = (st.jsonUrl || '').trim();
    if (raw.startsWith('[') || raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : parsed.items;
        if (!Array.isArray(list)) throw new Error('bad shape');
        setDraft('json', list.map((x) => (typeof x === 'string' ? x : x.headline || x.title || String(x))));
        setJsonLoaded(true);
        return;
      } catch (e) {
        setJsonError('Could not parse JSON — check the format.');
        return;
      }
    }
    setDraft('json', JSON_HEADLINES);
    setJsonLoaded(true);
  };

  const body = (
    <>
      {!hideTabs && <ContentSourceTabs st={st} viewTab={viewTab} onViewTabChange={setViewTab} kind={kind} />}

      {viewTab === 'manual' && (
        <Field label={itemsLabel} grow path={['items', 'drafts.manual']} className="items-field">
          <ItemsEditor items={drafts.manual} onChange={(v) => setDraft('manual', v)} />
        </Field>
      )}

      {viewTab === 'rss' && (
        <Field label="Feed URL" grow path="rssUrl" err={rssError || null}>
          <div className="rss-row">
            <input
              type="text"
              placeholder="Paste any RSS/Atom feed URL — e.g. https://feeds.timesofindia.com/..."
              value={st.rssUrl}
              onChange={(e) => { setRssLoaded(false); setSt((s) => ({ ...s, rssUrl: e.target.value })); }}
            />
            <button type="button" className="btn ghost" onClick={loadRss}>
              {rssLoaded && !rssError ? 'Validated' : 'Validate'}
            </button>
          </div>
        </Field>
      )}

      {viewTab === 'rss' && afterUrl}

      {viewTab === 'rss' && (
        <div id="rssSec">
          {rssLoaded && !rssError && (
            <>
              <Field grow className="items-field">
                <ItemsEditor items={drafts.rss} onChange={() => {}} readOnly />
                {st.src === 'rss' && <div className="hint">This source is currently live on the {kind}.</div>}
              </Field>
              {kind === 'widget' && (
                <MediaPicker
                  enabled={mediaEnabled.rss}
                  onToggleEnabled={() => {
                    const next = !mediaEnabled.rss;
                    setMediaEnabled((m) => ({ ...m, rss: next }));
                    setMediaEnabledForAll('rss', next);
                  }}
                  pos={getMediaPos('rss')}
                  onSetPos={(pos) => setMediaPos('rss', pos)}
                />
              )}
            </>
          )}
        </div>
      )}

      {viewTab === 'json' && (
        <Field label="JSON URL or raw array" grow path="jsonUrl" err={jsonError || null}>
          <div className="rss-row">
            <input
              type="text"
              placeholder='https://api.example.com/headlines.json or ["Headline 1", "Headline 2"]'
              value={st.jsonUrl}
              onChange={(e) => { setJsonLoaded(false); setSt((s) => ({ ...s, jsonUrl: e.target.value })); }}
            />
            <button type="button" className="btn ghost" onClick={loadJson}>
              {jsonLoaded && !jsonError ? 'Validated' : 'Validate'}
            </button>
          </div>
        </Field>
      )}

      {viewTab === 'json' && afterUrl}

      {viewTab === 'json' && (
        <div id="jsonSec">
          {jsonLoaded && !jsonError && (
            <>
              <Field grow className="items-field">
                <ItemsEditor items={drafts.json} onChange={() => {}} readOnly />
                {st.src === 'json' && <div className="hint">This source is currently live on the {kind}.</div>}
              </Field>
              {kind === 'widget' && (
                <MediaPicker
                  enabled={mediaEnabled.json}
                  onToggleEnabled={() => {
                    const next = !mediaEnabled.json;
                    setMediaEnabled((m) => ({ ...m, json: next }));
                    setMediaEnabledForAll('json', next);
                  }}
                  pos={getMediaPos('json')}
                  onSetPos={(pos) => setMediaPos('json', pos)}
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
    <Section title={title}>
      {body}
    </Section>
  );
}

// The three sources as tabs: the tab you are on is the one you edit; the source the graphic
// runs on carries the small accent dot.
export function ContentSourceTabs({ st, viewTab, onViewTabChange, kind = 'ticker' }) {
  // The widget has no JSON source.
  const tabs = Object.entries(SRC_LABEL)
    .filter(([id]) => !(kind === 'widget' && id === 'json'))
    .map(([id, label]) => ({ id, label, dot: st.src === id ? `Live on ${kind}` : undefined }));
  return <Tabs tabs={tabs} value={viewTab} onChange={onViewTabChange} />;
}

function MediaPicker({ enabled, onToggleEnabled, pos, onSetPos }) {
  return (
    <Row className="media-picker">
      <Toggle on={enabled} onChange={onToggleEnabled}>Include images/videos with these headlines</Toggle>
      {enabled && (
        <SegmentedControl value={pos} onChange={onSetPos} ariaLabel="Image position" options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]} />
      )}
    </Row>
  );
}
