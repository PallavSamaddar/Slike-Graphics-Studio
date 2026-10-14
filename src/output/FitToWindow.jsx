import { useLayoutEffect, useRef, useState } from 'react';

// A graphic laid out at its natural width, scaled to fit the window (less `inset` on every
// side). The on-air player and the editor's full-screen preview both show it this way.
export const NATURAL_WIDTH = { widget: 420, jacket: 640 };
export const FIT_INSET = { widget: 0.1 };

export default function FitToWindow({ width, inset = 0, children }) {
  const innerRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useLayoutEffect(() => {
    const inner = innerRef.current;
    const measure = () => {
      const height = inner.offsetHeight;
      if (!height) return;
      const room = 1 - 2 * inset;
      setFit({ scale: Math.min((window.innerWidth * room) / width, (window.innerHeight * room) / height), height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, inset]);

  return (
    <div className="player-fit" style={{ width: width * fit.scale, height: fit.height * fit.scale }}>
      <div ref={innerRef} className="player-fit-inner" style={{ width, transform: `scale(${fit.scale})` }}>
        {children}
      </div>
    </div>
  );
}
