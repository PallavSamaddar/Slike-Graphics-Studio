import { useRef, useState } from 'react';
import ColorPickerPopover from './ColorPickerPopover.jsx';
import { isSafeColor } from '../../utils/color.js';

// A colour as a compact icon over a colour bar: "A" for a text's colour, a paint bucket for a
// background (`kind="fill"`). A text left unset takes its automatic colour (readable on its
// background), shown in the bar; Auto in the picker goes back to it.
//   value: the picked colour or empty · auto: the automatic colour · bar: what the bar shows,
//   when it differs (a gradient) · onChange(colour | null) · label · kind: 'text' | 'fill'
export default function TextColorButton({ value, auto, bar, onChange, label, kind = 'text', allowGradient = false, gradientValue, onChangeGradient }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const shown = value && isSafeColor(value) ? value : auto;
  return (
    <span className="text-color">
      <button
        ref={ref}
        type="button"
        className={'text-color-btn' + (open ? ' open' : '')}
        onClick={() => setOpen((o) => !o)}
        aria-label={`${label} colour`}
        title={`${label} colour${value || !auto ? '' : ' (auto)'}`}
      >
        {kind === 'fill' ? (
          <svg className="text-color-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 11.5 11.5 5l7 7-6.5 6.5a1.5 1.5 0 0 1-2.1 0L5 13.6a1.5 1.5 0 0 1 0-2.1z" />
            <path d="M8 2.5 11.5 5" />
            <path d="M20 15.5s1.5 1.8 1.5 2.8a1.5 1.5 0 0 1-3 0c0-1 1.5-2.8 1.5-2.8z" fill="currentColor" stroke="none" />
          </svg>
        ) : (
          <span className="text-color-a">A</span>
        )}
        <span className="text-color-bar" style={{ background: bar || shown }} />
      </button>
      {open && (
        <ColorPickerPopover
          value={shown}
          anchorRef={ref}
          onClose={() => setOpen(false)}
          // The picker reports its starting colour on open; that isn't a pick.
          onChange={(v) => { if (String(v).toUpperCase() === String(shown).toUpperCase()) return; onChange(v); }}
          onAuto={value && auto ? () => { onChange(null); setOpen(false); } : undefined}
          allowGradient={allowGradient}
          gradientValue={gradientValue}
          onChangeGradient={onChangeGradient}
        />
      )}
    </span>
  );
}
