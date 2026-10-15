import { useRef, useState } from 'react';
import useDismiss from '../hooks/useDismiss.js';
import MenuItem from './MenuItem.jsx';

export default function TopBar({ brand, rooms, room, onRoom, onBrand, user, menu = [], themePick, onThemePick }) {
  return (
    <header className="topbar"><div className="tb-in">
      {onBrand
        ? <a className="brand" href={brand.href || '#/'} aria-label={`${brand.name} — home`} onClick={(e) => { e.preventDefault(); onBrand(); }}>{brand.mark}{brand.name}</a>
        : <div className="brand">{brand.mark}{brand.name}</div>}
      {rooms.length > 0 && (
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
              <span className="nav-ico">{r.icon}</span>
              <span className="nav-t">{r.label}</span>
              {r.count != null && <span className="nav-count">{r.count}</span>}
            </a>
          ))}
        </nav>
      )}
      <span className="tb-gap" />
      {onThemePick && <ThemeToggle pick={themePick} onPick={onThemePick} />}
      <Profile user={user} menu={menu} />
    </div></header>
  );
}

function Profile({ user, menu }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  useDismiss(open, ref, (esc) => { setOpen(false); if (esc) btnRef.current?.focus(); });
  return (
    <div id="me" className={'me' + (open ? ' open' : '')} ref={ref}>
      <button ref={btnRef} type="button" className="me-btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="me-av">{user.initials}</span>
        <span className="me-who"><span className="me-name">{user.name}</span></span>
        <span className="me-chev">▾</span>
      </button>
      <div className="eh-menu me-menu">
        <div className="me-head"><span className="me-hname">{user.name}</span><span className="me-hmail">{user.email}</span></div>
        {menu.map((it) => <MenuItem key={it.label} it={it} close={() => setOpen(false)} />)}
      </div>
    </div>
  );
}

function ThemeToggle({ pick, onPick }) {
  const deviceDark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const dark = pick === 'dark' || (pick === 'device' && deviceDark);
  const next = dark ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="tb-theme"
      onClick={() => onPick(next)}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" /></svg>
      )}
    </button>
  );
}

