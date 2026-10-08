// What changed between two states of a graphic, in the page's own words, for the change
// review (Player Console · ChangeReview): sections in the page's order, each change its
// name, then the old value → the new one.
import { TPLS } from '../data/templates.js';
import { WIDGET_TPLS } from '../data/widgetTemplates.js';
import { JACKET_TPLS } from '../data/jacketTemplates.js';

const FONTS = {
  'Inter, sans-serif': 'Inter',
  'Roboto, sans-serif': 'Roboto',
  "'Playfair Display', Georgia, serif": 'Playfair Display',
  "Georgia, 'Times New Roman', serif": 'Georgia',
  'Merriweather, serif': 'Merriweather',
  "'Courier New', Courier, monospace": 'Courier',
};
const HEIGHTS = { '36px': 'Compact — 36px', '44px': 'Small — 44px', '48px': 'Standard — 48px', '56px': 'Tall — 56px', '64px': 'Large — 64px' };
const BANNER = { chevron: 'Chevron — angled banner + tag', split: 'Split block — solid + angled', stripes: 'Diagonal stripes accent', pill: 'Rounded pill tag' };
const SCALE = { 0.8: 'Small', 1: 'Standard', 1.3: 'Large', 1.6: 'Extra large' };
const SPEED = { 1: 'Slow', 2: 'Medium', 3: 'Fast' };
const ANIM = { fade: 'Fade', flip: 'Flip', slide: 'Slide', typewriter: 'Typewriter' };
const CASE = { none: 'As typed', uppercase: 'UPPERCASE', lowercase: 'lowercase', capitalize: 'Title Case' };
const SRC = { manual: 'Manual', rss: 'Feed', json: 'JSON' };
const ALIGN = { left: 'Left', center: 'Centre', right: 'Right', top: 'Top', middle: 'Middle', bottom: 'Bottom' };
const POS = { left: 'Left', right: 'Right', top: 'Top', 'top-left': 'Top left', 'top-right': 'Top right', 'bottom-left': 'Bottom left', 'bottom-right': 'Bottom right' };
const TEXTURE = {
  none: 'None', spiral: 'Spiral Dots', globe: 'Earth Orbit', 'wave-flow': 'Wave Flow', 'light-trails': 'Light Trails',
  'circular-sweep': 'Circular Sweep', 'arrow-motion': 'Arrow Motion', 'radar-sweep': 'Radar Sweep', 'grid-pulse': 'Grid Pulse',
  'data-stream': 'Data Stream', 'bokeh-glow': 'Bokeh Glow', 'video-news': 'News Background', 'video-rede': 'Rede BG',
  'video-red': 'Red Background', 'video-custom': 'Uploaded video',
};
const onOff = (v) => (v ? 'On' : 'Off');
const tplName = (list) => (v) => (list.find((t) => t.id === v)?.name ?? (v === 'scratch' ? 'From scratch' : v));

