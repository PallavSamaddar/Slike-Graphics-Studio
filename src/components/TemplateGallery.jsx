import { useState } from 'react';
import { TPLS } from '../data/templates.js';
import CategoryRail from './CategoryRail.jsx';
import ComingSoonPanel from './ComingSoonPanel.jsx';
import WidgetGallery from './WidgetGallery.jsx';
import JacketGallery from './JacketGallery.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import UserMenu from './UserMenu.jsx';

export default function TemplateGallery({ onPick, theme, onToggleTheme, initialCategory, onHome }) {
  const [category, setCategory] = useState(initialCategory || 'ticker');

  return (
    <div className="gallery">
      <header className="gallery-header">
        <div className="gallery-brand">
          {onHome && (
            <button className="btn btn-ghost" onClick={onHome} style={{ padding: '0 9px' }} title="Back to home">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
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

      <div className="gallery-main">
        <CategoryRail active={category} onSelect={setCategory} />

        {category === 'widgets' ? (
          <WidgetGallery onPick={(id) => onPick('widgets', id)} />
        ) : category === 'jackets' ? (
          <JacketGallery onPick={(id) => onPick('jackets', id)} />
        ) : category !== 'ticker' ? (
          <div className="gallery-body gallery-body-center">
            <ComingSoonPanel category={category} />
          </div>
        ) : (
        <div className="gallery-body">
        <div className="gallery-intro">
          <h1>Choose a template</h1>
        </div>

        <div className="gallery-grid">
          <button className="gallery-card gallery-scratch" onClick={() => onPick('ticker', 'scratch')}>
            <div className="tpl-scratch-preview gallery-preview-bg">
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Start from scratch
            </div>
          </button>

          {TPLS.map((t) => {
            const m = t.mini;
            const badgeHtml = m.bb ? (
              <div className={'mini-badge' + (t.style.badgeShape === 'wedge' ? ' mini-badge-wedge' : '')} style={{ background: m.bb, color: m.bt }}>
                {t.badge.type === 'LIVE' && <div className="mini-dot" style={{ background: 'rgba(255,255,255,0.8)' }}></div>}
                {m.badge}
              </div>
            ) : null;
            return (
              <button key={t.id} className="gallery-card" onClick={() => onPick('ticker', t.id)}>
                <div className="tpl-preview-bg gallery-preview-bg">
                  <div className="mini-ticker" style={{ background: m.bg, borderTop: m.border || 'none' }}>
                    {badgeHtml}
                    <div className="mini-text" style={{ color: m.tc, fontFamily: t.text.fontFamily, fontWeight: t.text.fontWeight }}>
                      Breaking news from India <span className="mini-sep" style={{ color: m.tc }}>◆</span> Markets hit record high
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        </div>
        )}
      </div>
    </div>
  );
}
