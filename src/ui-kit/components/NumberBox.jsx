import { useEffect, useState } from 'react';

// A number box with its unit inside it. ↑/↓ step by 1, Shift by 10, never below the minimum.
export default function NumberBox({ value, onChange, unit, min = 0, max = Infinity, off = false, ariaLabel }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const commit = (n) => { const c = clamp(n); setText(String(c)); onChange(c); };
  const commitText = () => {
    const n = parseFloat(text);
    if (Number.isNaN(n)) setText(String(value));
    else commit(n);
  };
  return (
    <span className={'num-wrap' + (off ? ' off' : '')}>
      <input
        value={text}
        inputMode="decimal"
        aria-label={ariaLabel}
        disabled={off}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseFloat(e.target.value);
          if (n >= min && n <= max) onChange(n);
        }}
        onBlur={commitText}
        onKeyDown={(e) => {
          if (!off && e.key === 'Enter') commitText();
          if (off || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
          e.preventDefault();
          const base = parseFloat(text) || 0;
          commit(base + (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1));
        }}
      />
      {unit && <span className="unit">{unit}</span>}
    </span>
  );
}
