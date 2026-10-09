// Which templates the home page features per kind, and the usage note (if any) on each —
// static for now, no real usage tracking yet.
export const FEATURED = {
  ticker: { limit: 3, items: [
    { id: 'classic', badge: 'Most used' },
    { id: 'gradient', badge: 'Recently used' },
    { id: 'breaking', badge: null },
  ] },
  widget: { limit: 6, items: [
    { id: 'crimson-dots', badge: 'Recently used' },
    { id: 'midnight-solid', badge: null },
    { id: 'paper-light', badge: null },
    { id: 'crimson-image-left', badge: null },
    { id: 'midnight-image-right', badge: null },
    { id: 'emerald-globe', badge: null },
  ] },
  jacket: { limit: 4, items: [
    { id: 'crimson-global', badge: null },
    { id: 'midnight-global', badge: null },
    { id: 'charcoal-global', badge: null },
    { id: 'emerald-global', badge: null },
  ] },
};
