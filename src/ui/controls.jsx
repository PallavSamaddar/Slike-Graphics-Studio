import { useEffect, useRef, useState } from 'react';
import { useChanged } from './changes.jsx';

// Player Console house controls, as the cards draw them. Markup and class names are the
// system's own; these wrappers only add React state and the keyboard rules the
// accessibility guideline asks for.

// SegmentedControl — two or three short answers side by side.
//   options: [{ value, label, disabled?, title? }]
export function Seg({ value, options, onChange, small = true, off = false, title, ariaLabel }) {
  return (
    <div className={'seg' + (small ? ' small' : '') + (off ? ' off' : '')} title={off ? title : undefined} role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={value === o.value ? 'on' : undefined}
          disabled={off || o.disabled}
          title={o.title}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Toggle — an on/off switch for a thing that runs or doesn't. Space or Enter flips it.
export function Toggle({ on, onChange, children, label, tiny = false, disabled = false, title }) {
  const flip = () => { if (!disabled) onChange(!on); };
  return (
    <span
      className={'toggle' + (tiny ? ' tiny' : '') + (on ? ' on' : '')}
      role="switch"
      aria-checked={!!on}
      aria-disabled={disabled || undefined}
      aria-label={children ? undefined : label}
      tabIndex={disabled ? -1 : 0}
      title={title}
      onClick={flip}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } }}
    >
      <span className="track" />
      {children}
    </span>
  );
}

// Field — label, box, then a hint or an error under it.
// `path` names the setting(s) it edits, so it wears the change mark while unsaved.
export function Field({ label, path, grow, off, offReason, err, className = '', children, style }) {
  const changed = useChanged();
  const chg = path && changed(path);
  return (
    <div className={'field' + (grow ? ' grow' : '') + (off ? ' off' : '') + (err ? ' err' : '') + (chg ? ' chg' : '') + (className ? ' ' + className : '')} title={off ? offReason : undefined} style={style}>
      {label != null && <label>{label}</label>}
      {children}
      {err && <div className="field-err">{err}</div>}
    </div>
  );
}

// A number box with its unit inside it. ↑/↓ step by 1, Shift by 10, never below the minimum.
export function NumBox({ value, onChange, unit, min = 0, max = Infinity, off = false, ariaLabel }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const commit = (n) => { const c = clamp(n); setText(String(c)); onChange(c); };
  return (
    <span className={'num-wrap' + (off ? ' off' : '')}>
      <input
        value={text}
        inputMode="decimal"
        aria-label={ariaLabel}
        disabled={off}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        onBlur={() => setText(String(value))}
        onKeyDown={(e) => {
          if (off || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
          e.preventDefault();
          const base = parseFloat(text) || 0;
          commit(base + (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1));
        }}
      />
      {unit && <span className="unit">{unit}</span>}
    </span>
  );
}

// Closes a menu on a click outside it or on Esc.
export function useDismiss(open, ref, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(true); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, ref, onClose]);
}

// RowMenu — the secondary acts behind one quiet ⋯.
//   items: [{ label, onClick, danger?, dim?, title?, fact? }]
export function RowMenu({ items, label = 'More', onOpenChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const set = (v) => { setOpen(v); onOpenChange?.(v); };
  useDismiss(open, ref, () => set(false));
  return (
    <div className={'rmenu' + (open ? ' open' : '')} ref={ref} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <button type="button" className="row-kebab" aria-haspopup="true" aria-expanded={open} aria-label={label} onClick={() => set(!open)}>⋯</button>
      <div className="rmenu-list" role="menu">
        {items.map((it) => (
          <MenuItem key={it.label} it={it} close={() => set(false)} />
        ))}
      </div>
    </div>
  );
}

export function MenuItem({ it, close }) {
  return (
    <div
      className={'eh-item' + (it.danger ? ' danger' : '') + (it.dim ? ' dim' : '')}
      role="menuitem"
      tabIndex={0}
      title={it.title}
      aria-disabled={it.dim || undefined}
      onClick={() => { if (it.dim) return; close(); it.onClick(); }}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !it.dim) { e.preventDefault(); close(); it.onClick(); } }}
    >
      {it.label}
      {it.fact && <> <span className="mono sg-dim">{it.fact}</span></>}
    </div>
  );
}

// Dialog — the house confirm, centred at 440 (`sheet` 620) over the blurred veil.
export function Dialog({ title, children, foot, onCancel, size, busy }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.querySelector('h3')?.focus();
    const onKey = (e) => { if (e.key === 'Escape' && !busy) { e.stopPropagation(); onCancel(); } };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); prev?.focus?.(); };
  }, [onCancel, busy]);
  return (
    <div className="dlg-veil" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className={'dlg' + (size ? ' ' + size : '')} role="dialog" aria-modal="true" ref={ref}>
        <h3 tabIndex={-1}>{title}</h3>
        <div className="dlg-body">{children}</div>
        <div className="dlg-foot">{foot}</div>
      </div>
    </div>
  );
}
