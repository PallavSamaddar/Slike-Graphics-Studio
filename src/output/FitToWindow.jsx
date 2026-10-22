import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// A graphic laid out at its natural width, scaled to fit the window (less `inset` on every
// side). The on-air player and the editor's full-screen preview both show it this way; with
// `inParent` it fits the box it sits in instead (the editor's preview area), never past `maxScale`.
export const NATURAL_WIDTH = { widget: 640, jacket: 640 };
export const FIT_INSET = { widget: 0.1 };

export default function FitToWindow({ width, inset = 0, inParent = false, maxScale = Infinity, children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useLayoutEffect(() => {
    const inner = innerRef.current;
    const measure = () => {
      const height = inner.offsetHeight;
      if (!height) return;
      const room = 1 - 2 * inset;
      let boxW = window.innerWidth;
      let boxH = window.innerHeight;
      const box = inParent ? outerRef.current?.parentElement : null;
      if (box) {
        const cs = getComputedStyle(box);
        boxW = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        boxH = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      }
      const scale = Math.min((boxW * room) / width, (boxH * room) / height, maxScale);
      const next = scale > 0 ? scale : 1;
      setFit((f) => (f.scale === next && f.height === height ? f : { scale: next, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    if (inParent && outerRef.current?.parentElement) observer.observe(outerRef.current.parentElement);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, inset, inParent, maxScale]);

  return (
    <div ref={outerRef} className="player-fit" style={{ width: width * fit.scale, height: fit.height * fit.scale }}>
      <div ref={innerRef} className="player-fit-inner" style={{ width, transform: `scale(${fit.scale})` }}>
        {children}
      </div>
    </div>
  );
}

// A graphic that fills the whole window, whatever its shape (16:9, vertical, square…): laid
// out at the window's own proportions, scaled so its shorter side matches a width × height
// design. In a 16:9 window that is the same as FitToWindow; in a vertical one the graphic
// keeps its design width and grows taller. The scale is passed on as --fill-scale, so the
// graphic's CSS can keep text readable on screen however small the window.
export function FillWindow({ width, height, children }) {
  const [box, setBox] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const measure = () => setBox((b) => (b.w === window.innerWidth && b.h === window.innerHeight ? b : { w: window.innerWidth, h: window.innerHeight }));
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const fit = Math.min(box.w / width, box.h / height);
  const scale = fit > 0 ? fit : 1;
  return (
    <div className="player-fill" style={{ '--fill-scale': scale }}>
      <div className="player-fit-inner" style={{ width: (box.w + 1) / scale, height: (box.h + 1) / scale, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
