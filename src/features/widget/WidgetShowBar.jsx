import { feedMediaOn } from '../../constants/widgetTemplates.js';
import { loadFeed, withFeedItems } from '../../services/feed.js';

// What the widget shows, ticked on or off — one line above the preview, always in view.
export default function WidgetShowBar({ st, setSt }) {
  const setFeedMedia = (on) => {
    setSt((state) => ({
      ...state,
      showFeedMedia: on,
      media: { ...state.media, rss: on ? (state.drafts?.rss || []).map(() => ({ pos: state.style?.badgeImagePos || 'left' })) : [] },
    }));
    const url = (st.rssUrl || '').trim();
    if (!on || !url || !(st.drafts?.rss || []).length) return;
    loadFeed(url)
      .then((items) => setSt((state) => (feedMediaOn(state) ? withFeedItems('widget', state, items) : state)))
      .catch(() => {});
  };

  const mediaOn = feedMediaOn(st);
  const feedPos = st.media?.rss?.find(Boolean)?.pos || st.style?.badgeImagePos || 'left';
  const setFeedPos = (pos) => setSt((state) => ({
    ...state,
    style: { ...state.style, badgeImagePos: pos },
    media: { ...state.media, rss: (state.media?.rss || []).map((m) => (m ? { ...m, pos } : m)) },
  }));

  return (
    <div className="show-bar" role="group" aria-label="Show on the widget">
      <div className="show-bar-checks">
        <CheckChip
          on={!!st.showTime}
          onChange={(checked) => setSt((state) => ({
            ...state,
            showTime: checked,
            publishedAt: checked && !state.publishedAt ? Date.now() : state.publishedAt,
          }))}
        >
          Time posted
        </CheckChip>
        <CheckChip on={!!st.showProduct} onChange={(v) => setSt((state) => ({ ...state, showProduct: v }))}>Publisher</CheckChip>
        {st.src === 'rss' && (
          <>
            <div className={'chip-joined' + (mediaOn ? ' on' : '')}>
              <CheckChip on={mediaOn} onChange={setFeedMedia}>Images/videos</CheckChip>
              {mediaOn && <ImagePosition value={feedPos} onChange={setFeedPos} />}
            </div>
            <CheckChip on={st.showFeedDescription !== false} onChange={(v) => setSt((state) => ({ ...state, showFeedDescription: v }))}>Descriptions</CheckChip>
          </>
        )}
      </div>
    </div>
  );
}

// Image on the left or right of the description, as two small icons.
function ImagePosition({ value, onChange }) {
  const icon = (side) => (
    <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <rect x={side === 'left' ? 1.5 : 11.5} y="3" width="7" height="10" rx="1.5" fill="currentColor" fillOpacity=".25" />
      {[5, 8, 11].map((y) => <line key={y} x1={side === 'left' ? 11 : 1.5} x2={side === 'left' ? 18.5 : 9} y1={y} y2={y} />)}
    </svg>
  );
  return (
    <div className="chip-pos" role="radiogroup" aria-label="Image position">
      {['left', 'right'].map((side) => (
        <button
          key={side}
          type="button"
          role="radio"
          aria-checked={value === side}
          className={value === side ? 'on' : undefined}
          onClick={() => onChange(side)}
          title={side === 'left' ? 'Image on the left' : 'Image on the right'}
        >
          {icon(side)}
        </button>
      ))}
    </div>
  );
}

// A checkbox as a box: ticked on or off.
function CheckChip({ on, onChange, children }) {
  return (
    <label className={'check-chip' + (on ? ' on' : '')}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span className="check-chip-box" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5" /></svg>
      </span>
      {children}
    </label>
  );
}
