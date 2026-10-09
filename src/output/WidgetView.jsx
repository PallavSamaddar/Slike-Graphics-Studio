import { useEffect, useState } from 'react';
import { autoTextColor } from '../utils/color.js';
import { placeholderThumb } from '../utils/placeholderThumb.js';
import ParticleField from './ParticleField.jsx';
import GlobeOrbit from './GlobeOrbit.jsx';
import VideoBackground from './VideoBackground.jsx';
import ImageCropperModal from '../features/shared-editor/ImageCropperModal.jsx';
import { useMediaUpload } from '../hooks/useMediaUpload.js';
import newsBackgroundVideo from '../assets/news-background.mp4';
import redeBgVideo from '../assets/rede-bg.mp4';
import redBackgroundVideo from '../assets/red-background.mp4';

const VIDEO_TEXTURES = {
  'video-news': newsBackgroundVideo,
  'video-rede': redeBgVideo,
  'video-red': redBackgroundVideo,
};

// Renders the news-card widget: a category pill, headline, divider, summary
// text, and a time/product footer over a solid/gradient/textured background.
// Shared by the in-editor preview.
export default function WidgetView({ st, setSt, viewTab }) {
  const { style: s, headingText: ht, bodyText: bt } = st;

  // Prefer whatever tab is currently open in the editor (a draft, not yet
  // committed via Save) so edits show up immediately here — same live-preview
  // feel as every other control.
  const previewSrc = viewTab || st.src;
  const previewHeadlineFromFeed = previewSrc !== 'manual';
  const previewItems = (st.drafts && st.drafts[previewSrc]) || (previewSrc === st.src ? st.items : []);
  const rawItems = previewItems.filter((x) => x.trim());
  // Feed/JSON drafts always keep their first line as the headline (it's
  // sliced out of `st.items` on commit, but the raw draft list still has it
  // at index 0) — description lines start at index 1. Manual has no
  // separate headline line; its drafts are all description.
  const descStart = previewHeadlineFromFeed ? 1 : 0;
  const items = rawItems.slice(descStart);
  const [cropSrc, setCropSrc] = useState(null);
  const upload = useMediaUpload();
  const [cropFileName, setCropFileName] = useState('');

  // Cycle through description lines every `itemDuration` seconds, per the
  // chosen Text Animation — otherwise those controls would have nothing to
  // animate/duration since the card only ever showed one static line. Loops
  // continuously (unlike the ticker's SingleItemTicker, which stops at the
  // last item) since a widget has no natural "end".
  const animation = st.behavior?.animation || 'fade';
  const durationSec = Math.max(1, st.behavior?.itemDuration || 4);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animPhase, setAnimPhase] = useState('in');
  const itemsKey = items.join('|');
  useEffect(() => { setActiveIndex(0); setAnimPhase('in'); }, [itemsKey]);
  useEffect(() => {
    const holdMs = durationSec * 1000;
    const transMs = 420;
    const inMs = animation === 'typewriter' ? 620 : 30;
    setAnimPhase('in');
    const t1 = setTimeout(() => setAnimPhase('hold'), inMs);
    // Nothing to cycle to with 0-1 items — hold there instead of scheduling
    // the out/rotate timers, which would otherwise fade it back out forever.
    if (items.length < 2) return () => clearTimeout(t1);
    const t2 = setTimeout(() => setAnimPhase('out'), holdMs);
    const t3 = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % items.length);
      setAnimPhase('in');
    }, holdMs + transMs);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [activeIndex, items.length, itemsKey, durationSec, animation]);
  const summaryIndex = items.length ? Math.min(activeIndex, items.length - 1) : 0;

  // Per-item media (Feed/JSON sources can attach a different image to each
  // headline) — resolves to whichever line is currently showing.
  const itemMedia = (previewSrc === 'rss' || previewSrc === 'json') ? (st.media && st.media[previewSrc]) : null;
  const activeMedia = itemMedia ? itemMedia[descStart + summaryIndex] : null;

  const handleBadgeUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
    setCropFileName(file.name.replace(/\.[^.]+$/, ''));
    e.target.value = '';
  };

  const handleCropConfirm = (croppedDataUrl, name) => {
    setCropSrc(null);
    upload({ file: croppedDataUrl, label: name, setSt, path: 'style.badgeImage', local: croppedDataUrl, fields: { 'style.badgeImage': croppedDataUrl, 'style.badgeImageName': name } });
  };

  // Body and heading text both auto-contrast against their background
  // instead of being separately configured, so they always stay legible.
  // For a gradient heading there's no single color to test — fall back to
  // the solid headingBg, which is always kept in sync alongside it.
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
    fontSize: bt.fontSize,
    fontWeight: bt.fontWeight,
    fontStyle: bt.fontStyle,
    textDecoration: bt.textDecoration,
  };
  const headingStyle = {
    background: s.headingBgGradient || s.headingBg,
    color: headingTextColor,
    fontFamily: ht.fontFamily,
    fontSize: ht.fontSize,
    fontWeight: ht.fontWeight,
    fontStyle: ht.fontStyle,
    textDecoration: ht.textDecoration,
    textAlign: ht.textAlign,
  };

  const effectiveBadgeImage = activeMedia ? placeholderThumb(items[summaryIndex] || '') : s.badgeImage;
  const badgePos = (activeMedia ? activeMedia.pos : s.badgeImagePos) || 'left';
  const showBadgeSlot = !!(effectiveBadgeImage || (!itemMedia && s.badgeImagePos));

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
  const headline = (previewHeadlineFromFeed ? rawItems[0] : st.heading) || 'News Heading';
  // Shows one line at a time (never joined), cycling on a timer through every
  // description line, per the Text Animation/Duration controls.
  const summary = items[summaryIndex] || 'Enter description here';

  return (
    <div className="widget-frame widget-frame-card" style={bodyStyle}>
      {/* Texture rendered as its own layer so it never gets clobbered by
          the `background` shorthand above (color/gradient can change
          independently of which texture is layered on top). Textures are
          drawn in white by default; textureColor tints them via a
          color-mode overlay (or, for real DOM particles, directly), and
          textureOpacity controls the layer's intensity — applied inline
          per-element rather than via a wrapper, so it doesn't disturb the
          `.widget-body > [class^="widget-texture-"]` drift-animation
          selector, which relies on the texture div being a direct child. */}
      {s.texture === 'video-custom' && s.customVideoUrl ? (
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
        <div className="widget-card-top">
          <div className="widget-card-headline-col">
            {st.showCategory && st.category && (
              <span className="widget-card-category">
                <span className="widget-card-category-dot" />
                {st.category}
              </span>
            )}
            <div className="widget-card-headline" style={headingStyle}>{headline}</div>
          </div>
        </div>
        <div className="widget-card-divider" />
        <div className={'widget-card-body' + (showBadgeSlot ? ' widget-card-body-' + badgePos : '')}>
          {showBadgeSlot && (
            effectiveBadgeImage ? (
              <img className="widget-card-thumb" src={effectiveBadgeImage} alt="" />
            ) : (
              <label className="widget-card-thumb widget-card-thumb-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <input type="file" accept="image/*" hidden onChange={handleBadgeUpload} />
              </label>
            )
          )}
          <div key={summaryIndex} className={`widget-card-summary anim-${animation} phase-${animPhase}`} style={itemStyle}>{summary}</div>
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

      {cropSrc && (
        <ImageCropperModal src={cropSrc} fileName={cropFileName} onCancel={() => setCropSrc(null)} onConfirm={handleCropConfirm} />
      )}
    </div>
  );
}
