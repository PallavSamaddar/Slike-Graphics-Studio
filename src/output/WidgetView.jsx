import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { autoTextColor, textShadowFor } from '../utils/color.js';
import { placeholderThumb } from '../utils/placeholderThumb.js';
import { feedMediaOn, lineHeightFor, usesFeedMedia } from '../constants/widgetTemplates.js';
import { widgetTransition } from '../constants/textAnimations.js';
import ParticleField from './ParticleField.jsx';
import GlobeOrbit from './GlobeOrbit.jsx';
import CleoVideoBackground from './CleoVideoBackground.jsx';

const TRANSITION_MS = 200;
// Lines the headline and description are clamped to: 3 each, raised (headline first) while
// every item still fits the card, or lowered (description first) when even 3 don't.
const MIN_LINES = 3;
const MAX_HEAD_LINES = 6;
const MAX_SUMMARY_LINES = 12;

// Each item — a feed's, or a manual one typed in — is a title, an optional description and an
// optional image; they cycle together. In the editor, a widget with no items yet shows a
// sample description and image where its layout has them.
export default function WidgetView({ st, preview = false }) {
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
  const stageRef = useRef(null);
  useFitLines(stageRef, st);

  const bodyTextColor = autoTextColor(s.bg);
  const headingTextColor = autoTextColor(s.headingBg);
  const bodyStyle = {
    background: s.bgGradient || s.bg,
    color: bodyTextColor,
    textShadow: textShadowFor(bodyTextColor),
    '--tex-speed': s.textureSpeed ?? 1,
  };
  const descBg = s.descBgGradient || s.descBg;
  const itemStyle = {
    color: bt.color || bodyTextColor,
    textShadow: textShadowFor(bt.color || bodyTextColor),
    background: descBg || undefined,
    textAlign: bt.align,
    lineHeight: lineHeightFor('body', s.textSpacing, bt),
    fontFamily: bt.fontFamily,
    fontWeight: bt.fontWeight,
    fontStyle: bt.fontStyle,
    textDecoration: bt.textDecoration,
  };
  const headingStyle = {
    background: s.headingBgGradient || s.headingBg,
    color: ht.color || headingTextColor,
    textShadow: textShadowFor(ht.color || headingTextColor),
    textAlign: ht.align,
    lineHeight: lineHeightFor('heading', s.textSpacing, ht),
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
  const renderItem = (index, phase, ghost = false) => {
    const line = lines[index];
    const headline = line?.title || (fromFeed ? 'Validate a feed to show its items here' : 'Enter title here');
    const sample = preview && !line;
    const summary = line?.description || (sample && st.showFeedDescription !== false ? 'Enter description here' : '');
    const hasDescription = !!summary.trim();
    const standIn = s.badgeImage || placeholderThumb(line?.title || '');
    const image = line?.media?.url || (feedMedia ? standIn : s.badgeImage) || (sample && feedMediaOn(st) ? standIn : null);
    return (
      <div
        key={ghost ? `ghost-${index}` : index}
        className={ghost ? 'widget-card-main widget-card-ghost' : `widget-card-main anim-${transition} phase-${phase}`}
        aria-hidden={ghost || phase === 'out' || undefined}
      >
        <div className="widget-card-headline" style={headingStyle}><span className="widget-card-headline-text">{headline}</span></div>
        {(hasDescription || image) && (
          <>
            <div className="widget-card-divider" />
            <div className={'widget-card-body widget-card-body-' + badgePos}>
              {image && (
                <div className="widget-card-thumb-wrap">
                  <img
                    key={image}
                    className={'widget-card-thumb' + (s.imageSlowZoom && !ghost ? ' slow-zoom' : '')}
                    style={s.imageSlowZoom ? { animationDuration: `${durationSec}s` } : undefined}
                    src={image}
                    alt=""
                    onError={(e) => { if (feedMedia && e.currentTarget.src !== standIn) e.currentTarget.src = standIn; }}
                  />
                </div>
              )}
              {hasDescription && (
                <div className={'widget-card-summary' + (descBg ? ' has-bg' : '')} style={itemStyle}>
                  <span className="widget-card-summary-text">{summary}</span>
                </div>
              )}
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
        <CleoVideoBackground src={s.customVideoUrl} opacity={s.textureOpacity ?? 1} />
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
        {/* Every item is laid out (hidden) in the same cell, so the card is always as tall as
            its tallest item and doesn't change size from one item to the next. */}
        <div className="widget-card-stage" ref={stageRef}>
          {lines.map((_, i) => (i === summaryIndex ? null : renderItem(i, 'hold', true)))}
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

// Sets --head-lines / --summary-lines on the stage: as many as fit, at least one each.
// An item's height is the sum of its parts (not its box, which the stage stretches or clips),
// measured without transforms, so an item mid-animation measures the same as at rest.
function useFitLines(stageRef, st) {
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const tallest = () => Math.max(0, ...[...stage.children].map((item) => {
      const parts = [...item.children];
      const gap = parseFloat(getComputedStyle(item).rowGap) || 0;
      return parts.reduce((h, part) => h + part.offsetHeight, 0) + gap * Math.max(0, parts.length - 1);
    }));
    const set = (head, summary) => {
      stage.style.setProperty('--head-lines', head);
      stage.style.setProperty('--summary-lines', summary);
    };
    const fits = (head, summary) => { set(head, summary); return tallest() <= stage.clientHeight; };
    const fit = () => {
      // Most cards (short text) fit even at the most lines: one measure, done.
      if (fits(MAX_HEAD_LINES, MAX_SUMMARY_LINES)) return;
      let head = MIN_LINES;
      let summary = MIN_LINES;
      while (summary > 1 && !fits(head, summary)) summary--;
      while (head > 1 && !fits(head, summary)) head--;
      while (head < MAX_HEAD_LINES && fits(head + 1, summary)) head++;
      while (summary < MAX_SUMMARY_LINES && fits(head, summary + 1)) summary++;
      set(head, summary);
    };
    fit();
    let live = true;
    document.fonts?.ready.then(() => { if (live) fit(); });
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    stage.addEventListener('load', fit, true); // an image's height arrives when it loads
    return () => {
      live = false;
      observer.disconnect();
      stage.removeEventListener('load', fit, true);
    };
  }, [stageRef, st]);
}
