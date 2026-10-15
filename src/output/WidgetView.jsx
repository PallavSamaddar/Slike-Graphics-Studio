import { useEffect, useState } from 'react';
import { autoTextColor } from '../utils/color.js';
import { placeholderThumb } from '../utils/placeholderThumb.js';
import { usesFeedMedia } from '../constants/widgetTemplates.js';
import { widgetTransition } from '../constants/textAnimations.js';
import ParticleField from './ParticleField.jsx';
import GlobeOrbit from './GlobeOrbit.jsx';
import VideoBackground from './VideoBackground.jsx';
import CleoVideoBackground from './CleoVideoBackground.jsx';
import newsBackgroundVideo from '../assets/news-background.mp4';
import redeBgVideo from '../assets/rede-bg.mp4';
import redBackgroundVideo from '../assets/red-background.mp4';

const TRANSITION_MS = 200;

const VIDEO_TEXTURES = {
  'video-news': newsBackgroundVideo,
  'video-rede': redeBgVideo,
  'video-red': redBackgroundVideo,
};

// Each item — a feed's, or a manual one typed in — is a title, an optional description and an
// optional image; they cycle together.
export default function WidgetView({ st }) {
  const { style: s, headingText: ht, bodyText: bt } = st;
  const fromFeed = st.src !== 'manual';
  const previewItems = st.drafts?.[st.src] || st.items;
  const hideDescriptions = fromFeed && st.showFeedDescription === false;
  const descriptions = hideDescriptions ? [] : st.descriptions?.[st.src] || [];
  const itemMedia = fromFeed ? (usesFeedMedia(st) ? st.media.rss : null) : st.media?.manual || [];
  const lines = previewItems
    .map((title, i) => ({ title, description: descriptions[i] || '', media: itemMedia?.[i] || null }))
    .filter((line) => line.title.trim());
  const items = lines.map((line) => line.title);

  const transition = widgetTransition(st.behavior?.transition);
  const durationSec = Math.max(1, st.behavior?.itemDuration || 4);
  // One item at a time: the current one goes out, then the next comes in.
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState('in');
  const itemsKey = items.join('|');
  useEffect(() => { setActiveIndex(0); setPhase('in'); }, [itemsKey]);
  useEffect(() => {
    const timers = [setTimeout(() => setPhase('hold'), 30)];
    if (items.length > 1) {
      const holdMs = durationSec * 1000;
      timers.push(setTimeout(() => setPhase('out'), holdMs));
      timers.push(setTimeout(() => {
        setActiveIndex((i) => (i + 1) % items.length);
        setPhase('in');
      }, holdMs + TRANSITION_MS));
    }
    return () => timers.forEach(clearTimeout);
  }, [activeIndex, items.length, itemsKey, durationSec]);
  const summaryIndex = items.length ? Math.min(activeIndex, items.length - 1) : 0;

  const bodyTextColor = autoTextColor(s.bg);
  const headingTextColor = autoTextColor(s.headingBg);
  const bodyStyle = {
    background: s.bgGradient || s.bg,
    color: bodyTextColor,
    '--tex-speed': s.textureSpeed ?? 1,
  };
  const itemStyle = {
    color: bodyTextColor,
    fontFamily: bt.fontFamily,
    fontWeight: bt.fontWeight,
    fontStyle: bt.fontStyle,
    textDecoration: bt.textDecoration,
  };
  const headingStyle = {
    background: s.headingBgGradient || s.headingBg,
    color: headingTextColor,
    fontFamily: ht.fontFamily,
    fontWeight: ht.fontWeight,
    fontStyle: ht.fontStyle,
    textDecoration: ht.textDecoration,
  };

  const feedMedia = fromFeed && itemMedia;
  const badgePos = (feedMedia ? itemMedia.find(Boolean)?.pos : s.badgeImagePos) || 'left';

  const relativeTime = (ts) => {
    if (!ts) return 'Just now';
    const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
    const days = Math.round(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };
  const renderItem = (index, phase) => {
    const line = lines[index];
    const headline = line?.title || (fromFeed ? 'Validate a feed to show its items here' : 'Enter title here');
    const summary = line?.description || '';
    const hasDescription = !!summary.trim();
    const standIn = s.badgeImage || placeholderThumb(line?.title || '');
    const image = feedMedia ? line?.media?.url || standIn : line?.media?.url || s.badgeImage;
    return (
      <div key={index} className={`widget-card-main anim-${transition} phase-${phase}`} aria-hidden={phase === 'out' || undefined}>
        <div className="widget-card-headline" style={headingStyle}>{headline}</div>
        {(hasDescription || image) && (
          <>
            <div className="widget-card-divider" />
            <div className={'widget-card-body widget-card-body-' + badgePos}>
              {image && (
                <div className="widget-card-thumb-wrap">
                  <img
                    key={image}
                    className={'widget-card-thumb' + (s.imageSlowZoom ? ' slow-zoom' : '')}
                    style={s.imageSlowZoom ? { animationDuration: `${durationSec}s` } : undefined}
                    src={image}
                    alt=""
                    onError={(e) => { if (feedMedia && e.currentTarget.src !== standIn) e.currentTarget.src = standIn; }}
                  />
                </div>
              )}
              {hasDescription && <div className="widget-card-summary" style={itemStyle}>{summary}</div>}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="widget-frame widget-frame-card" style={bodyStyle}>
      {s.texture === 'video-custom' && s.customVideoMediaId ? (
        <CleoVideoBackground mediaId={s.customVideoMediaId} opacity={s.textureOpacity ?? 1} />
      ) : s.texture === 'video-custom' && s.customVideoUrl ? (
        <VideoBackground src={s.customVideoUrl} opacity={s.textureOpacity ?? 1} />
      ) : VIDEO_TEXTURES[s.texture] ? (
        <VideoBackground src={VIDEO_TEXTURES[s.texture]} opacity={s.textureOpacity ?? 1} />
      ) : s.texture === 'spiral' ? (
        <ParticleField color={s.textureColor || '#FFFFFF'} opacity={s.textureOpacity ?? 1} />
      ) : s.texture === 'globe' ? (
        <div style={{ opacity: s.textureOpacity ?? 1 }}>
          <GlobeOrbit />
          {s.textureColor && s.textureColor !== '#FFFFFF' && (
            <div className="texture-tint-live" style={{ background: s.textureColor }} />
          )}
        </div>
      ) : (
        <>
          <div className={'widget-texture-' + (s.texture || 'none')} style={{ '--tex-opacity': s.textureOpacity ?? 1 }} />
          {s.texture && s.texture !== 'none' && s.textureColor && s.textureColor !== '#FFFFFF' && (
            <div className="texture-tint-live" style={{ background: s.textureColor, opacity: s.textureOpacity ?? 1 }} />
          )}
        </>
      )}

      <div className="widget-card-content">
        {fromFeed && st.category?.trim() && (
          <span className="widget-card-category">
            <span className="widget-card-category-dot" />
            {st.category}
          </span>
        )}
        <div className="widget-card-stage">
          {renderItem(summaryIndex, phase)}
        </div>
        <div className="widget-card-footer">
          {st.showTime && (
            <span className="widget-card-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>
              {relativeTime(st.publishedAt)}
            </span>
          )}
          {st.showTime && st.showProduct && <span className="widget-card-sep">•</span>}
          {st.showProduct && <span className="widget-card-product" style={{ color: bodyTextColor }}>Times of India</span>}
        </div>
      </div>
    </div>
  );
}
