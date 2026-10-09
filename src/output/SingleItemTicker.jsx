import { useEffect, useRef, useState } from 'react';

// Cycles through items one at a time, holding each for `durationSec`,
// transitioning between them with the chosen `animation`. Stops after the last item.
const ALIGN_JUSTIFY = { left: 'flex-start', center: 'center', right: 'flex-end' };
const VERTICAL_ALIGN_ITEMS = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };

export default function SingleItemTicker({ items, animation, durationSec, itemStyle, className, align = 'left', verticalAlign, onIndexChange }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('in'); // 'in' | 'hold' | 'out'
  const key = items.join('|');
  const safeIndex = items.length ? Math.min(index, items.length - 1) : 0;

  // Reset to the first item whenever the item list, animation, or duration changes.
  useEffect(() => {
    setIndex(0);
    setPhase('in');
  }, [key, animation, durationSec]);

  useEffect(() => {
    if (onIndexChange) onIndexChange(safeIndex);
  }, [safeIndex, onIndexChange]);

  useEffect(() => {
    if (items.length === 0) return undefined;

    const holdMs = Math.max(1, durationSec) * 1000;
    const transMs = 420;
    const timers = [];

    // Fade/slide/flip are CSS *transitions* — they just need the 'in' class applied
    // for one tick before flipping to 'hold' so the transition fires. Typewriter is a
    // discrete *keyframe animation* (steps reveal) — flipping to 'hold' early cancels
    // it mid-reveal, so give it its full 0.6s to actually type out.
    const inMs = animation === 'typewriter' ? 620 : 30;

    setPhase('in');
    timers.push(setTimeout(() => setPhase('hold'), inMs));

    if (safeIndex < items.length - 1) {
      timers.push(setTimeout(() => setPhase('out'), holdMs));
      timers.push(setTimeout(() => setIndex((i) => Math.min(i + 1, items.length - 1)), holdMs + transMs));
    }

    return () => timers.forEach(clearTimeout);
  }, [safeIndex, key, durationSec, animation]);

  if (items.length === 0) return null;

  const cls = `single-item anim-${animation} phase-${phase}${className ? ' ' + className : ''}`;

  return (
    <div
      className="single-item-wrap"
      style={{
        justifyContent: ALIGN_JUSTIFY[align] || 'flex-start',
        ...(verticalAlign ? { alignItems: VERTICAL_ALIGN_ITEMS[verticalAlign] || 'center' } : {}),
      }}
    >
      <span key={safeIndex} className={cls} style={itemStyle}>{items[safeIndex]}</span>
    </div>
  );
}
