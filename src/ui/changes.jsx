import { createContext, useContext, useMemo } from 'react';

// Which settings moved since the last save: every field that names its `path` reads this
// and wears the change mark (Player Console · ChangeMark) while it differs.
const ChgCtx = createContext(() => false);
export const useChanged = () => useContext(ChgCtx);

function leafPaths(obj, pre = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const p = pre ? `${pre}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) leafPaths(v, p, out);
    else out[p] = JSON.stringify(v);
  }
  return out;
}

export function ChangeScope({ saved, cur, children }) {
  const changed = useMemo(() => {
    const a = leafPaths(saved);
    const b = leafPaths(cur);
    const set = new Set();
    for (const p of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[p] !== b[p]) set.add(p);
    return (paths) => [].concat(paths).some((q) => [...set].some((p) => p === q || p.startsWith(q + '.')));
  }, [saved, cur]);
  return <ChgCtx.Provider value={changed}>{children}</ChgCtx.Provider>;
}

