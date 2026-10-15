import { useLayoutEffect, useRef, useState } from 'react';

// A graphic laid out at its natural width, scaled to fit the window (less `inset` on every
// side). The on-air player and the editor's full-screen preview both show it this way; with
// `inParent` it fits the box it sits in instead (the editor's preview area), never past `maxScale`.
export const NATURAL_WIDTH = { widget: 420, jacket: 640 };
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
