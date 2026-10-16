import { useRef, useState } from 'react';
import useDismiss from '../../ui-kit/hooks/useDismiss.js';

const Chevron = () => (
  <svg className="lc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
);
const Tick = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);
function Menu({ open, setOpen, options, value, onChange, heading, children, className = '' }) {
  const ref = useRef(null);
  useDismiss(open, ref, () => setOpen(false));
  return (
    <div className={'lc-menu-wrap ' + className} ref={ref}>
      {children}
      {open && (
        <div className="lc-menu" role="menu">
          {heading && <div className="lc-menu-head">{heading}</div>}
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={o.value === value}
              className={'lc-opt' + (o.value === value ? ' on' : '')}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span className="lc-opt-tick">{o.value === value && <Tick />}</span>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Sort as one quiet button showing the current order, with the choices in a menu (Drive style).
export function SortMenu({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <Menu open={open} setOpen={setOpen} options={options} value={value} onChange={onChange} heading="Sort by" className="lc-sort-wrap">
      <button type="button" className={'lc-sort' + (open ? ' open' : '')} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} title="Sort by">
        <svg className="lc-sort-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5" /></svg>
        <span className="lc-label">{current?.label}</span>
        <Chevron />
      </button>
    </Menu>
  );
}

// List / Grid as two icon buttons.
export function ViewToggle({ value, onChange }) {
  return (
    <div className="lc-view" role="radiogroup" aria-label="Show as">
      <button type="button" role="radio" aria-checked={value === 'list'} className={value === 'list' ? 'on' : undefined} onClick={() => onChange('list')} title="List">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></svg>
      </button>
      <button type="button" role="radio" aria-checked={value === 'grid'} className={value === 'grid' ? 'on' : undefined} onClick={() => onChange('grid')} title="Grid">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></svg>
      </button>
    </div>
  );
}
