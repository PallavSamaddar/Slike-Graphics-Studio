// Toggle — an on/off switch for a thing that runs or doesn't. Space or Enter flips it.
export default function Toggle({ on, onChange, children, label, tiny = false, disabled = false, title }) {
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
