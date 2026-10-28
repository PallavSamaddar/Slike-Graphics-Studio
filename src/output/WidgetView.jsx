import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { autoTextColor, textShadowFor } from '../utils/color.js';
import { placeholderThumb } from '../utils/placeholderThumb.js';
import { MIN_ITEM_SECONDS, feedMediaOn, lineHeightFor, usesFeedMedia } from '../constants/widgetTemplates.js';
import { cardTransition, descAnimation, staticAnimation } from '../constants/textAnimations.js';
import ParticleField from './ParticleField.jsx';
import GlobeOrbit from './GlobeOrbit.jsx';
import GraphicVideo, { uploadStream } from './GraphicVideo.jsx';
import PartText, { ERASE_MS, START_SEC, partSeconds, writesWords } from './PartText.jsx';

const TRANSITION_MS = 200;

const MAX_DESC_SCALE = 2;
export default function WidgetView({ st, preview = false }) {
  const { style: s, headingText: ht } = st;
  const fromFeed = st.src !== 'manual';
  const previewItems = st.drafts?.[st.src] || st.items;
  const hideDescriptions = st.showFeedDescription === false;
  const descriptions = hideDescriptions ? [] : st.descriptions?.[st.src] || [];
  const imagesOff = st.showFeedMedia === false; // Images/videos off: none at all, from either source
  const itemMedia = imagesOff ? null : fromFeed ? (usesFeedMedia(st) ? st.media.rss : null) : st.media?.manual || [];
  const lines = previewItems
    .map((title, i) => ({ title, description: descriptions[i] || '', media: itemMedia?.[i] || null }))
    .filter((line) => line.title.trim());
  const items = lines.map((line) => line.title);

  const durationSec = Math.max(MIN_ITEM_SECONDS, st.behavior?.itemDuration || MIN_ITEM_SECONDS);
  const bodyTitleAnim = descAnimation(st.behavior?.headingAnim);
  const textWritesOn = writesWords(bodyTitleAnim);
  const transition = cardTransition(st.behavior?.transition, textWritesOn);
  const cardMoves = !['fade', 'none', 'sweep'].includes(transition);
  const eraseMs = !cardMoves && textWritesOn ? ERASE_MS : 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState('in');
  const [erasing, setErasing] = useState(false);
  const itemsKey = items.join('|');
  const headlineScroll = useRef({ ms: 0 });
  useEffect(() => { setActiveIndex(0); setPhase('in'); setErasing(false); }, [itemsKey]);
  useEffect(() => {
    const timers = [setTimeout(() => setPhase('hold'), 30)];
    if (items.length > 1) {
      const scrollMs = headlineScroll.current.ms;
      const holdMs = Math.max(durationSec * 1000, scrollMs ? SCROLL_READ_MS + scrollMs + SCROLL_END_MS + eraseMs : 0);
      if (eraseMs) timers.push(setTimeout(() => setErasing(true), holdMs - eraseMs));
      timers.push(setTimeout(() => setPhase('out'), holdMs));
      timers.push(setTimeout(() => {
        setErasing(false);
        setActiveIndex((i) => (i + 1) % items.length);
        setPhase('in');
      }, holdMs + TRANSITION_MS));
    }
    return () => timers.forEach(clearTimeout);
  }, [activeIndex, items.length, itemsKey, durationSec, eraseMs]);
  const summaryIndex = items.length ? Math.min(activeIndex, items.length - 1) : 0;
  const [sweeps, setSweeps] = useState(0);
  useEffect(() => { if (phase === 'out' && transition === 'sweep') setSweeps((n) => n + 1); }, [phase, transition]);
  const stageRef = useRef(null);
  useFitLines(stageRef, [summaryIndex, st]);
  useItemScroll(stageRef, headlineScroll, [summaryIndex, st]);

  const bodyTextColor = autoTextColor(s.bg);
  const bodyStyle = {
    background: s.bgGradient || s.bg,
    color: bodyTextColor,
    textShadow: textShadowFor(bodyTextColor),
    '--tex-speed': s.textureSpeed ?? 1,
  };
  const titleLineHeight = lineHeightFor('heading', s.textSpacing, ht);
  // The description in the title's style, a step lighter (and 2px smaller, CSS) so the title leads.
  const titleWeight = parseInt(ht.fontWeight, 10) || 400;
  const staticAnim = staticAnimation(st.behavior?.staticAnim);
  const staticStyle = {
    background: s.staticBg || '#FFFFFF',
    '--label-bg': s.staticBg || '#FFFFFF',
    color: s.staticColor || '#B5000F',
    textShadow: '0 .06em .08em rgba(0, 0, 0, .45)',
    textAlign: 'center',
    lineHeight: titleLineHeight,
    fontFamily: ht.fontFamily,
    fontWeight: 900,
  };
  const titleBodyStyle = {
    color: ht.color || bodyTextColor,
    textShadow: textShadowFor(ht.color || bodyTextColor),
    textAlign: bodyTitleAnim !== 'none' ? 'center' : ht.align,
    lineHeight: titleLineHeight,
    fontFamily: ht.fontFamily,
    fontWeight: ht.fontWeight,
    fontStyle: ht.fontStyle,
    textDecoration: ht.textDecoration,
  };
  const descStyle = { ...titleBodyStyle, fontWeight: Math.max(400, titleWeight - 300) };

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
  const eraseClass = erasing ? ' parts-erase' : '';
  const renderItem = (index, phase, ghost = false) => {
    const line = lines[index];
    const headline = line?.title || (fromFeed ? 'Validate a feed to show its items here' : 'Enter title here');
    const sample = preview && !line;
    const summary = line?.description || (sample && st.showFeedDescription !== false ? 'Enter description here' : '');
    const hasDescription = !!summary.trim();
    const titleSec = partSeconds(headline, bodyTitleAnim);
    const pace = Math.max(1, (titleSec + (hasDescription ? partSeconds(summary, bodyTitleAnim) : 0)) / (durationSec / 2));
    const standIn = s.badgeImage || placeholderThumb(line?.title || '');
    const image = imagesOff ? null : line?.media?.url || (feedMedia ? standIn : s.badgeImage) || (sample && feedMediaOn(st) ? standIn : null);
    return (
      <div
        key={ghost ? `ghost-${index}` : index}
        className={ghost ? 'widget-card-main widget-card-ghost' : `widget-card-main anim-${transition} phase-${phase}${eraseClass}`}
        aria-hidden={ghost || phase === 'out' || undefined}
      >
        <div className={'widget-card-body widget-card-body-' + badgePos}>
          {image && (
            <div className="widget-card-thumb-wrap">
              <div className="widget-card-thumb-frame">
                <img
                  key={image}
                  className={'widget-card-thumb' + (s.imageSlowZoom && !ghost ? ' slow-zoom' : '')}
                  style={s.imageSlowZoom ? { animationDuration: `${durationSec}s` } : undefined}
                  src={image}
                  alt=""
                  onLoad={(e) => { const img = e.currentTarget; if (img.naturalWidth) { const wrap = img.closest('.widget-card-thumb-wrap'); wrap.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`; wrap.style.setProperty('--ar', img.naturalWidth / img.naturalHeight); } }}
                  onError={(e) => { if (feedMedia && e.currentTarget.src !== standIn) e.currentTarget.src = standIn; }}
                />
              </div>
            </div>
          )}
          <div className="widget-card-copy">
            <div className="widget-card-copy-inner">
              <div className={'widget-card-summary widget-card-title-body' + (bodyTitleAnim === 'flashwrite' && !ghost ? ' has-descflash' : '')} style={titleBodyStyle}>
                <PartText className="widget-card-summary-text" text={headline} anim={ghost ? 'none' : bodyTitleAnim} pace={pace} />
                {bodyTitleAnim === 'flashwrite' && !ghost && <DescFlash start={START_SEC} seconds={titleSec / pace} />}
              </div>
              {hasDescription && (
                <div className={'widget-card-summary widget-card-copy-desc' + (bodyTitleAnim === 'flashwrite' && !ghost ? ' has-descflash' : '')} style={descStyle}>
                  {/* Written on once the title is. */}
                  <PartText className="widget-card-summary-text" text={summary} anim={ghost ? 'none' : bodyTitleAnim} delay={titleSec / pace} pace={pace} />
                  {bodyTitleAnim === 'flashwrite' && !ghost && <DescFlash start={START_SEC + titleSec / pace} seconds={partSeconds(summary, bodyTitleAnim) / pace} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="widget-frame widget-frame-card" style={bodyStyle}>
      {s.texture === 'video-custom' && s.customVideoMediaId ? (
        <GraphicVideo src={uploadStream(s.customVideoBase)} mediaId={s.customVideoMediaId} opacity={s.textureOpacity ?? 1} />
      ) : s.texture === 'video-custom' && s.customVideoUrl ? (
        <GraphicVideo src={s.customVideoUrl} opacity={s.textureOpacity ?? 1} />
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

      {transition === 'sweep' && sweeps > 0 && <span key={sweeps} className="widget-sweep" aria-hidden="true" />}
      <div className="widget-card-content">
        {/* Always on top, outside the items, so it stays put while they change; phase-hold runs its
            looping animation. Its top light, if on, runs along its top edge. */}
        <div className="widget-static-title phase-hold">
          <div className={'widget-card-headline' + (staticAnim === 'glintflash' ? ' heading-label' : '') + (s.topLight ? ' has-top-light' : '')} style={staticStyle}>
            <PartText className="widget-card-headline-text" text={(st.staticText ?? st.category)?.trim() || 'BREAKING NEWS'} anim={staticAnim} />
            {s.topLight && <span className="p-top-light" aria-hidden="true" />}
          </div>
        </div>
        <div className="widget-card-stage" ref={stageRef}>
          {renderItem(summaryIndex, phase)}
        </div>
        {/* Only with something in it: an empty footer would still take its gap, more room at the foot than the top. */}
        {(st.showTime || st.showProduct) && (
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
        )}
      </div>
    </div>
  );
}

// The item on screen: its title and description grow together, a tenth at a time up to
// MAX_DESC_SCALE, while they still fit its room whole (--desc-scale on the block) — a short one
// fills the card in big type; a long one stays at its size and scrolls up (useItemScroll).
function useFitLines(stageRef, deps) {
  useLayoutEffect(() => {
    const copy = stageRef.current?.querySelector('.widget-card-main:not(.widget-card-ghost) .widget-card-copy');
    if (!copy) return undefined;
    const overflows = () => copy.firstElementChild.offsetHeight > copy.clientHeight + 1;
    const fit = () => {
      if (copy.dataset.vscroll !== undefined) return; // already scrolling: leave it be
      copy.style.setProperty('--desc-scale', 1);
      let scale = 1;
      if (!overflows()) {
        for (let next = 1.1; next <= MAX_DESC_SCALE + 0.01; next = +(next + 0.1).toFixed(1)) {
          copy.style.setProperty('--desc-scale', next);
          if (overflows()) break;
          scale = next;
        }
      }
      copy.style.setProperty('--desc-scale', scale);
    };
    fit();
    let live = true;
    // Later changes (its image loading, a resize, the fonts) fit once a frame, not once each.
    let frame = 0;
    const refit = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(fit); };
    document.fonts?.ready.then(() => { if (live) refit(); });
    const observer = new ResizeObserver(refit);
    observer.observe(stageRef.current);
    const item = copy.closest('.widget-card-main');
    item.addEventListener('load', refit, true);
    return () => {
      live = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
      item.removeEventListener('load', refit, true);
    };
  }, [stageRef, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}

function DescFlash({ start, seconds }) {
  return <span className="desc-flash" aria-hidden="true" style={{ '--d': `${start.toFixed(3)}s`, '--t': `${Math.max(0.5, Math.min(1, seconds * 0.6)).toFixed(3)}s` }} />;
}

// An item's title and description longer than their room scroll up as one, once read a moment
// (SCROLL_READ_MS), at SCROLL_LINES lines a second, until the end shows — the item staying on screen
// for it and SCROLL_END_MS more. Measured as each item comes in, into `scrollRef` for the timers;
// only a real overhang (half a line or more) counts. The block slides as one piece — a transform.
const SCROLL_READ_MS = 2000;
const SCROLL_END_MS = 1200;
const SCROLL_LINES = 0.8;
function useItemScroll(stageRef, scrollRef, deps) {
  useLayoutEffect(() => {
    scrollRef.current = { ms: 0 };
    const copy = stageRef.current?.querySelector('.widget-card-main:not(.widget-card-ghost) .widget-card-copy');
    if (!copy) return undefined;
    let dist = 0;
    const measure = () => {
      const text = copy.querySelector('.widget-card-summary-text');
      const linePx = (text && parseFloat(getComputedStyle(text).lineHeight)) || 24;
      const over = Math.ceil(copy.firstElementChild.offsetHeight - copy.clientHeight);
      dist = over >= linePx / 2 ? over : 0;
      const ms = dist ? Math.max(600, (dist / (linePx * SCROLL_LINES)) * 1000) : 0;
      copy.style.setProperty('--vdist', `${dist}px`);
      copy.style.setProperty('--vms', `${Math.round(ms)}ms`);
      scrollRef.current = { ms };
    };
    measure();
    let live = true;
    let started = false;
    document.fonts?.ready.then(() => { if (live && !started) measure(); });
    // From the item's hold (30ms in) plus the read.
    const start = setTimeout(() => {
      started = true;
      if (dist) copy.dataset.vscroll = '';
    }, 30 + SCROLL_READ_MS);
    return () => { live = false; clearTimeout(start); };
  }, [stageRef, scrollRef, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
