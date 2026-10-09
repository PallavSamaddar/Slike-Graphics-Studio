import { useRef, useState } from 'react';
import { useDismiss, MenuItem } from './controls.jsx';

// EditorHeader — back, the thing's name, where it stands, then Save · Publish · ⋯.
export function EditorHeader({ name, title, onTitleChange, placeholder, onBack, air, pending, save, publish, more }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(open, ref, () => setOpen(false));
  return (
    <div className="ehead">
      <a className="eh-back" href="/" aria-label="Back" onClick={(e) => { e.preventDefault(); onBack(); }}>←</a>
      <h1>{name}</h1>
      {onTitleChange && (
        <input
          className="eh-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={placeholder}
          aria-label={`${name} name`}
          maxLength={120}
        />
      )}
      {air}
      {pending}
      <span className="eh-gap" />
      <button type="button" className="btn ghost" onClick={save.onClick} disabled={save.disabled} title={save.title}>Save</button>
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
