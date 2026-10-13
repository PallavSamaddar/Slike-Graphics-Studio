import { useLayoutEffect, useRef, useState } from 'react';

const REF_HEIGHT = 1080;

// Turns a scroll rate (px per second on a 1080p canvas) into an animation
// duration for a ticker track. The track holds two copies of the feed and
// tickerScroll moves it by -50%, i.e. one copy's width — so the duration
// grows with the feed and the on-screen speed stays the same whatever its
// length.
//
// `scaledTo`: CSS selector of the container-query ancestor the ticker is
// sized against (the small preview). The rate is scaled by that container's
// height / 1080 so the preview moves at the same relative speed as on air.
// Omit it when the ticker is rendered at real size.
//
// `active`: false while the track isn't rendered (e.g. single-item mode),
// so the measurement re-attaches when it comes back.
export default function useTickerScrollDuration(pxPerSec, { scaledTo, active = true } = {}) {
  const ref = useRef(null);
  const [durationMs, setDurationMs] = useState(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!active || !el) return undefined;
    const container = scaledTo ? el.closest(scaledTo) : null;

    const measure = () => {
      const distance = el.scrollWidth / 2;
      const scale = container ? container.clientHeight / REF_HEIGHT : 1;
      const rate = pxPerSec * (scale || 1);
      if (distance > 0 && rate > 0) setDurationMs(Math.round((distance / rate) * 1000));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (container) ro.observe(container);
    // Web fonts change the text width once they finish loading.
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [pxPerSec, scaledTo, active]);

  return [ref, durationMs];
}
