// ChooserCard — a thing to start from: its picture, its name, a one-word fact and its ⋯.
export default function ChooserCard({ name, reach, onOpen, menu, disabled, children }) {
  const open = disabled ? undefined : onOpen;
  return (
    <div
      className={'dlg-card tpl-choice' + (disabled ? ' sc-read' : '')}
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
      aria-disabled={disabled || undefined}
      onClick={open}
      onKeyDown={open && ((e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); } })}
    >
      <div className={'tpl-thumb' + (children ? '' : ' tpl-thumb-blank')}>{children}</div>
      <div className="dc-top">
        <span className="dc-title">{name}</span>
        {reach && <span className="dc-reach">{reach}</span>}
        {menu}
      </div>
    </div>
  );
}

// The chooser's create card ("Start from scratch").
export function CreateCard({ label, onOpen }) {
  return (
    <button type="button" className="dlg-card create tpl-choice" onClick={onOpen}>
      <div className="dc-plus">+</div>
      <div className="dc-title">{label}</div>
    </button>
  );
}

// The grid chooser cards sit in.
export function ChooserGrid({ children }) {
  return <div className="tpl-grid">{children}</div>;
}
