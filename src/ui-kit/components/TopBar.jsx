import { useRef, useState } from 'react';
import useDismiss from '../hooks/useDismiss.js';
import MenuItem from './MenuItem.jsx';

const THEMES = [['light', 'Light'], ['dark', 'Dark'], ['device', 'Match device']];

// TopBar — the header band: the mark and the product's name, the rooms with their icons and
// counts, and the profile with its Theme choice. The band is the same navy in both themes.
//   brand: { mark: <svg className="brand-mark" …/>, name }
//   rooms: [{ id, label, icon, count? }]   room: the id you are in
//   user:  { name, email, initials }       menu: [{ label, onClick, danger? }]
export default function TopBar({ brand, rooms, room, onRoom, user, menu = [], themePick, onThemePick }) {
  return (
    <header className="topbar"><div className="tb-in">
      <div className="brand">{brand.mark}{brand.name}</div>
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
      <span className="tb-gap" />
      <Profile user={user} menu={menu} pick={themePick} onPick={onThemePick} />
    </div></header>
  );
}

// The profile button and its menu: name and email, the Theme choice (it stays open on a
// pick, so a person can try both), then the account's own items.
function Profile({ user, menu, pick, onPick }) {
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
        <div className="me-theme" role="radiogroup" aria-labelledby="me-theme-t">
          <div className="me-theme-t" id="me-theme-t">Theme</div>
          {THEMES.map(([v, l]) => (
            <label className="eh-item me-opt" key={v}>
              <input type="radio" name="pc-theme" value={v} checked={pick === v} onChange={() => onPick(v)} />
              <span className="me-opt-t">{l}</span>
              <span className="me-tick" aria-hidden="true">✓</span>
            </label>
          ))}
        </div>
        {menu.map((it) => <MenuItem key={it.label} it={it} close={() => setOpen(false)} />)}
      </div>
    </div>
  );
}
