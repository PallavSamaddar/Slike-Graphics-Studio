// A checkbox as a box: ticked on or off.
export default function CheckChip({ on, onChange, children }) {
  return (
    <label className={'check-chip' + (on ? ' on' : '')}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span className="check-chip-box" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5" /></svg>
      </span>
      {children}
    </label>
  );
}
