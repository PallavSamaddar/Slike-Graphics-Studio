import { GRAPHIC_KIND, SOURCE_TYPE, createGraphic, updateGraphic } from './graphics.js';
import { withFeedItems } from './feed.js';
import { getMe } from './user.js';

const SCREEN_ONLY_KEYS = ['activeTab', 'device'];
const SOURCE_KEYS = ['template', 'items', 'src'];
const LEGACY_KEYS = ['air'];
// Must match graphicBlockedURLPrefixes in b2b-cms app/controller/graphic.go.
const INLINE_MEDIA_PREFIXES = ['data:', 'blob:'];

const DEFAULT_TITLE = {
  [GRAPHIC_KIND.TICKER]: 'Untitled ticker',
  [GRAPHIC_KIND.WIDGET]: 'Untitled widget',
  [GRAPHIC_KIND.JACKET]: 'Untitled jacket',
};

const omit = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));

function toSource(kind, st) {
  if (kind === GRAPHIC_KIND.JACKET) {
    return { type: SOURCE_TYPE.MANUAL, items: st.headline ? [st.headline] : [] };
  }
  const clean = (list) => list.filter((item) => item?.trim());
  if (st.src !== SOURCE_TYPE.RSS) return { type: SOURCE_TYPE.MANUAL, items: clean(st.items || []) };
  const items = st.items || [];
  const source = { type: SOURCE_TYPE.RSS, url: st.rssUrl, items: clean(items) };
  // A widget's descriptions go with its titles, so the saved feed never pairs new titles
  // with old descriptions; the server's feed sync keeps both up to date after that.
  if (Array.isArray(st.descriptions?.rss)) {
    source.descriptions = items.map((title, i) => [title, st.descriptions.rss[i] || '']).filter(([title]) => title?.trim()).map(([, d]) => d);
  }
  return source;
}

export function toGraphicPayload(kind, st, title) {
  return {
    title: title?.trim() || DEFAULT_TITLE[kind],
    kind,
    template_id: st.template,
    source: toSource(kind, st),
    config: omit(st, [...SCREEN_ONLY_KEYS, ...SOURCE_KEYS]),
    refresh_schedule: 0,
  };
}

export function fromGraphic(graphic, initialState) {
  const st = { ...initialState, ...omit(graphic.config || {}, LEGACY_KEYS), template: graphic.template_id ?? initialState.template };
  const src = graphic.source;
  if (graphic.kind === GRAPHIC_KIND.JACKET || !src) return st;
  st.src = src.type;
  st.rssUrl = src.url || st.rssUrl || '';
  if (src.type !== SOURCE_TYPE.RSS) {
    st.items = src.items || [];
    return graphic.kind === GRAPHIC_KIND.WIDGET ? withManualItems(st, graphic.config || {}) : st;
  }
  // The feed's descriptions as last synced on the server (they match its titles), else the
  // ones saved with the graphic before the server kept them.
  const descriptions = src.descriptions || st.descriptions?.rss || [];
  const feedSt = graphic.kind === GRAPHIC_KIND.WIDGET ? withManualItems(st, graphic.config || {}) : st;
  return withFeedItems(graphic.kind, feedSt, (src.items || []).map((title, i) => ({ title, description: descriptions[i] || '', media: src.media?.[i] || null })));
}

// A manual widget saved before it had items (one heading over description lines) becomes
// one item per line, each titled with that heading — so it looks as it did.
function withManualItems(st, config) {
  if (Array.isArray(config.descriptions?.manual)) return st;
  const heading = (st.src === 'manual' ? st.heading : st.headings?.manual ?? st.heading) || '';
  const lines = ((st.src === 'manual' ? st.items : st.drafts?.manual) || []).filter((line) => line?.trim());
  const descriptions = lines.length ? lines : [''];
  const titles = descriptions.map(() => heading);
  const next = {
    ...st,
    drafts: { ...st.drafts, manual: titles },
    descriptions: { ...st.descriptions, manual: descriptions },
    media: { ...st.media, manual: titles.map(() => null) },
  };
  if (st.src === 'manual') next.items = titles;
  return next;
}

// True if the editor still holds an uploaded image/video as a data:/blob: URL.
// The backend rejects these, so check before saving and ask for an upload.
export function hasInlineMedia(value) {
  if (typeof value === 'string') return INLINE_MEDIA_PREFIXES.some((prefix) => value.startsWith(prefix));
  if (value && typeof value === 'object') return Object.values(value).some(hasInlineMedia);
  return false;
}

export async function saveGraphic({ id, mt, kind, title, st }) {
  const payload = toGraphicPayload(kind, st, title);
  if (!id) {
    const me = await getMe();
    const created = await createGraphic({ ...payload, business: me.default_business, team: me.default_team });
    return { id: created.id, mt: created.mt };
  }
  const updated = await updateGraphic(id, mt, payload);
  return { id, mt: updated.mt };
}
