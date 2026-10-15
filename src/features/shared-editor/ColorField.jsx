import { useEffect, useRef, useState } from 'react';
import { isSafeColor } from '../../utils/color.js';
import ColorPickerPopover from './ColorPickerPopover.jsx';

export default function ColorField({ value, fallback, onChange, allowGradient = false, gradientValue, onChangeGradient }) {
  const swatchColor = gradientValue || (isSafeColor(value) ? value : fallback);
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const swatchRef = useRef(null);

  useEffect(() => setText(value), [value]);

  return (
    <div className="color-field">
      <div className="swatch-wrap">
        <button ref={swatchRef} type="button" className="swatch-vis" onClick={() => setOpen((o) => !o)} aria-label="Open color picker">
          <span className="swatch-vis-color" style={{ background: swatchColor }} />
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
        value={gradientValue ? 'Gradient' : text}
        disabled={!!gradientValue}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          if (isSafeColor(v.trim())) onChange(v.trim());
        }}
        spellCheck={false}
      />
    </div>
  );
}
