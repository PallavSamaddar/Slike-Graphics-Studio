import { useRef, useState } from 'react';
import { useDismiss } from './controls.jsx';

const USER = { name: 'Diya Seth', email: 'diya.seth@timesinternet.in', initials: 'DS' };

// The Slike mark (Player Console · assets/Logos/slike-mark.svg): full colour, transparent on the
// band at 20px, beside the product's name set in type. Never recoloured, boxed or set on a fill.
const Logomark = () => (
  <svg className="brand-mark" viewBox="0 0 29 32" aria-hidden="true">
    <g fill="none">
      <path fill="#F37021" d="M10.645 24.165c.69.32 1.63.345 2.9.07 1.04-.225 7.5-1.35 10.465-1.895 1.545-.285 1.855-.5 2.65-2.39l1.205-2.89c.77-1.845 1.1-2.3.35-3.53.815 1.34.28 2.16-.97 2.355-.855.135-11.54 1.96-15.345 2.605-.835.146-1.534.714-1.85 1.5-.835 2.335-.28 3.76.595 4.175z" />
      <path fill="#F7941D" d="M28.22 13.53c-6.63-9.735-6.63-9.685-7.565-11.155-.7-1.095-1.355-1.8-2.07-2.065-.955-.34-2.38.34-3.415 2.585l-.5 1.25 8.5 12.45 4.12-.715c1.21-.19 1.74-1.015.93-2.35z" />
      <path fill="#FDB913" d="M.945 26.65c.65.785 3.89 4.28 4.795 4.58-.875-.415-1.42-1.86-.585-4.21l10-24.155c1.065-2.22 2.46-2.89 3.4-2.55-.85-.435-5.615-.27-6.63-.18-1.44.125-2.07.81-2.635 2.17L.63 23.25c-.565 1.36-.63 2.29.315 3.4z" />
    </g>
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
