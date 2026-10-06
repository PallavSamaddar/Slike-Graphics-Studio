export const initialState = {
  template: 'classic',
  items: [
    "Breaking news: India's GDP growth hits 7.4% in Q2, beats forecast",
    'Stock markets close higher — Sensex surges 620 pts, Nifty at record high',
    'India vs Australia: Live scorecard — IND 278/4 after 45 overs',
    'Cabinet approves new renewable energy policy targeting 500 GW by 2030',
    'Delhi weather: Heavy rains expected this week, IMD issues orange alert',
  ],
  badge: { show: true, type: 'LIVE', customText: 'LIVE', bgColor: '#D7282F', textColor: '#FFFFFF', fontWeight: '700', scale: 1 },
  style: { bgColor: '#FFFFFF', textColor: '#1A1714', accentColor: '#D7282F', separatorColor: '#D7282F', height: '48px', cornerRadius: '0px', bgGradient: null, ddStyle: 'chevron' },
  text: { fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '500', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left', letterSpacing: '0em', textTransform: 'none' },
  behavior: { speed: 2, mode: 'loop', animation: 'fade', itemDuration: 5 },
  activeTab: 'content',
  device: 'desktop',
  src: 'manual',
  rssUrl: '',
  jsonUrl: '',
  // Per-source drafts — each Content Source tab edits its own, independent of the
  // others, so switching tabs never silently wipes what was typed elsewhere.
  drafts: {
    manual: [
      "Breaking news: India's GDP growth hits 7.4% in Q2, beats forecast",
      'Stock markets close higher — Sensex surges 620 pts, Nifty at record high',
      'India vs Australia: Live scorecard — IND 278/4 after 45 overs',
      'Cabinet approves new renewable energy policy targeting 500 GW by 2030',
      'Delhi weather: Heavy rains expected this week, IMD issues orange alert',
    ],
    rss: [],
    json: [],
  },
};

export const initialWidgetState = {
  template: 'crimson-dots',
  heading: '',
  items: [''],
  category: 'News',
  showCategory: true,
  showTime: true,
  publishedAt: null,
  showProduct: true,
  src: 'manual',
  rssUrl: '',
  jsonUrl: '',
  drafts: {
    manual: [''],
    rss: [],
    json: [],
  },
  // Per-headline media picks for the Feed/JSON sources — parallel arrays to
  // drafts.rss/drafts.json, each entry `{ included, pos }` or null if the
  // user hasn't ticked media for that line yet.
  media: {
    rss: [],
    json: [],
  },
  style: {
    bg: '#8A1B12',
    bgGradient: 'linear-gradient(160deg, #E8432B 0%, #6E140D 55%)',
    texture: 'spiral',
    textureOpacity: 0.28,
    headingBg: 'rgba(194,47,30,0)',
    headingBgGradient: null,
    fontFamily: 'Inter, sans-serif',
  },
  headingText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '19px',
    fontWeight: '800',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
  },
  bodyText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '15px',
    fontWeight: '800',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  behavior: {
    animation: 'fade',
    itemDuration: 4,
  },
};

// A "Jacket" overlays a full-bleed live feed with a few broadcast-standard
// elements: a bottom-left logo + scrolling ticker headline, a bottom-right
// time/weather box, and an optional vertical image panel on the left or
// right edge. Unlike the widget, it has no content-source machinery
// (Feed/JSON/media) — just a headline string and branding fields.
export const initialJacketState = {
  template: 'crimson-global',
  logoText: 'TOI',
  logoSubtext: 'News That Moves, Nonstop.',
  tagText: 'GLOBAL',
  headline: "Breaking news from India ◆ Markets hit record high ◆ Watch: today's top stories",
  tickerTemplate: null,
  tickerStyleOverrides: {},
  tickerBadgeOverrides: {},
  weather: '',
  showTime: true,
  showWeather: false,
  showLogo: true,
  showHeadline: true,
  mainVideoUrl: null,
  mainVideoName: '',
  mainVideoPreset: null,
  logoImage: null,
  logoImageName: '',
  logoPos: 'bottom-left',
  imagePanelPos: 'left',
  imagePanelSize: 26,
  sideImage: null,
  sideImageName: '',
  style: {
    logoColor: '#C22F1E',
    logoGradient: null,
    tagColor: '#1A1714',
    timeColor: '#C22F1E',
    fontFamily: 'Inter, sans-serif',
  },
  headlineText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '22px',
    fontWeight: '800',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    textTransform: 'uppercase',
  },
};