// A formatting block (font, size, weight…) under a prefix.
const fmt = (pre) => ({
  fontFamily: [`${pre}font`, (v) => FONTS[v] ?? v],
  fontSize: [`${pre}font size`, (v) => String(v).replace('px', '') + 'px'],
  fontWeight: [`${pre}bold`, (v) => (parseInt(v, 10) >= 700 ? 'On' : 'Off')],
  fontStyle: [`${pre}italic`, (v) => (v === 'italic' ? 'On' : 'Off')],
  textDecoration: [`${pre}underline`, (v) => (v === 'underline' ? 'On' : 'Off')],
  textAlign: [`${pre}alignment`, (v) => ALIGN[v] ?? v],
  textTransform: [`${pre}text case`, (v) => CASE[v] ?? v],
  letterSpacing: [`${pre}letter spacing`],
  verticalAlign: [`${pre}vertical align`, (v) => ALIGN[v] ?? v],
});
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// [section, label, format?] per path. Paths left out are not reviewed (view state, timestamps,
// the per-source drafts that the live content already carries).
const MAPS = {
  ticker: {
    order: ['Content source', 'Style', 'Badge', 'Behaviour'],
    skip: ['activeTab', 'device', 'drafts'],
    keys: {
      template: ['Style', 'Template', tplName(TPLS)],
      src: ['Content source', 'Source', (v) => SRC[v] ?? v],
      rssUrl: ['Content source', 'Feed URL'],
      jsonUrl: ['Content source', 'JSON URL or raw array'],
      items: ['Content source', 'Line'],
      'style.bgColor': ['Style', 'Background colour'],
      'style.bgGradient': ['Style', 'Background gradient'],
      'style.height': ['Style', 'Height', (v) => HEIGHTS[v] ?? v],
      'style.ddStyle': ['Badge', 'Banner style', (v) => BANNER[v] ?? v],
      'style.textColor': ['Style', 'Text colour'],
      'style.accentColor': ['Style', 'Accent colour'],
      'style.separatorColor': ['Style', 'Separator colour'],
      'style.cornerRadius': ['Style', 'Corner radius'],
      'style.layout': ['Style', 'Layout'],
      'style.badgeShape': ['Badge', 'Badge shape'],
      'badge.show': ['Badge', 'Badge', onOff],
      'badge.customText': ['Badge', 'Badge text'],
      'badge.type': ['Badge', 'Badge type'],
      'badge.bgColor': ['Badge', 'Background'],
      'badge.textColor': ['Badge', 'Text colour'],
      'badge.fontWeight': ['Badge', 'Weight'],
      'badge.scale': ['Badge', 'Badge size', (v) => SCALE[v] ?? v],
      'badge.tag2': ['Badge', 'Tag'],
      ...Object.fromEntries(Object.entries(fmt('')).map(([k, [l, f]]) => [`text.${k}`, ['Style', cap(l), f]])),
      'behavior.mode': ['Behaviour', 'Display mode', (v) => (v === 'single' ? 'Sequential' : 'Continuous')],
      'behavior.speed': ['Behaviour', 'Scroll speed', (v) => SPEED[v] ?? v],
      'behavior.animation': ['Behaviour', 'Text animation', (v) => ANIM[v] ?? v],
      'behavior.itemDuration': ['Behaviour', 'Duration', (v) => `${v}s`],
    },
  },
  widget: {
    order: ['Content', 'Style', 'Details', 'Background'],
    skip: ['drafts', 'publishedAt', 'style.customVideoUrl', 'style.badgeImage'],
    keys: {
      template: ['Style', 'Template', tplName(WIDGET_TPLS)],
      src: ['Content', 'Source', (v) => SRC[v] ?? v],
      rssUrl: ['Content', 'Feed URL'],
      jsonUrl: ['Content', 'JSON URL or raw array'],
      heading: ['Content', 'Heading'],
      items: ['Content', 'Description line'],
      media: ['Content', 'Images/videos with headlines', (v) => (v && v.length ? 'Included' : 'Off')],
      category: ['Details', 'Category text'],
      showCategory: ['Details', 'Show category', onOff],
      showTime: ['Details', 'Show time posted', onOff],
      showProduct: ['Details', 'Show publisher', onOff],
      'style.bg': ['Style', 'Background colour'],
      'style.bgGradient': ['Style', 'Background gradient'],
      'style.headingBg': ['Style', 'Heading background'],
      'style.headingBgGradient': ['Style', 'Heading background gradient'],
      'style.badgeImageName': ['Style', 'Image'],
      'style.badgeImagePos': ['Style', 'Image position', (v) => POS[v] ?? v],
      'style.fontFamily': ['Style', 'Font', (v) => FONTS[v] ?? v],
      'style.texture': ['Background', 'Background', (v) => TEXTURE[v] ?? v],
      'style.textureOpacity': ['Background', 'Texture opacity', (v) => `${Math.round(v * 100)}%`],
      'style.textureColor': ['Background', 'Texture colour'],
      'style.textureSpeed': ['Background', 'Texture speed', (v) => `${v}×`],
      'style.customVideoName': ['Background', 'Uploaded video'],
      ...Object.fromEntries(Object.entries(fmt('heading ')).map(([k, [l, f]]) => [`headingText.${k}`, ['Style', cap(l), f]])),
      ...Object.fromEntries(Object.entries(fmt('description ')).map(([k, [l, f]]) => [`bodyText.${k}`, ['Style', cap(l), f]])),
      'behavior.animation': ['Style', 'Text animation', (v) => ANIM[v] ?? v],
      'behavior.itemDuration': ['Style', 'Duration', (v) => `${v}s`],
    },
  },
  jacket: {
    order: ['Content', 'Main video', 'Side image panel', 'Logo image', 'Style'],
    skip: ['mainVideoUrl', 'mainVideoPreset', 'logoImage', 'sideImage'],
    keys: {
      template: ['Style', 'Template', tplName(JACKET_TPLS)],
      logoText: ['Content', 'Logo text'],
      tagText: ['Content', 'Tag text'],
      logoSubtext: ['Content', 'Logo subtext'],
      headline: ['Content', 'Headline'],
      tickerTemplate: ['Content', 'Ticker style', (v) => (v ? tplName(TPLS)(v) : 'Plain')],
      weather: ['Content', 'Weather'],
      showLogo: ['Content', 'Show logo', onOff],
      showHeadline: ['Content', 'Show headline', onOff],
      showTime: ['Content', 'Show time', onOff],
      showWeather: ['Content', 'Show weather', onOff],
      mainVideoName: ['Main video', 'Video'],
      sideImageName: ['Side image panel', 'Image'],
      imagePanelPos: ['Side image panel', 'Position', (v) => POS[v] ?? v],
      imagePanelSize: ['Side image panel', 'Size'],
      logoImageName: ['Logo image', 'Image'],
      logoPos: ['Logo image', 'Position', (v) => POS[v] ?? v],
      'style.logoColor': ['Style', 'Logo colour'],
      'style.logoGradient': ['Style', 'Logo gradient'],
      'style.tagColor': ['Style', 'Tag colour'],
      'style.timeColor': ['Style', 'Time colour'],
      'style.fontFamily': ['Style', 'Font', (v) => FONTS[v] ?? v],
      ...Object.fromEntries(Object.entries(fmt('headline ')).map(([k, [l, f]]) => [`headlineText.${k}`, ['Style', cap(l), f]])),
      'tickerStyleOverrides.bgColor': ['Style', 'Ticker background'],
      'tickerStyleOverrides.bgGradient': ['Style', 'Ticker background gradient'],
      'tickerBadgeOverrides.bgColor': ['Style', 'Badge colour'],
      'tickerBadgeOverrides.type': ['Style', 'Badge text'],
      'tickerBadgeOverrides.show': ['Style', 'Badge', onOff],
    },
  },
};

