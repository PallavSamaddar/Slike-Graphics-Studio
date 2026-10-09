// SegmentedControl — two or three short answers side by side.
//   options: [{ value, label, disabled?, title? }]
export default function SegmentedControl({ value, options, onChange, small = true, off = false, title, ariaLabel }) {
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
