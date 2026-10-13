import { fromGraphic } from './graphicMapper.js';

export function airFromPublished(kind, published, initialState = null) {
  if (!published?.v) return null;
  const off = published.off || null;
  const snap = !off && initialState && published.config ? fromGraphic({ kind, ...published }, initialState) : null;
  return {
    v: published.v,
    at: published.at || 0,
    by: published.by || '',
    note: published.note || '',
    snap,
    history: published.history || [],
    off,
    live: null,
  };
}

// True while a published version is on air (published and not taken off).
export const isOnAir = (air) => !!air && air.v > 0 && !air.off;
export const liveStream = () => null;
