import { useRef } from 'react';

// A single-line horizontally scrollable row with left/right arrow buttons,
// used for swatch pickers that would otherwise wrap onto multiple lines.
export default function ScrollRow({ children, hideNav, navInline, className }) {
  const trackRef = useRef(null);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: 'smooth' });
  };

  const nav = !hideNav && (
    <div className={'scroll-row-nav' + (navInline ? ' scroll-row-nav-inline' : '')}>
      <button type="button" className="scroll-row-arrow" onClick={() => scrollBy(-1)} aria-label="Scroll left">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button type="button" className="scroll-row-arrow" onClick={() => scrollBy(1)} aria-label="Scroll right">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );

  return (
    <div className={'scroll-row' + (navInline ? ' scroll-row-inline-wrap' : '') + (className ? ' ' + className : '')}>
      <div className="scroll-row-track" ref={trackRef}>
        {children}
      </div>
      {nav}
    </div>
  );
}
