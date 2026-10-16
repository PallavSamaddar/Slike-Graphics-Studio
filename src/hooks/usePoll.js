import { useEffect, useRef } from 'react';

// Runs `fn` every `ms` while `on` (and once at the start too with `immediate`, or first after
// `delay` ms), stopping on unmount or when a dep changes. `fn` gets `isStopped()` so a late
// answer can be dropped.
export default function usePoll(fn, ms, deps, { on = true, immediate = false, delay } = {}) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!on || !(ms > 0)) return undefined;
    let stopped = false;
    let interval;
    const run = () => fnRef.current(() => stopped);
    const start = () => { interval = setInterval(run, ms); };
    let first;
    if (delay > 0) first = setTimeout(() => { run(); start(); }, delay);
    else {
      if (immediate) run();
      start();
    }
    return () => {
      stopped = true;
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [on, ms, immediate, delay, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
