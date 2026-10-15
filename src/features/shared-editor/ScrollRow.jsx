import { useEffect, useRef, useState } from 'react';

// A single-line horizontally scrollable row, used for swatch pickers that would otherwise
// wrap onto multiple lines. Its left/right arrows sit over the row's edges, level with the
// swatches (or inline after the row with `navInline`); each shows only while there's more
// to scroll that way.
export default function ScrollRow({ children, hideNav, navInline, className }) {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = trackRef.current;
    if (!el || hideNav) return undefined;
    const update = () => setEdges({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, [hideNav, children]);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: 'smooth' });
  };

  const arrow = (dir) => (
    <button
      type="button"
      className={'scroll-row-arrow' + (navInline ? '' : ' scroll-row-arrow-side scroll-row-arrow-' + (dir < 0 ? 'left' : 'right'))}
      onClick={() => scrollBy(dir)}
      aria-label={dir < 0 ? 'Scroll left' : 'Scroll right'}
      hidden={!navInline && !(dir < 0 ? edges.left : edges.right)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={dir < 0 ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
      </svg>
    </button>
  );

  return (
    <div className={'scroll-row' + (navInline ? ' scroll-row-inline-wrap' : '') + (className ? ' ' + className : '')}>
      <div className="scroll-row-track" ref={trackRef}>
        {children}
      </div>
      {!hideNav && (navInline ? (
        <div className="scroll-row-nav scroll-row-nav-inline">{arrow(-1)}{arrow(1)}</div>
      ) : (
        <>{arrow(-1)}{arrow(1)}</>
      ))}
    </div>
  );
}
