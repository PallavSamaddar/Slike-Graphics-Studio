import { FONTS } from '../../constants/fonts.js';
import { Field, NumberBox, Select } from '../../ui-kit';

const CASES = [
  { value: 'none', label: 'As typed' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Title Case' },
];

// Text formatting for a graphic: case and font as house selects, the size as a number box,
// and the bold / italic / underline / alignment icon strip (not a kit component: kept
// as it was). Renders fields for a .frow; `path` is the state key it edits, for the change mark.
//   fonts: 'all' or a list of labels to offer (the ticker offers no Playfair Display)
export default function FormattingToolbar({ tx, setTx, path, fonts = 'all', withCase = false, maxSize = 96, alignDisabled = false, alignReason }) {
  const fontOpts = fonts === 'all' ? FONTS : FONTS.filter((f) => fonts.includes(f.label));
  const size = parseInt(tx.fontSize, 10) || 14;
  const bold = parseInt(tx.fontWeight, 10) >= 700;
  const align = tx.textAlign || 'left';
  const alignTitle = (t) => (alignDisabled ? alignReason : t);

  return (
    <>
      {withCase && (
        <Field label="Text case" path={`${path}.textTransform`}>
          <Select value={tx.textTransform} options={CASES} onChange={(v) => setTx('textTransform', v)} ariaLabel="Text case" />
        </Field>
      )}
      <Field label="Font" path={`${path}.fontFamily`}>
        <Select value={tx.fontFamily} options={fontOpts} onChange={(v) => setTx('fontFamily', v)} ariaLabel="Font" />
      </Field>
      <Field label="Font size" path={`${path}.fontSize`}>
        <NumberBox value={size} unit="px" min={8} max={maxSize} onChange={(n) => setTx('fontSize', Math.round(n) + 'px')} ariaLabel="Font size" />
      </Field>
      <Field label="Text style" path={[`${path}.fontWeight`, `${path}.fontStyle`, `${path}.textDecoration`, `${path}.textAlign`]}>
        <div className="fmt-toolbar">
          <button
            type="button"
            className={'fmt-icon-btn' + (bold ? ' active' : '')}
            onClick={() => setTx('fontWeight', bold ? '500' : '700')}
            aria-label="Bold" aria-pressed={bold} title="Bold"
            style={{ fontWeight: 800, fontSize: 15 }}
          >B</button>
          <button
            type="button"
            className={'fmt-icon-btn' + (tx.fontStyle === 'italic' ? ' active' : '')}
            onClick={() => setTx('fontStyle', tx.fontStyle === 'italic' ? 'normal' : 'italic')}
            aria-label="Italic" aria-pressed={tx.fontStyle === 'italic'} title="Italic"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="19" x2="16" y2="19" /><line x1="8" y1="5" x2="14" y2="5" /><line x1="14" y1="5" x2="10" y2="19" /></svg>
          </button>
          <button
            type="button"
            className={'fmt-icon-btn' + (tx.textDecoration === 'underline' ? ' active' : '')}
            onClick={() => setTx('textDecoration', tx.textDecoration === 'underline' ? 'none' : 'underline')}
            aria-label="Underline" aria-pressed={tx.textDecoration === 'underline'} title="Underline"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4v7a6 6 0 0012 0V4" /><line x1="5" y1="20" x2="19" y2="20" /></svg>
          </button>

          <span className="fmt-divider" />

          <button
            type="button"
            className={'fmt-icon-btn' + (align === 'left' ? ' active' : '')}
            onClick={() => setTx('textAlign', 'left')}
            disabled={alignDisabled}
            aria-label="Align left" aria-pressed={align === 'left'} title={alignTitle('Align left')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="17" y2="18" /></svg>
          </button>
          <button
            type="button"
            className={'fmt-icon-btn' + (align === 'center' ? ' active' : '')}
            onClick={() => setTx('textAlign', 'center')}
            disabled={alignDisabled}
            aria-label="Align center" aria-pressed={align === 'center'} title={alignTitle('Align center')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="5.5" y1="18" x2="18.5" y2="18" /></svg>
          </button>
          <button
            type="button"
            className={'fmt-icon-btn' + (align === 'right' ? ' active' : '')}
            onClick={() => setTx('textAlign', 'right')}
            disabled={alignDisabled}
            aria-label="Align right" aria-pressed={align === 'right'} title={alignTitle('Align right')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="10" y1="12" x2="20" y2="12" /><line x1="7" y1="18" x2="20" y2="18" /></svg>
          </button>
        </div>
      </Field>
    </>
  );
}
