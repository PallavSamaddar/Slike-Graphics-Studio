import { useRef, useState } from 'react';
import { useDismiss } from './controls.jsx';

const USER = { name: 'Diya Seth', email: 'diya.seth@timesinternet.in', initials: 'DS' };

// The app's own logomark, unchanged; drawn in currentColor so it takes the band's ink.
const Logomark = () => (
  <svg className="brand-mark" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
    <rect x="2" y="3" width="16" height="11" rx="1.5" strokeWidth="1.4" />
    <path d="M2 11.5h16" strokeWidth="1.4" />
    <path d="M8 17h4M10 14.5v2.5" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// Room icons: 16px, 1.5 stroke, round caps and joins, in currentColor (Player Console iconography).
const ICONS = {
  // the system has no Home room icon; drawn on its grid and stroke
  home: <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.2 8 2.6l5.5 4.6" /><path d="M4 6.2V13.4h8V6.2" /><path d="M6.6 13.4V9.6h2.8v3.8" /></svg>,
  // assets/Icons/room-templates.svg
  templates: <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M2 6h12M6.2 6v8" /></svg>,
};

// TopBar — the header band: the mark and name, the rooms with their icons and counts, and
// the profile with its Theme choice (ThemeSwitch).
export default function TopBar({ room, rooms, onRoom, themePick, onThemePick }) {
  return (
    <header className="topbar"><div className="tb-in">
      <div className="brand"><Logomark />Graphics Studio</div>
      <nav id="nav" aria-label="Rooms">
        {rooms.map((r) => (
          <a
            key={r.id}
            href="/"
            data-nav={r.id}
            className={room === r.id ? 'on' : undefined}
            aria-current={room === r.id ? 'page' : undefined}
            onClick={(e) => { e.preventDefault(); onRoom(r.id); }}
          >
            <span className="nav-ico">{ICONS[r.id]}</span>
            <span className="nav-t">{r.label}</span>
            {r.count != null && <span className="nav-count">{r.count}</span>}
          </a>
        ))}
      </nav>
      <span className="tb-gap" />
      <Profile pick={themePick} onPick={onThemePick} />
    </div></header>
  );
}

function Profile({ pick, onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  useDismiss(open, ref, (esc) => { setOpen(false); if (esc) btnRef.current?.focus(); });
  const opts = [['light', 'Light'], ['dark', 'Dark'], ['device', 'Match device']];
  return (
    <div id="me" className={'me' + (open ? ' open' : '')} ref={ref}>
      <button ref={btnRef} type="button" className="me-btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="me-av">{USER.initials}</span>
        <span className="me-who"><span className="me-name">{USER.name}</span></span>
        <span className="me-chev">▾</span>
      </button>
      <div className="eh-menu me-menu">
        <div className="me-head"><span className="me-hname">{USER.name}</span><span className="me-hmail">{USER.email}</span></div>
        <div className="me-theme" role="radiogroup" aria-labelledby="me-theme-t">
          <div className="me-theme-t" id="me-theme-t">Theme</div>
          {opts.map(([v, l]) => (
            <label className="eh-item me-opt" key={v}>
              <input type="radio" name="pc-theme" value={v} checked={pick === v} onChange={() => onPick(v)} />
              <span className="me-opt-t">{l}</span>
              <span className="me-tick" aria-hidden="true">✓</span>
            </label>
          ))}
        </div>
        <div className="eh-item" role="menuitem" tabIndex={0}>Settings</div>
        <div className="eh-item danger" role="menuitem" tabIndex={0}>Log out</div>
      </div>
    </div>
  );
}
