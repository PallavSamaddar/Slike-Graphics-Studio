import { useEffect, useId, useRef, useState } from 'react';

// The house select (UI kit · Select): a bordered face over a listbox, past eight
// options led by the search well. Keyboard as the card says: Enter/Space/↓ open on the
// current answer, ↑/↓ move, Enter/Space pick, Esc closes and keeps focus, Tab moves on.
//   options: [{ value, label, group?, disabled?, title? }]
export default function Select({ value, options, onChange, placeholder = 'Choose…', searchLabel, ariaLabel, disabled, title }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [query, setQuery] = useState('');
  const [place, setPlace] = useState(null); 
  const faceRef = useRef(null);
  const searchRef = useRef(null);
  const optRefs = useRef({});
  const id = useId();
  const listId = `${id}-opts`;
  const withSearch = options.length > 8;

  const q = query.trim().toLowerCase();
  const matches = (o) => !q || String(o.label).toLowerCase().includes(q);
  const visible = options.map((o, i) => ({ o, i })).filter(({ o }) => matches(o));
  const current = options.findIndex((o) => String(o.value) === String(value));
  const chosen = options[current];

  const close = (refocus) => {
    setOpen(false);
    setQuery('');
    if (refocus) faceRef.current?.focus();
  };
  const pick = (o) => {
    if (!o || o.disabled) return;
    onChange(o.value);
    close(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (faceRef.current && !faceRef.current.contains(e.target)) close(false); };
    document.addEventListener('mousedown', onDown);
    if (withSearch) setTimeout(() => searchRef.current?.focus(), 0);
    return () => document.removeEventListener('mousedown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // The option the arrow keys are on holds real focus, so it takes the house focus fill.
  useEffect(() => {
    if (open && cursor >= 0) optRefs.current[cursor]?.focus();
  }, [open, cursor]);

  const fitMenu = () => {
    const face = faceRef.current;
    if (!face || withSearch) return null;
    let box = face.parentElement;
    while (box && box !== document.body && !/(auto|scroll|hidden)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
    const bounds = box && box !== document.body ? box.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    const rect = face.getBoundingClientRect();
    const below = Math.min(bounds.bottom, window.innerHeight) - rect.bottom - 8;
    const above = rect.top - Math.max(bounds.top, 0) - 8;
    const want = Math.min(240, options.length * 34 + 12);
    const up = below < want && above > below;
    return { up, maxHeight: Math.max(96, Math.min(240, up ? above : below)) };
  };

  const openMenu = () => {
    if (disabled) return;
    setCursor(withSearch ? -1 : current);
    setPlace(fitMenu());
    setOpen(true);
  };

  const move = (dir) => {
    const idxs = visible.filter(({ o }) => !o.disabled).map(({ i }) => i);
    if (!idxs.length) return;
    const at = idxs.indexOf(cursor);
    const next = at === -1 ? (dir > 0 ? idxs[0] : idxs[idxs.length - 1]) : idxs[Math.min(idxs.length - 1, Math.max(0, at + dir))];
    setCursor(next);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); openMenu(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === 'Tab') close(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter' || (e.key === ' ' && e.target.tagName !== 'INPUT')) {
      e.preventDefault();
      if (cursor >= 0 && matches(options[cursor])) pick(options[cursor]);
      else pick(visible.map(({ o }) => o).find((o) => !o.disabled));
    }
  };

  let lastGroup = null;
  const rows = [];
  visible.forEach(({ o, i }) => {
    if (o.group && o.group !== lastGroup) {
      lastGroup = o.group;
      rows.push(<div className="sel-grp" key={`g-${o.group}`}>{o.group}</div>);
    }
    rows.push(
      <div
        key={String(o.value)}
        ref={(el) => { optRefs.current[i] = el; }}
        className={'sel-opt' + (i === current ? ' on' : '')}
        role="option"
        aria-selected={i === current}
        aria-disabled={o.disabled || undefined}
        tabIndex={-1}
        title={o.title}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => pick(o)}
      >
        <span className="sel-opt-l">{o.label}</span>
      </div>
    );
  });

  return (
    <div
      ref={faceRef}
      className={'select' + (open ? ' open' : '') + (open && place?.up ? ' up' : '')}
      tabIndex={disabled ? -1 : 0}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      title={title}
      onClick={(e) => { if (!open) openMenu(); else if (!e.target.closest('.sel-menu')) close(true); }}
      onKeyDown={onKeyDown}
    >
      <span className={'sel-label' + (chosen ? '' : ' ph')}>{chosen ? chosen.label : placeholder}</span>
      <span className="sel-chev">▾</span>
      {open && (
        <div className={'sel-menu' + (withSearch ? ' has-search' : '')} id={listId} role="listbox" style={place ? { maxHeight: place.maxHeight } : undefined}>
          {withSearch ? (
            <>
              <div className="sh-search">
                <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="7.1" cy="7.1" r="4.4" /><path d="m10.4 10.4 3 3" /></svg>
                <input
                  ref={searchRef}
                  className="sel-sinput"
                  value={query}
                  placeholder={`Search ${searchLabel}…`}
                  spellCheck={false}
                  aria-label={`Search ${searchLabel}`}
                  onChange={(e) => { setQuery(e.target.value); setCursor(-1); }}
                />
                {query && <button type="button" className="sh-search-x" aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={() => { setQuery(''); searchRef.current?.focus(); }}>×</button>}
              </div>
              <div className="sel-opts">
                {rows}
                {!visible.length && <div className="fp-none">Nothing matches</div>}
              </div>
            </>
          ) : rows}
        </div>
      )}
    </div>
  );
}
