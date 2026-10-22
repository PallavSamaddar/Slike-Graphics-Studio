import { useEffect, useState } from 'react';
import { autoTextColor, textShadowFor } from '../utils/color.js';
import { TPLS } from '../constants/tickerTemplates.js';
import TickerView from './TickerView.jsx';
import CleoVideoBackground from './CleoVideoBackground.jsx';
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
    textShadow: textShadowFor('#FFD400'), // the headline's yellow on the black bar
  };

  const showTime = !!st.showTime;
  const showWeather = !!st.showWeather && !!st.weather;

  const tickerTpl = st.tickerTemplate && TPLS.find((t) => t.id === st.tickerTemplate);
  const tickerSt = tickerTpl ? {
    template: tickerTpl.id,
    style: { ...tickerTpl.style, ...st.tickerStyleOverrides },
    badge: { ...tickerTpl.badge, ...st.tickerBadgeOverrides },
    text: tickerTpl.text,
    items: [st.headline || 'Enter a headline'],
    behavior: { speed: 2, mode: 'loop', animation: 'fade', itemDuration: 5 },
  } : null;

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
        <span className="jacket-logo-tag" style={{ background: s.tagColor, color: tagTextColor, textShadow: textShadowFor(tagTextColor) }}>{st.tagText}</span>
      )}
    </>
  );

  return (
    <div className="jacket-frame">
      <div
        className={'jacket-video-area' + (st.sideImage ? ' jacket-video-area-' + st.imagePanelPos : '')}
        style={st.sideImage ? { '--jacket-panel-size': `${panelSize}%` } : undefined}
      >
        {/* A video picked from the uploads plays from its media id; one uploaded here, from its URL.
            (mainVideoPreset marks the stock videos the app used to bundle — gone now.) */}
        {st.mainVideoMediaId ? (
          <CleoVideoBackground mediaId={st.mainVideoMediaId} className="jacket-video-el" />
        ) : st.mainVideoUrl && !st.mainVideoPreset ? (
          <CleoVideoBackground src={st.mainVideoUrl} className="jacket-video-el" />
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
        <div className={'jacket-logo-block jacket-logo-floating jacket-logo-floating-' + logoPos} style={{ background: s.logoGradient || s.logoColor, color: logoTextColor, textShadow: textShadowFor(logoTextColor) }}>
          {logoContent}
        </div>
      )}

      <div className="jacket-bottom-bar">
        {showLogoBlock && logoPos === 'bottom-left' && (
          <div className="jacket-logo-block" style={{ background: s.logoGradient || s.logoColor, color: logoTextColor, textShadow: textShadowFor(logoTextColor) }}>
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
          <div className="jacket-time-box" style={{ background: s.timeColor, color: autoTextColor(s.timeColor), textShadow: textShadowFor(autoTextColor(s.timeColor)) }}>
            <TimeBoxFace showTime={showTime} weather={showWeather ? st.weather : ''} />
          </div>
        )}
      </div>
    </div>
  );
}

const clockNow = () => {
  const now = new Date();
  return {
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    date: now.toLocaleDateString([], { day: '2-digit', month: 'short' }),
  };
};

// The time box's face: the clock, the weather, or the two taking turns every 4s. Its own
// component, so its ticks redraw only this box, not the whole jacket (ticker, video, panel);
// the clock is kept as its text, so a tick redraws only when the minute changes.
function TimeBoxFace({ showTime, weather }) {
  const [clock, setClock] = useState(clockNow);
  useEffect(() => {
    if (!showTime) return undefined;
    const id = setInterval(() => setClock((c) => {
      const next = clockNow();
      return next.time === c.time && next.date === c.date ? c : next;
    }), 1000);
    return () => clearInterval(id);
  }, [showTime]);

  const [showingWeather, setShowingWeather] = useState(false);
  useEffect(() => {
    if (!(showTime && weather)) { setShowingWeather(false); return undefined; }
    const id = setInterval(() => setShowingWeather((v) => !v), 4000);
    return () => clearInterval(id);
  }, [showTime, weather]);

  return weather && (!showTime || showingWeather) ? (
    <>
      <span className="jacket-time-main">{weather}</span>
      <span className="jacket-time-zone">WEATHER</span>
    </>
  ) : (
    <>
      <span className="jacket-time-main">{clock.time}</span>
      <span className="jacket-time-zone">{clock.date}</span>
    </>
  );
}
