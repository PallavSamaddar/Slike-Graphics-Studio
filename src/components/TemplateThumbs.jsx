import { autoTextColor } from '../utils.js';

// The template thumbnails, as the gallery and home have always drawn them. They are
// pictures of the output (no Player Console design); only the card around them is the
// system's (ChooserCard).

export function TickerThumb({ t }) {
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
          Breaking news from India <span className="mini-sep" style={{ color: m.tc }}>◆</span> Markets hit record high
        </div>
      </div>
    </div>
  );
}

export function WidgetThumb({ t }) {
  const bodyTextColor = autoTextColor(t.style.bg);
  const headingTextColor = autoTextColor(t.style.headingBg);
  return (
    <div className="widget-mini" style={{ background: t.style.bgGradient || t.style.bg }}>
      <div className={'widget-texture-' + (t.style.texture || 'none')} style={{ opacity: t.style.textureOpacity ?? 1 }} />
      <div className="widget-mini-heading" style={{ background: t.style.headingBgGradient || t.style.headingBg, color: headingTextColor }}>
        News Heading
      </div>
      <div className={'widget-mini-body' + (t.style.badgeImagePos ? ' widget-mini-body-badge-' + t.style.badgeImagePos : '')}>
        <span className="widget-mini-desc" style={{ color: bodyTextColor }}>Enter description here</span>
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

// A template as a chooser card: its picture, then its name, a one-word fact and its ⋯.
export function TemplateCard({ name, reach, onOpen, menu, children }) {
  return (
    <div
      className="dlg-card tpl-choice"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen(); } }}
    >
      <div className="tpl-thumb">{children}</div>
      <div className="dc-top">
        <span className="dc-title">{name}</span>
        {reach && <span className="dc-reach">{reach}</span>}
        {menu}
      </div>
    </div>
  );
}

// "Start from scratch" as the chooser's create card.
export function ScratchCard({ onOpen }) {
  return (
    <button type="button" className="dlg-card create tpl-choice" onClick={onOpen}>
      <div className="dc-plus">+</div>
      <div className="dc-title">Start from scratch</div>
    </button>
  );
}
