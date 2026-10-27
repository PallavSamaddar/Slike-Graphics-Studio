import { CheckChip } from '../../ui-kit';
import { feedMediaOn } from '../../constants/widgetTemplates.js';
import { loadFeed, withFeedItems } from '../../services/feed.js';

export default function WidgetShowBar({ st, setSt }) {
  const setFeedMedia = (on) => {
    if (st.src !== 'rss') {
      setSt((state) => ({ ...state, showFeedMedia: on }));
      return;
    }
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

  const mediaOn = st.src === 'rss' ? feedMediaOn(st) : st.showFeedMedia !== false;
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
        <CheckChip on={mediaOn} onChange={setFeedMedia}>Images/videos</CheckChip>
        <CheckChip on={st.showFeedDescription !== false} onChange={(v) => setSt((state) => ({ ...state, showFeedDescription: v, ...(v && { staticTitle: false }) }))}>Descriptions</CheckChip>
        {st.showFeedDescription === false && (
          <CheckChip on={!!st.staticTitle} onChange={(v) => setSt((state) => ({ ...state, staticTitle: v }))}>Static title</CheckChip>
        )}
      </div>
    </div>
  );
}
