import { useEffect, useState } from 'react';
import { autoTextColor } from '../utils.js';
import { TPLS } from '../data/templates.js';
import TickerView from './TickerView.jsx';

// Renders a Jacket: a full-bleed live-feed overlay matching broadcast
// convention — bottom-left logo + scrolling ticker headline, bottom-right
// time/weather box, and an optional vertical image panel pinned to the
// left or right edge. The main video area is a placeholder here — the
// real feed plays there on air.
export default function JacketView({ st, setSt }) {
  const { style: s, headlineText: ht } = st;
  const logoTextColor = autoTextColor(s.logoColor);
  const tagTextColor = autoTextColor(s.tagColor);
  const headlineStyle = {
    fontFamily: ht.fontFamily,
    fontSize: ht.fontSize,
    fontWeight: ht.fontWeight,
    fontStyle: ht.fontStyle,
    textDecoration: ht.textDecoration,
    textTransform: ht.textTransform,
  };

  // A jacket is a live on-air frame, not a dated item — the clock always
  // shows the current wall time, ticking every second.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const clockText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateText = now.toLocaleDateString([], { day: '2-digit', month: 'short' });

  // When both Time and Weather are on, the box flips between the two every
  // few seconds instead of cramming both into one line.
  const showTime = !!st.showTime;
  const showWeather = !!st.showWeather && !!st.weather;
  const [showingWeather, setShowingWeather] = useState(false);
  useEffect(() => {
    if (!(showTime && showWeather)) { setShowingWeather(false); return undefined; }
    const id = setInterval(() => setShowingWeather((v) => !v), 4000);
    return () => clearInterval(id);
  }, [showTime, showWeather]);
  const faceIsWeather = showWeather && (!showTime || showingWeather);

  // When a Ticker Style is picked, feed its template style/badge/text into
  // the real TickerView with the jacket's own headline as the single
  // scrolling item, so the headline strip is a genuine ticker bar instead
  // of a plain scrolling text clone.
  const tickerTpl = st.tickerTemplate && TPLS.find((t) => t.id === st.tickerTemplate);
  const tickerSt = tickerTpl ? {
    style: { ...tickerTpl.style, ...st.tickerStyleOverrides },
    badge: { ...tickerTpl.badge, ...st.tickerBadgeOverrides },
    text: tickerTpl.text,
    items: [st.headline || 'Enter a headline'],
    behavior: { speed: 2, mode: 'loop', animation: 'fade', itemDuration: 5 },
  } : null;

  // Drag the panel's free edge to resize it live in the preview, instead of
  // only offering a numeric field — percentage of the frame's relevant
  // axis (width for left/right, height for top), clamped to a sane range.
  const panelSize = st.imagePanelSize ?? 26;
  const startResize = (e) => {
    e.preventDefault();
    const frame = e.currentTarget.closest('.jacket-frame');
    const rect = frame.getBoundingClientRect();
    const onMove = (ev) => {
      let pct;
      if (st.imagePanelPos === 'top') {
        pct = ((ev.clientY - rect.top) / rect.height) * 100;
      } else if (st.imagePanelPos === 'right') {
        pct = ((rect.right - ev.clientX) / rect.width) * 100;
      } else {
        pct = ((ev.clientX - rect.left) / rect.width) * 100;
      }
      setSt((s) => ({ ...s, imagePanelSize: Math.min(60, Math.max(10, Math.round(pct))) }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const showLogoBlock = !!(st.showLogo && (st.logoImage || st.logoText || st.logoSubtext || st.tagText));
  const logoPos = st.logoPos || 'bottom-left';
  const logoContent = (
    <>
      {st.logoImage ? (
        <img className="jacket-logo-img" src={st.logoImage} alt="" />
      ) : (
        st.logoText && <span className="jacket-logo-text">{st.logoText}</span>
      )}
      {st.logoSubtext && <span className="jacket-logo-subtext">{st.logoSubtext}</span>}
      {st.tagText && (
        <span className="jacket-logo-tag" style={{ background: s.tagColor, color: tagTextColor }}>{st.tagText}</span>
      )}
    </>
  );

  return (
    <div className="jacket-frame">
      <div
        className={'jacket-video-area' + (st.sideImage ? ' jacket-video-area-' + st.imagePanelPos : '')}
        style={st.sideImage ? { '--jacket-panel-size': `${panelSize}%` } : undefined}
      >
        {st.mainVideoUrl ? (
          <video className="jacket-video-el" src={st.mainVideoUrl} autoPlay loop muted playsInline />
        ) : (
          <span className="jacket-live-hint">Live feed shows here</span>
        )}
      </div>

      {st.sideImage && (
        <div
          className={'jacket-side-panel jacket-side-panel-' + st.imagePanelPos}
          style={{ '--jacket-panel-size': `${panelSize}%` }}
        >
          <img className="jacket-side-panel-img" src={st.sideImage} alt="" />
          <div className={'jacket-panel-handle jacket-panel-handle-' + st.imagePanelPos} onMouseDown={startResize} title="Drag to resize" />
        </div>
      )}

      {showLogoBlock && logoPos !== 'bottom-left' && (
        <div className={'jacket-logo-block jacket-logo-floating jacket-logo-floating-' + logoPos} style={{ background: s.logoGradient || s.logoColor, color: logoTextColor }}>
          {logoContent}
        </div>
      )}

      <div className="jacket-bottom-bar">
        {showLogoBlock && logoPos === 'bottom-left' && (
          <div className="jacket-logo-block" style={{ background: s.logoGradient || s.logoColor, color: logoTextColor }}>
            {logoContent}
          </div>
        )}

        {st.showHeadline && (
          tickerSt ? (
            <div className="jacket-ticker-real">
              <TickerView st={tickerSt} />
            </div>
          ) : (
            <div className="jacket-ticker">
              <div className="jacket-ticker-track">
                {[0, 1].map((rep) => (
                  <span key={rep} className="jacket-ticker-inner" style={headlineStyle}>
                    {st.headline || 'Enter a headline'}
                    <span className="jacket-ticker-sep">◆</span>
                  </span>
                ))}
              </div>
            </div>
          )
        )}

        {(showTime || showWeather) && (
          <div className="jacket-time-box" style={{ background: s.timeColor, color: autoTextColor(s.timeColor) }}>
            {faceIsWeather ? (
              <>
                <span className="jacket-time-main">{st.weather}</span>
                <span className="jacket-time-zone">WEATHER</span>
              </>
            ) : (
              <>
                <span className="jacket-time-main">{clockText}</span>
                <span className="jacket-time-zone">{dateText}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
