import { Field, Select } from '../../ui-kit';
import { FONTS } from '../../constants/fonts.js';

// The style panel's small controls, shared by the widget and ticker panels (one line each,
// in .cs-lines rows).

// A boxed − value + stepper.
export function Stepper({ value, onChange, step, min, max, display = String, label, title }) {
  const go = (d) => onChange(Math.min(max, Math.max(min, Math.round((value + d) * 100) / 100)));
  return (
    <div className="tool-group tool-step" title={title}>
      <button type="button" onClick={() => go(-step)} disabled={value <= min} aria-label={`Decrease ${label}`} title={`Decrease ${label}`}>−</button>
      <span className="tool-step-val">{display(value)}</span>
      <button type="button" onClick={() => go(step)} disabled={value >= max} aria-label={`Increase ${label}`} title={`Increase ${label}`}>+</button>
    </div>
  );
}

const ALIGNS = [
  ['left', 'Align left', [[4, 20], [4, 14], [4, 17]]],
  ['center', 'Align center', [[4, 20], [7, 17], [5.5, 18.5]]],
  ['right', 'Align right', [[4, 20], [10, 20], [7, 20]]],
];

// A text's bold / italic / underline, its alignment and (withCase) Aa / AA — its size adapts
// to what it's in on its own. The alignment lives at `alignKey`; `alignOff` greys it, with
// `alignReason` as its title.
export function TextFormat({ tx, setTx, path, label, alignKey = 'align', alignDefault = 'center', alignOff = false, alignReason, withCase = false }) {
  const bold = parseInt(tx.fontWeight, 10) >= 700;
  const italic = tx.fontStyle === 'italic';
  const underline = tx.textDecoration === 'underline';
  const upper = tx.textTransform === 'uppercase';
  const align = tx[alignKey] || alignDefault;
  const btn = (on, onClick, title, children, disabled = false) => (
    <button key={title} type="button" className={on ? 'on' : undefined} onClick={onClick} aria-pressed={on} aria-label={title} title={disabled ? alignReason : title} disabled={disabled}>{children}</button>
  );
  const paths = [`${path}.fontWeight`, `${path}.fontStyle`, `${path}.textDecoration`, `${path}.${alignKey}`, ...(withCase ? [`${path}.textTransform`] : [])];
  return (
    <Field path={paths}>
      <div className="tool-group tool-fmt" role="group" aria-label={`${label} text style`}>
        {btn(bold, () => setTx('fontWeight', bold ? '500' : '800'), 'Bold', <b>B</b>)}
        {btn(italic, () => setTx('fontStyle', italic ? 'normal' : 'italic'), 'Italic', <i>I</i>)}
        {btn(underline, () => setTx('textDecoration', underline ? 'none' : 'underline'), 'Underline', <u>U</u>)}
        {withCase && btn(upper, () => setTx('textTransform', upper ? 'none' : 'uppercase'), upper ? 'Normal case' : 'All capitals', <span className="tool-case">{upper ? 'AA' : 'Aa'}</span>)}
        <span className="tool-fmt-sep" />
        {ALIGNS.map(([value, title, lines]) => btn(!alignOff && align === value, () => setTx(alignKey, value), title, (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {lines.map(([x1, x2], i) => <line key={i} x1={x1} x2={x2} y1={6 + i * 6} y2={6 + i * 6} />)}
          </svg>
        ), alignOff))}
      </div>
    </Field>
  );
}

// A text's font.
export const FontSelect = ({ tx, setTx, label }) => (
  <Select value={tx.fontFamily} options={FONTS} onChange={(v) => setTx('fontFamily', v)} ariaLabel={`${label} font`} title={`${label} font`} />
);
export function ImagePosition({ value, onChange, disabled = false, title }) {
  const icon = (side) => (
    <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <rect x={side === 'left' ? 1.5 : 11.5} y="3" width="7" height="10" rx="1.5" fill="currentColor" fillOpacity=".25" />
      {[5, 8, 11].map((y) => <line key={y} x1={side === 'left' ? 11 : 1.5} x2={side === 'left' ? 18.5 : 9} y1={y} y2={y} />)}
    </svg>
  );
  return (
    <div className="tool-group tool-fmt tool-pos" role="radiogroup" aria-label="Image position" title={title}>
      {['left', 'right'].map((side) => (
        <button
          key={side}
          type="button"
          role="radio"
          aria-checked={value === side}
          className={value === side ? 'on' : undefined}
          disabled={disabled}
          onClick={() => onChange(side)}
          title={disabled ? title : side === 'left' ? 'Image on the left' : 'Image on the right'}
        >
          {icon(side)}
        </button>
      ))}
    </div>
  );
}
