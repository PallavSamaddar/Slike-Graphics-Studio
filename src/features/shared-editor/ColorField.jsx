import { useEffect, useRef, useState } from 'react';
import { isHex, isSafeColor } from '../../utils/color.js';
import ColorPickerPopover from './ColorPickerPopover.jsx';

export default function ColorField({ value, fallback, onChange, allowGradient = false, gradientValue, onChangeGradient, allowEyedropper = false, allowNone = false }) {
  const isNone = allowNone && value === 'none';
  const swatchColor = gradientValue || (isSafeColor(value) ? value : fallback);
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const swatchRef = useRef(null);

  useEffect(() => setText(value), [value]);

  const pickWithEyedropper = async () => {
    if (!window.EyeDropper) return;
    try {
      const result = await new window.EyeDropper().open();
      setText(result.sRGBHex);
      onChange(result.sRGBHex);
    } catch {
      // user cancelled — no-op
    }
  };

  return (
    <div className="color-field">
      <div className="swatch-wrap">
        <button
          ref={swatchRef}
          type="button"
          className={'swatch-vis' + (isNone ? ' swatch-vis-none' : '')}
          onClick={() => { if (isNone) onChange(fallback); setOpen((o) => !o); }}
          aria-label="Open color picker"
        >
          {!isNone && <span className="swatch-vis-color" style={{ background: swatchColor }} />}
        </button>
        {open && (
          <ColorPickerPopover
            value={isSafeColor(value) ? value : fallback}
            anchorRef={swatchRef}
            onClose={() => setOpen(false)}
            onChange={(v) => { setText(v); onChange(v); }}
            allowGradient={allowGradient}
            gradientValue={gradientValue}
            onChangeGradient={onChangeGradient}
          />
        )}
      </div>
      <input
        className="hex-inp"
        maxLength={7}
        value={gradientValue ? 'Gradient' : (isNone ? 'None' : text)}
        disabled={!!gradientValue || isNone}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          if (isHex(v)) onChange(v);
        }}
      />
      {allowEyedropper && window.EyeDropper && (
        <button type="button" className="color-field-eyedropper" onClick={pickWithEyedropper} aria-label="Pick color from screen" title="Pick color from screen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 7 L17 13" /><path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L18 9l-3-3z" /><path d="M4 20l4-1 9-9-3-3-9 9-1 4z" /></svg>
        </button>
      )}
      {allowNone && (
        <button
          type="button"
          className={'color-field-none-btn' + (isNone ? ' active' : '')}
          onClick={() => onChange(isNone ? fallback : 'none')}
          title={isNone ? 'Set a background colour' : 'No background colour'}
        >
          None
        </button>
      )}
    </div>
  );
}
