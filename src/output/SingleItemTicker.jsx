import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ShatterText from './ShatterText.jsx';

const ALIGN_JUSTIFY = { left: 'flex-start', center: 'center', right: 'flex-end' };
const VERTICAL_ALIGN_ITEMS = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };

// How long the change between two headlines takes, sting included.
const STING_MS = { breaking: 1500, shatter: 2000 };

// Shrink to fit: never smaller than this share of the bar's own text size.
const MIN_FIT = 0.35;

export default function SingleItemTicker({ items, animation, durationSec, itemStyle, className, align = 'left', verticalAlign, onIndexChange, stingText = 'BREAKING NEWS', autoFit = false }) {
  const [index, setIndex] = useState(0);
  const wrapRef = useRef(null);
  const textRef = useRef(null);
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
    // The Breaking News sting plays between two headlines: the old one shrinks away, the
    // sting assembles and shrinks to the centre, then the next one lands.
    const transMs = STING_MS[animation] || 420;
    const timers = [];

    // Fade/slide/flip are CSS *transitions* — they just need the 'in' class applied
    // for one tick before flipping to 'hold' so the transition fires. Typewriter is a
    // discrete *keyframe animation* (steps reveal) — flipping to 'hold' early cancels
    // it mid-reveal, so give it its full 0.6s to actually type out.
    const inMs = animation === 'typewriter' ? 620 : 30;

    setPhase('in');
    timers.push(setTimeout(() => setPhase('hold'), inMs));

    if (items.length > 1) {
      timers.push(setTimeout(() => setPhase('out'), holdMs));
      timers.push(setTimeout(() => setIndex((i) => (i + 1) % items.length), holdMs + transMs));
    }

    return () => timers.forEach(clearTimeout);
  }, [safeIndex, key, durationSec, animation]);

  // With autoFit the headline is measured at its full size and scaled down (--fit) just
  // enough to fit the bar's width; without it, it keeps its size and ends in an ellipsis.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return undefined;
    const fit = () => {
      if (!autoFit) { wrap.style.removeProperty('--fit'); return; }
      wrap.style.setProperty('--fit', '1');
      const cs = getComputedStyle(wrap);
      const room = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const needed = text.scrollWidth;
      wrap.style.setProperty('--fit', String(needed > room && needed > 0 ? Math.max(MIN_FIT, room / needed) : 1));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [autoFit, safeIndex, key, itemStyle?.fontSize, itemStyle?.fontFamily, itemStyle?.fontWeight]);

  if (items.length === 0) return null;

  const cls = `single-item anim-${animation} phase-${phase}${className ? ' ' + className : ''}`;

  return (
    <div
      ref={wrapRef}
      className="single-item-wrap"
      style={{
        justifyContent: ALIGN_JUSTIFY[align] || 'flex-start',
        ...(verticalAlign ? { alignItems: VERTICAL_ALIGN_ITEMS[verticalAlign] || 'center' } : {}),
      }}
    >
      <span key={safeIndex} ref={textRef} className={cls} style={autoFit ? { ...itemStyle, fontSize: `calc(${itemStyle?.fontSize || '1em'} * var(--fit, 1))` } : itemStyle}>{items[safeIndex]}</span>
      {STING_MS[animation] && phase === 'out' && (
        <span
          key={`sting-${safeIndex}`}
          className={'breaking-sting' + (animation === 'shatter' ? ' breaking-sting-shatter' : '')}
          style={{ fontFamily: itemStyle?.fontFamily, fontSize: itemStyle?.fontSize }}
          aria-hidden="true"
        >
          {animation === 'shatter' ? <ShatterText text={stingText} /> : stingText}
        </span>
      )}
    </div>
  );
}
