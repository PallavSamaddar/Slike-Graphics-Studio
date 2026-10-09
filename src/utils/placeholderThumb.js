// Deterministic gradient placeholder for a feed/JSON headline's dummy media
// thumbnail — same headline always renders the same placeholder art.
const THUMB_PALETTES = [
  ['#E8432B', '#6E140D'],
  ['#3B4A7A', '#131A2B'],
  ['#2E7D6B', '#0F332B'],
  ['#8A5A1B', '#3B2508'],
  ['#5B3B8A', '#241533'],
];
export const placeholderThumb = (seed) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const [from, to] = THUMB_PALETTES[hash % THUMB_PALETTES.length];
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="360" height="640" fill="url(#g)"/><circle cx="180" cy="260" r="70" fill="rgba(255,255,255,0.18)"/><rect x="70" y="380" width="220" height="16" rx="8" fill="rgba(255,255,255,0.22)"/><rect x="100" y="410" width="160" height="12" rx="6" fill="rgba(255,255,255,0.16)"/></svg>`
  );
};
