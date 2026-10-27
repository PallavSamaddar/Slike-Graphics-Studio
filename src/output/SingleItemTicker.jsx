import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ShatterText from './ShatterText.jsx';
import GoldSting, { GoldLanding } from './GoldSting.jsx';

const ALIGN_JUSTIFY = { left: 'flex-start', center: 'center', right: 'flex-end' };
const VERTICAL_ALIGN_ITEMS = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };

const STING_MS = { breaking: 1500, shatter: 1400, gold: 1500 };
const GOLD_TAIL_MS = 450;

const READ_MS = 2000;
const END_MS = 1500;
const SCROLL_EMS = 4;

export default function SingleItemTicker({ items, animation, durationSec, itemStyle, className, align = 'left', verticalAlign, onIndexChange, stingText = 'BREAKING NEWS', minFit = 1 }) {
  const [index, setIndex] = useState(0);
  // Bumped to play a lone headline again (one that scrolls), since its index never changes.
  const [cycle, setCycle] = useState(0);
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const scrollRef = useRef({ ms: 0 }); // the current headline's scroll, measured before its timers start
  const [phase, setPhase] = useState('in'); // 'in' | 'hold' | 'out'
  const [goldSting, setGoldSting] = useState(null);
  const key = items.join('|');
  const safeIndex = items.length ? Math.min(index, items.length - 1) : 0;

  // Reset to the first item whenever the item list, animation, or duration changes.
  useEffect(() => {
    setIndex(0);
    setPhase('in');
    setGoldSting(null);
  }, [key, animation, durationSec]);

  useEffect(() => {
    if (onIndexChange) onIndexChange(safeIndex);
  }, [safeIndex, onIndexChange]);

  useEffect(() => {
    if (items.length === 0) return undefined;

    const transMs = STING_MS[animation] || 420;
    const timers = [];

    const inMs = animation === 'typewriter' ? 620 : 30;
    const scrollMs = scrollRef.current.ms;
    const holdMs = Math.max(Math.max(1, durationSec) * 1000, scrollMs ? inMs + READ_MS + scrollMs + END_MS : 0);

    setPhase('in');
    timers.push(setTimeout(() => setPhase('hold'), inMs));
    if (animation === 'gold') timers.push(setTimeout(() => setGoldSting(null), GOLD_TAIL_MS));

    if (items.length > 1) {
      timers.push(setTimeout(() => {
        setPhase('out');
        if (animation === 'gold') setGoldSting(safeIndex);
      }, holdMs));
      timers.push(setTimeout(() => setIndex((i) => (i + 1) % items.length), holdMs + transMs));
    } else if (scrollMs) {
      timers.push(setTimeout(() => setCycle((c) => c + 1), holdMs));
    }

    return () => timers.forEach(clearTimeout);
  }, [safeIndex, cycle, key, durationSec, animation]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return undefined;
    // Runs before the timers' effect, so they know how long this headline's scroll takes.
    const fit = () => {
      wrap.style.setProperty('--fit', '1');
      const cs = getComputedStyle(wrap);
      const room = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const needed = text.offsetWidth;
      const scale = needed > room && needed > 0 ? Math.max(minFit, room / needed) : 1;
      wrap.style.setProperty('--fit', String(scale));
      const dist = Math.max(0, Math.ceil(needed * scale - room));
      const fontPx = parseFloat(getComputedStyle(text).fontSize) || 16;
      const ms = dist ? Math.round((dist / (fontPx * SCROLL_EMS)) * 1000) : 0;
      scrollRef.current = { ms };
      text.style.setProperty('--scroll-dist', `${dist}px`);
      text.style.setProperty('--scroll-ms', `${ms}ms`);
      text.style.setProperty('--scroll-delay', `${READ_MS}ms`);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [safeIndex, cycle, key, minFit, itemStyle?.fontSize, itemStyle?.fontFamily, itemStyle?.fontWeight]);

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
      <span key={`${safeIndex}-${cycle}`} className={cls} style={{ ...itemStyle, fontSize: `calc(${itemStyle?.fontSize || '1em'} * var(--fit, 1))` }}>
        <span ref={textRef} className="single-item-text">{items[safeIndex]}</span>
      </span>
      {animation === 'gold' && phase !== 'out' && <GoldLanding key={`land-${safeIndex}`} />}
      {animation === 'gold' && goldSting !== null && (
        <GoldSting key={`sting-${goldSting}`} text={stingText} style={{ fontFamily: itemStyle?.fontFamily, fontSize: itemStyle?.fontSize }} />
      )}
      {(animation === 'breaking' || animation === 'shatter') && phase === 'out' && (
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
