// Tabs — picks one subject inside a page or section; the tab you are on is weight plus the
// accent underline. A tab may carry a small accent dot (`dot`) with its reason as words.
//   tabs: [{ id, label, dot?: string }]
export default function Tabs({ tabs, value, onChange, ariaLabel }) {
  return (
    <div className="scope-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={'stab' + (value === t.id ? ' on' : '')}
          onClick={() => onChange(t.id)}
          title={t.dot}
        >
          {t.label}{t.dot && <> <span className="bdot" aria-label={t.dot} /></>}
        </button>
      ))}
    </div>
  );
}
