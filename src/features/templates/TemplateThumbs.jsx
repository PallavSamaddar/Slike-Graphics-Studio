import { autoTextColor } from '../../utils/color.js';

export function TickerThumb({ t, lines = ['Breaking news from India', 'Markets hit record high'] }) {
  const m = t.mini;
  return (
    <div className="tpl-preview-bg gallery-preview-bg">
      <div className="mini-ticker" style={{ background: m.bg, borderTop: m.border || 'none' }}>
        {m.bb && (
          <div className={'mini-badge' + (t.style.badgeShape === 'wedge' ? ' mini-badge-wedge' : '')} style={{ background: m.bb, color: m.bt }}>
            {t.badge.type === 'LIVE' && <div className="mini-dot" style={{ background: 'rgba(255,255,255,0.8)' }}></div>}
            {m.badge}
          </div>
        )}
        <div className="mini-text" style={{ color: m.tc, fontFamily: t.text.fontFamily, fontWeight: t.text.fontWeight }}>
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 && <span className="mini-sep" style={{ color: m.tc }}> ◆ </span>}
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WidgetThumb({ t, heading = 'News Heading', line = 'Enter description here' }) {
  const bodyTextColor = autoTextColor(t.style.bg);
  const headingTextColor = autoTextColor(t.style.headingBg);
  return (
    <div className="widget-mini" style={{ background: t.style.bgGradient || t.style.bg }}>
      <div className={'widget-texture-' + (t.style.texture || 'none')} style={{ opacity: t.style.textureOpacity ?? 1 }} />
      <div className="widget-mini-heading" style={{ background: t.style.headingBgGradient || t.style.headingBg, color: headingTextColor }}>
        {heading}
      </div>
      <div className={'widget-mini-body' + (t.style.badgeImagePos ? ' widget-mini-body-badge-' + t.style.badgeImagePos : '')}>
        <span className="widget-mini-desc" style={{ color: bodyTextColor }}>{line}</span>
        {t.style.badgeImagePos && (
          <div className={'widget-mini-badge-img widget-mini-badge-img-placeholder widget-mini-badge-img-' + t.style.badgeImagePos}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.2" /><path d="M6 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /></svg>
          </div>
        )}
      </div>
    </div>
  );
}

export function JacketThumb({ t }) {
  return (
    <div className="jacket-mini">
      <div className="jacket-mini-video" />
      <div className="jacket-mini-inset" />
      <div className="jacket-mini-bar">
        <span className="jacket-mini-logo" style={{ background: t.style.logoGradient || t.style.logoColor, color: autoTextColor(t.style.logoColor) }}>TOI</span>
        <span className="jacket-mini-ticker" />
        <span className="jacket-mini-time" style={{ background: t.style.timeColor, color: autoTextColor(t.style.timeColor) }} />
      </div>
    </div>
  );
}

// The thumbnail for a template of a given kind.
export const THUMBS = { ticker: TickerThumb, widget: WidgetThumb, jacket: JacketThumb };
