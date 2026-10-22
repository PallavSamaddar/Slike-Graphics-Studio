// The on-air page loads only the web fonts its graphic uses (Inter always, for its labels),
// one stylesheet request; Georgia and Courier are system fonts.
const WEB_FONTS = {
  Inter: 'Inter:wght@400;500;600;700;800',
  'Playfair Display': 'Playfair+Display:wght@600;700;800',
  Roboto: 'Roboto:wght@400;500;700',
  Merriweather: 'Merriweather:wght@400;700',
};
const loaded = new Set();

export function loadFontsFor(st) {
  const used = [st?.text, st?.headingText, st?.bodyText, st?.headlineText, st?.style]
    .map((t) => t?.fontFamily || '')
    .join(' ');
  const wanted = Object.keys(WEB_FONTS).filter((name) => (name === 'Inter' || used.includes(name)) && !loaded.has(name));
  if (!wanted.length) return;
  wanted.forEach((name) => loaded.add(name));
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${wanted.map((name) => `family=${WEB_FONTS[name]}`).join('&')}&display=swap`;
  document.head.appendChild(link);
}
