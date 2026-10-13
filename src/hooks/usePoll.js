import { useEffect, useRef } from 'react';

// Runs `fn` every `ms` while `on` (and once at the start too with `immediate`), stopping on
// unmount or when a dep changes. `fn` gets `isStopped()` so a late answer can be dropped.
export default function usePoll(fn, ms, deps, { on = true, immediate = false } = {}) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!on || !(ms > 0)) return undefined;
    let stopped = false;
    const run = () => fnRef.current(() => stopped);
    if (immediate) run();
    const timer = setInterval(run, ms);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [on, ms, immediate, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
