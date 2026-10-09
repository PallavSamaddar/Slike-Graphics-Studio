// One item in any menu (row ⋯, editor ⋯, profile): `.dim` stays in the list with its reason.
export default function MenuItem({ it, close }) {
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
