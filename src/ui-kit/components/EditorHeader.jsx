import { useRef, useState } from 'react';
import useDismiss from '../hooks/useDismiss.js';
import MenuItem from './MenuItem.jsx';

export default function EditorHeader({ name, title, onTitleChange, placeholder, onBack, pending, save, publish, more }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);
  useDismiss(open, ref, () => setOpen(false));
  return (
    <div className="ehead">
      {onBack && <a className="eh-back" href="/" aria-label="Back" onClick={(e) => { e.preventDefault(); onBack(); }}>←</a>}
      <h1>{name}</h1>
      {onTitleChange && (editing ? (
        <input
          className="eh-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur(); }}
          placeholder={placeholder}
          aria-label={`${name} name`}
          maxLength={120}
          autoFocus
        />
      ) : (
        <span className="eh-title-view">
          <span className={'eh-title-text' + (title ? '' : ' ph')} onClick={() => setEditing(true)} title={title || placeholder}>{title || placeholder}</span>
          <button type="button" className="eh-title-edit" onClick={() => setEditing(true)} aria-label={`Rename ${String(name).toLowerCase()}`} title="Rename">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
          </button>
        </span>
      ))}
      {pending}
      <span className="eh-gap" />
      {save && <button type="button" className="btn ghost" onClick={save.onClick} disabled={save.disabled} title={save.title}>Save</button>}
      <button type="button" className={'btn' + (publish.ghost ? ' ghost' : '')} onClick={publish.onClick} disabled={publish.disabled} title={publish.title}>{publish.label}</button>
      <div className={'eh-more' + (open ? ' open' : '')} ref={ref}>
        <button type="button" className="btn ghost eh-more-btn" aria-haspopup="true" aria-expanded={open} aria-label="More" onClick={() => setOpen((o) => !o)}>⋯</button>
        <div className="eh-menu" role="menu">
          {more.map((it) => <MenuItem key={it.label} it={it} close={() => setOpen(false)} />)}
        </div>
      </div>
    </div>
  );
}
