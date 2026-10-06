import { useState } from 'react';
import { TPLS } from '../data/templates.js';
import { WIDGET_TPLS } from '../data/widgetTemplates.js';
import { JACKET_TPLS } from '../data/jacketTemplates.js';
import { autoTextColor } from '../utils.js';
import ThemeToggle from './ThemeToggle.jsx';
import UserMenu from './UserMenu.jsx';
import CardMenu from './CardMenu.jsx';

// Which templates to feature on the home dashboard, and what usage badge
// (if any) to show on each — static for now, no real usage tracking yet.
const FEATURED_TICKERS = [
  { id: 'classic', badge: 'Most used' },
  { id: 'gradient', badge: 'Recently used' },
  { id: 'breaking', badge: null },
];
const FEATURED_WIDGETS = [
  { id: 'crimson-dots', badge: 'Recently used' },
  { id: 'midnight-solid', badge: null },
  { id: 'paper-light', badge: null },
  { id: 'crimson-image-left', badge: null },
  { id: 'midnight-image-right', badge: null },
  { id: 'emerald-globe', badge: null },
];
const FEATURED_JACKETS = [
  { id: 'crimson-global', badge: null },
  { id: 'midnight-global', badge: null },
  { id: 'charcoal-global', badge: null },
  { id: 'emerald-global', badge: null },
];

export default function HomeDashboard({ onPickTicker, onPickWidget, onPickJacket, onSeeAllTicker, onSeeAllWidgets, onSeeAllJackets, theme, onToggleTheme }) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const tickerCards = FEATURED_TICKERS
    .map((f) => ({ f, t: TPLS.find((tpl) => tpl.id === f.id) }))
    .filter((x) => x.t)
    .slice(0, 3);
  const widgetCards = FEATURED_WIDGETS
    .map((f) => ({ f, t: WIDGET_TPLS.find((tpl) => tpl.id === f.id) }))
    .filter((x) => x.t)
    .slice(0, 6);
  const jacketCards = FEATURED_JACKETS
    .map((f) => ({ f, t: JACKET_TPLS.find((tpl) => tpl.id === f.id) }))
    .filter((x) => x.t)
    .slice(0, 4);

  return (
    <div className="gallery">
      <header className="gallery-header">
        <div className="gallery-brand">
          <div className="header-logomark">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="16" height="11" rx="1.5" strokeWidth="1.4" />
              <path d="M2 11.5h16" strokeWidth="1.4" />
              <path d="M8 17h4M10 14.5v2.5" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="header-title">Graphics Studio</div>
          <span className="header-sep">|</span>
          <div className="header-sub">Times of India · Broadcast Graphics Editor</div>
        </div>
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <UserMenu />
        </div>
      </header>

      <div className="home-body">
        <div className="home-intro">
          <h1>What are you creating today?</h1>
        </div>

        <div className="home-section">
          <div className="home-section-hd">
            <span className="home-section-title">Ticker</span>
            <button className="home-section-link" onClick={onSeeAllTicker}>See all templates →</button>
          </div>
          <div className="gallery-grid home-featured-grid">
            {tickerCards.map(({ f, t }) => {
              const m = t.mini;
              const badgeHtml = m.bb ? (
                <div className={'mini-badge' + (t.style.badgeShape === 'wedge' ? ' mini-badge-wedge' : '')} style={{ background: m.bb, color: m.bt }}>
                  {t.badge.type === 'LIVE' && <div className="mini-dot" style={{ background: 'rgba(255,255,255,0.8)' }}></div>}
                  {m.badge}
                </div>
              ) : null;
              return (
                <div
                  key={t.id}
                  className={'gallery-card home-featured-card' + (menuOpenId === t.id ? ' card-menu-open' : '')}
                  role="button"
                  tabIndex={0}
                  onClick={() => onPickTicker(t.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPickTicker(t.id); }}
                >
                  {f.badge && <span className="home-card-badge">{f.badge}</span>}
                  <div className="tpl-preview-bg gallery-preview-bg">
                    <div className="mini-ticker" style={{ background: m.bg, borderTop: m.border || 'none' }}>
                      {badgeHtml}
                      <div className="mini-text" style={{ color: m.tc, fontFamily: t.text.fontFamily, fontWeight: t.text.fontWeight }}>
                        Breaking news from India <span className="mini-sep" style={{ color: m.tc }}>◆</span> Markets hit record high
                      </div>
                    </div>
                  </div>
                  <div className="home-card-name">
                    {t.name}
                    <CardMenu onDuplicate={() => onPickTicker(t.id)} onOpenChange={(o) => setMenuOpenId(o ? t.id : null)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="home-section">
          <div className="home-section-hd">
            <span className="home-section-title">Widgets</span>
            <button className="home-section-link" onClick={onSeeAllWidgets}>See all templates →</button>
          </div>
          <div className="gallery-grid home-featured-grid">
            {widgetCards.map(({ f, t }) => {
              const bodyTextColor = autoTextColor(t.style.bg);
              const headingTextColor = autoTextColor(t.style.headingBg);
              return (
                <div
                  key={t.id}
                  className={'gallery-card home-featured-card' + (menuOpenId === t.id ? ' card-menu-open' : '')}
                  role="button"
                  tabIndex={0}
                  onClick={() => onPickWidget(t.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPickWidget(t.id); }}
                >
                  {f.badge && <span className="home-card-badge">{f.badge}</span>}
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
                  <div className="home-card-name">
                    {t.name}
                    <CardMenu onDuplicate={() => onPickWidget(t.id)} onOpenChange={(o) => setMenuOpenId(o ? t.id : null)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="home-section">
          <div className="home-section-hd">
            <span className="home-section-title">Jackets</span>
            <button className="home-section-link" onClick={onSeeAllJackets}>See all templates →</button>
          </div>
          <div className="gallery-grid home-featured-grid">
            {jacketCards.map(({ f, t }) => (
              <div
                key={t.id}
                className={'gallery-card home-featured-card' + (menuOpenId === t.id ? ' card-menu-open' : '')}
                role="button"
                tabIndex={0}
                onClick={() => onPickJacket(t.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPickJacket(t.id); }}
              >
                {f.badge && <span className="home-card-badge">{f.badge}</span>}
                <div className="jacket-mini">
                  <div className="jacket-mini-video" />
                  <div className="jacket-mini-inset" />
                  <div className="jacket-mini-bar">
                    <span className="jacket-mini-logo" style={{ background: t.style.logoGradient || t.style.logoColor, color: autoTextColor(t.style.logoColor) }}>TOI</span>
                    <span className="jacket-mini-ticker" />
                    <span className="jacket-mini-time" style={{ background: t.style.timeColor, color: autoTextColor(t.style.timeColor) }} />
                  </div>
                </div>
                <div className="home-card-name">
                  {t.name}
                  <CardMenu onDuplicate={() => onPickJacket(t.id)} onOpenChange={(o) => setMenuOpenId(o ? t.id : null)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="home-section">
          <div className="home-section-hd">
            <span className="home-section-title">More coming soon</span>
          </div>
          <div className="gallery-grid home-featured-grid">
            <div className="gallery-card home-featured-card home-card-disabled">
              <span className="home-card-badge home-card-badge-soon">Coming soon</span>
              <div className="tpl-scratch-preview tpl-scratch-preview-16x9 gallery-preview-bg">Captions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
