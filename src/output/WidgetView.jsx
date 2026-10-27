import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { autoTextColor, parseColor, textShadowFor } from '../utils/color.js';
import { placeholderThumb } from '../utils/placeholderThumb.js';
import { MIN_ITEM_SECONDS, feedMediaOn, lineHeightFor, usesFeedMedia } from '../constants/widgetTemplates.js';
import { descAnimation, headingAnimation, staticAnimation, widgetTransition } from '../constants/textAnimations.js';
import ParticleField from './ParticleField.jsx';
import GlobeOrbit from './GlobeOrbit.jsx';
import GraphicVideo, { uploadStream } from './GraphicVideo.jsx';
import PartText, { ERASE_MS, START_SEC, partSeconds, writesWords } from './PartText.jsx';

const TRANSITION_MS = 200;

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
  // The Descriptions and Images/videos ticks hold for both sources (a design may start with them off).
  const hideDescriptions = st.showFeedDescription === false;
  const descriptions = hideDescriptions ? [] : st.descriptions?.[st.src] || [];
  const imagesOff = !fromFeed && st.showFeedMedia === false;
  const itemMedia = fromFeed ? (usesFeedMedia(st) ? st.media.rss : null) : imagesOff ? null : st.media?.manual || [];
  const lines = previewItems
    .map((title, i) => ({ title, description: descriptions[i] || '', media: itemMedia?.[i] || null }))
    .filter((line) => line.title.trim());
  const items = lines.map((line) => line.title);

  const transition = widgetTransition(st.behavior?.transition);
  const durationSec = Math.max(MIN_ITEM_SECONDS, st.behavior?.itemDuration || MIN_ITEM_SECONDS);
  const headingAnim = headingAnimation(st.behavior?.headingAnim);
  const descAnim = descAnimation(st.behavior?.descAnim);
  // With a static title the items' titles sit in the body: the heading's animation is one of the body's.
  const bodyTitleAnim = descAnimation(st.behavior?.headingAnim);
  // Static title only while descriptions are off.
  const staticTitle = !!st.staticTitle && st.showFeedDescription === false;
  const eraseMs = writesWords(headingAnim) || writesWords(descAnim) || (staticTitle && writesWords(bodyTitleAnim)) ? ERASE_MS : 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState('in');
  const [erasing, setErasing] = useState(false);
  const itemsKey = items.join('|');
  // How long this item's heading takes to scroll (useHeadlineScroll measures it before the timers start).
  const headlineScroll = useRef({ ms: 0 });
  useEffect(() => { setActiveIndex(0); setPhase('in'); setErasing(false); }, [itemsKey]);
  useEffect(() => {
    const timers = [setTimeout(() => setPhase('hold'), 30)];
    if (items.length > 1) {
      // A heading that scrolls gets the time for it: read, scroll, a moment at its end, then out.
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
  useFitLines(stageRef, st);
  useHeadlineScroll(stageRef, headlineScroll, [summaryIndex, st]);

  const bodyTextColor = autoTextColor(s.bg);
  const headingTextColor = autoTextColor(s.headingBg);
  const bodyStyle = {
    background: s.bgGradient || s.bg,
    color: bodyTextColor,
    textShadow: textShadowFor(bodyTextColor),
    '--tex-speed': s.textureSpeed ?? 1,
  };
  const headingBar = !!s.headingBgGradient || (!!s.headingBg && s.headingBg !== 'transparent' && parseColor(s.headingBg).a > 0);
  // Top light: along the heading bar's top edge, or the card's when the heading has no bar.
  const lightOnHeading = !!s.topLight && headingBar;
  const descBg = s.descBgGradient || s.descBg;
  const itemStyle = {
    color: bt.color || bodyTextColor,
    textShadow: textShadowFor(bt.color || bodyTextColor),
    background: descBg || undefined,
    textAlign: descAnim !== 'none' ? 'center' : bt.align, // animated text is always centred
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
    textAlign: headingAnim !== 'none' ? 'center' : ht.align,
    lineHeight: lineHeightFor('heading', s.textSpacing, ht),
    fontFamily: ht.fontFamily,
    fontWeight: ht.fontWeight,
    fontStyle: ht.fontStyle,
    textDecoration: ht.textDecoration,
    // Glitch + fire flash is light on coloured letters (India TV's title): a white label, red letters.
    ...(headingAnim === 'glintflash' && { background: '#FFFFFF', color: '#B5000F', textShadow: 'none' }),
  };
  // "Static title" (st.staticTitle, for items with no description): the Heading text (category) as
  // a fixed title label above the items — BREAKING NEWS if none is set — with its own colours and
  // looping animation (style.staticBg / staticColor, behavior.staticAnim), and each item's title
  // under it in the description's place, large, in the heading's colours, font and animation; as
  // on a breaking-news box.
  const staticAnim = staticAnimation(st.behavior?.staticAnim);
  const staticStyle = {
    background: s.staticBg || '#FFFFFF',
    '--label-bg': s.staticBg || '#FFFFFF',
    color: s.staticColor || '#B5000F',
    textShadow: 'none',
    textAlign: 'center',
    lineHeight: headingStyle.lineHeight,
    fontFamily: ht.fontFamily,
    fontWeight: ht.fontWeight,
  };
  const titleBodyStyle = {
    color: ht.color || bodyTextColor,
    textShadow: textShadowFor(ht.color || bodyTextColor),
    background: s.headingBgGradient || s.headingBg || undefined,
    textAlign: bodyTitleAnim !== 'none' ? 'center' : ht.align,
    lineHeight: headingStyle.lineHeight,
    fontFamily: ht.fontFamily,
    fontWeight: ht.fontWeight,
    fontStyle: ht.fontStyle,
    textDecoration: ht.textDecoration,
  };

  const feedMedia = fromFeed && itemMedia;
  const badgePos = (feedMedia ? itemMedia.find(Boolean)?.pos : s.badgeImagePos) || 'left';
  // The image an item shows, if any (the item's own, or the stand-in / badge image).
  const imageFor = (index) => {
    if (imagesOff) return null;
    const line = lines[index];
    const standIn = s.badgeImage || placeholderThumb(line?.title || '');
    return line?.media?.url || (feedMedia ? standIn : s.badgeImage) || (preview && !line && feedMediaOn(st) ? standIn : null);
  };

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
  // Its own string, not inside the template below, so the on-air build's CSS pruning sees it.
  const eraseClass = erasing ? ' parts-erase' : '';
  const renderItem = (index, phase, ghost = false) => {
    const line = lines[index];
    const headline = line?.title || (fromFeed ? 'Validate a feed to show its items here' : 'Enter title here');
    const sample = preview && !line;
    const summary = line?.description || (sample && st.showFeedDescription !== false ? 'Enter description here' : '');
    const hasDescription = !!summary.trim();
    const asBody = staticTitle && !hasDescription; // the title shown under the static title label
    const headingSec = asBody ? 0 : partSeconds(headline, headingAnim);
    const pace = Math.max(1, (headingSec + (hasDescription ? partSeconds(summary, descAnim) : asBody ? partSeconds(headline, bodyTitleAnim) : 0)) / (durationSec / 2));
    const standIn = s.badgeImage || placeholderThumb(line?.title || '');
    const image = imagesOff ? null : line?.media?.url || (feedMedia ? standIn : s.badgeImage) || (sample && feedMediaOn(st) ? standIn : null);
    return (
      <div
        key={ghost ? `ghost-${index}` : index}
        className={ghost ? 'widget-card-main widget-card-ghost' : `widget-card-main anim-${transition} phase-${phase}${eraseClass}`}
        aria-hidden={ghost || phase === 'out' || undefined}
      >
        {!asBody && <div className={'widget-card-headline' + (lightOnHeading ? ' has-top-light' : '') + (headingAnim === 'flash' && !ghost ? ' has-flash' : '') + (headingAnim === 'glintflash' ? ' heading-label' : '')} style={headingStyle}>
          {/* With a description under it, the heading keeps to one line and scrolls (useHeadlineScroll). */}
          {hasDescription ? (
            <span className="headline-scroll">
              <PartText className="widget-card-headline-text headline-scroll-text" text={headline} anim={ghost ? 'none' : headingAnim} pace={pace} />
            </span>
          ) : (
            <PartText className="widget-card-headline-text" text={headline} anim={ghost ? 'none' : headingAnim} pace={pace} />
          )}
          {headingAnim === 'flash' && !ghost && <HeadingFlash start={START_SEC} seconds={headingSec / pace} />}
          {lightOnHeading && !ghost && <span className="p-top-light" aria-hidden="true" />}
        </div>}
        {(hasDescription || image || asBody) && (
          <>
            {!asBody && <div className="widget-card-divider" />}
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
              {asBody && (
                <div className={'widget-card-summary widget-card-title-body' + (bodyTitleAnim === 'flashwrite' && !ghost ? ' has-descflash' : '')} style={titleBodyStyle}>
                  <PartText className="widget-card-summary-text" text={headline} anim={ghost ? 'none' : bodyTitleAnim} pace={pace} />
                  {bodyTitleAnim === 'flashwrite' && !ghost && <DescFlash start={START_SEC} seconds={partSeconds(headline, bodyTitleAnim) / pace} />}
                </div>
              )}
              {hasDescription && (
                <div className={'widget-card-summary' + (descBg ? ' has-bg' : '') + (descAnim === 'flashwrite' && !ghost ? ' has-descflash' : '')} style={itemStyle}>
                  {/* Written on once its heading is. */}
                  <PartText className="widget-card-summary-text" text={summary} anim={ghost ? 'none' : descAnim} delay={headingSec / pace} pace={pace} />
                  {descAnim === 'flashwrite' && !ghost && <DescFlash start={START_SEC + headingSec / pace} seconds={partSeconds(summary, descAnim) / pace} />}
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

      {s.topLight && !headingBar && <span className="p-top-light" aria-hidden="true" />}
      {transition === 'sweep' && sweeps > 0 && <span key={sweeps} className="widget-sweep" aria-hidden="true" />}
      <div className="widget-card-content">
        {staticTitle ? (
          // Outside the items, so it stays put while they change; phase-hold runs its looping animation.
          // Laid out like the body under it, so it sits over the title and is centred on it: beside
          // the image's room when the item shows one.
          <div className={'widget-static-title phase-hold' + (imageFor(summaryIndex) ? ` widget-card-body widget-card-body-${badgePos}` : '')}>
            {imageFor(summaryIndex) && <div className="widget-card-thumb-wrap" aria-hidden="true" />}
            <div className={'widget-card-headline' + (staticAnim === 'glintflash' ? ' heading-label' : '')} style={staticStyle}>
              <PartText className="widget-card-headline-text" text={st.staticText?.trim() || st.category?.trim() || 'BREAKING NEWS'} anim={staticAnim} />
            </div>
          </div>
        ) : fromFeed && st.category?.trim() && (
          <span className="widget-card-category">
            <span className="widget-card-category-dot" />
            {st.category}
          </span>
        )}
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

// The heading's "Flash + light sweep" (behavior.headingAnim 'flash'), across its whole bar: as the
// words are written on (from `start`, over `seconds`), a flash of light — a white-hot core in a
// warm glow, with a streak through it — crosses the bar just ahead of them; once they are on, a
// band of white light sweeps across the bar every few seconds until the heading goes.
function HeadingFlash({ start, seconds }) {
  return (
    <>
      <span className="heading-flash" aria-hidden="true" style={{ '--d': `${start.toFixed(3)}s`, '--t': `${seconds.toFixed(3)}s` }} />
      <span className="heading-sweep" aria-hidden="true" style={{ '--d': `${(start + seconds + 0.4).toFixed(3)}s` }} />
    </>
  );
}

// The description's "Flash + write on" (behavior.descAnim 'flashwrite', as in the body of India TV's
// breaking-news box): as its words are written on (from `start`, over `seconds`), a big flash of
// light — a warm glow round a white-hot core — crosses it, ahead of the words.
function DescFlash({ start, seconds }) {
  return <span className="desc-flash" aria-hidden="true" style={{ '--d': `${start.toFixed(3)}s`, '--t': `${Math.max(0.5, Math.min(1, seconds * 0.6)).toFixed(3)}s` }} />;
}

// A heading with a description under it keeps to one line, a longer one ending in …; once it has
// been read a moment (SCROLL_READ_MS) it scrolls, like the ticker, until its end shows, at
// SCROLL_EMS of its font size a second — the item staying on screen long enough for that and
// SCROLL_END_MS at its end. Measured as each item comes in, into `scrollRef` for the timers. It
// shows its … until the scroll starts; then (data-scrolling) the words slide as one piece — a
// transform, so the scroll is smooth.
const SCROLL_READ_MS = 2000;
const SCROLL_END_MS = 1200;
const SCROLL_EMS = 2.5;
function useHeadlineScroll(stageRef, scrollRef, deps) {
  useLayoutEffect(() => {
    scrollRef.current = { ms: 0 };
    const box = stageRef.current?.querySelector('.widget-card-main:not(.widget-card-ghost) .headline-scroll');
    if (!box) return undefined;
    const measure = () => {
      const dist = Math.max(0, Math.ceil(box.scrollWidth - box.clientWidth));
      const fontPx = parseFloat(getComputedStyle(box).fontSize) || 16;
      const ms = dist ? Math.max(600, (dist / (fontPx * SCROLL_EMS)) * 1000) : 0;
      scrollRef.current = { ms };
      box.style.setProperty('--scroll-dist', `${dist}px`);
      box.style.setProperty('--scroll-ms', `${Math.round(ms)}ms`);
      return dist;
    };
    const dist = measure();
    let live = true;
    document.fonts?.ready.then(() => { if (live && !box.dataset.scrolling) measure(); });
    // From the item's hold (30ms in) plus the read.
    const start = dist ? setTimeout(() => { box.dataset.scrolling = ''; }, 30 + SCROLL_READ_MS) : null;
    return () => { live = false; clearTimeout(start); };
  }, [stageRef, scrollRef, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