const MAX = 46; // a review value cuts at 46 letters, the whole of it on hover
const show = (v, f) => {
  if (v === undefined || v === null || v === '') return 'None';
  const s = f ? String(f(v)) : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return s;
};
const cut = (s) => (s.length > MAX ? s.slice(0, MAX - 1) + '…' : s);

const humanize = (k) => cap(k.replace(/([A-Z])/g, ' $1').toLowerCase());

function leaves(obj, pre = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const p = pre ? `${pre}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) leaves(v, p, out);
    else out[p] = v;
  }
  return out;
}

// → [{ title, rows: [{ what, was, now, wasFull, nowFull }] }], and the count of changes.
export function diffGraphic(kind, from, to) {
  const map = MAPS[kind];
  const a = leaves(from);
  const b = leaves(to);
  const secs = {};
  const add = (sec, what, was, now) => {
    (secs[sec] ||= []).push({ what, was: cut(was), now: cut(now), wasFull: was.length > MAX ? was : undefined, nowFull: now.length > MAX ? now : undefined });
  };
  const paths = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  for (const p of paths) {
    if (map.skip.some((s) => p === s || p.startsWith(s + '.'))) continue;
    if (JSON.stringify(a[p]) === JSON.stringify(b[p])) continue;
    const top = p.split('.')[0];
    const entry = map.keys[p] || map.keys[top];
    const [sec, label, f] = entry || [map.order[map.order.length - 1], humanize(p.split('.').pop())];
    if (Array.isArray(a[p]) || Array.isArray(b[p])) {
      if (p === 'media') { add(sec, label, show(a[p], f), show(b[p], f)); continue; }
      const xa = a[p] || [];
      const xb = b[p] || [];
      for (let i = 0; i < Math.max(xa.length, xb.length); i++) {
        if (xa[i] === xb[i]) continue;
        add(sec, `${label} ${i + 1}`, show(xa[i]), show(xb[i]));
      }
      continue;
    }
    add(sec, label, show(a[p], f), show(b[p], f));
  }
  const sections = map.order.filter((t) => secs[t]).map((t) => ({ title: t, rows: secs[t] }));
  Object.keys(secs).filter((t) => !map.order.includes(t)).forEach((t) => sections.push({ title: t, rows: secs[t] }));
  const count = sections.reduce((n, s) => n + s.rows.length, 0);
  return { sections, count };
}

export const changes = (n) => `${n} change${n === 1 ? '' : 's'}`;
