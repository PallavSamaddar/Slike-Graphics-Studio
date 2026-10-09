// Converts between the editor's in-memory state (st / wst / jst in App.jsx)
// and the graphic document the backend stores:
//   { title, kind, template_id, source: { type, url, items }, config }
import { GRAPHIC_KIND, SOURCE_TYPE, createGraphic, updateGraphic } from './graphics.js';

// Screen state that is never saved.
const SCREEN_ONLY_KEYS = ['activeTab', 'device'];
// Saved as `template_id` / `source` rather than inside `config`.
const SOURCE_KEYS = ['template', 'items', 'src', 'rssUrl'];
// Must match graphicBlockedURLPrefixes in b2b-cms app/controller/graphic.go.
const INLINE_MEDIA_PREFIXES = ['data:', 'blob:'];

const DEFAULT_TITLE = {
  [GRAPHIC_KIND.TICKER]: 'Untitled ticker',
  [GRAPHIC_KIND.WIDGET]: 'Untitled widget',
  [GRAPHIC_KIND.JACKET]: 'Untitled jacket',
};

const omit = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));

function toSource(kind, st) {
  // A jacket has a single scrolling headline and no content-source tabs.
  if (kind === GRAPHIC_KIND.JACKET) {
    return { type: SOURCE_TYPE.MANUAL, items: st.headline ? [st.headline] : [] };
  }
  const items = (st.items || []).filter((item) => item.trim());
  if (st.src === SOURCE_TYPE.RSS) return { type: SOURCE_TYPE.RSS, url: st.rssUrl, items };
  // The backend has no JSON source type, so a loaded JSON list is saved as
  // a manual snapshot of its headlines.
  return { type: SOURCE_TYPE.MANUAL, items };
}

export function toGraphicPayload(kind, st, title) {
  return {
    title: title?.trim() || DEFAULT_TITLE[kind],
    kind,
    template_id: st.template,
    source: toSource(kind, st),
    config: omit(st, [...SCREEN_ONLY_KEYS, ...SOURCE_KEYS]),
  };
}

// `initialState` fills in screen state and any fields added to the editor
// after this graphic was saved.
export function fromGraphic(graphic, initialState) {
  const st = { ...initialState, ...graphic.config, template: graphic.template_id ?? initialState.template };
  if (graphic.kind !== GRAPHIC_KIND.JACKET && graphic.source) {
    st.src = graphic.source.type;
    st.rssUrl = graphic.source.url || '';
    st.items = graphic.source.items || [];
  }
  return st;
}

// True if the editor still holds an uploaded image/video as a data:/blob: URL.
// The backend rejects these, so check before saving and ask for an upload.
export function hasInlineMedia(value) {
  if (typeof value === 'string') return INLINE_MEDIA_PREFIXES.some((prefix) => value.startsWith(prefix));
  if (value && typeof value === 'object') return Object.values(value).some(hasInlineMedia);
  return false;
}

// Creates the graphic on first save and updates it after that. Resolves to
// { id, mt }; keep both and pass them to the next save.
export async function saveGraphic({ id, mt, kind, title, st }) {
  const payload = toGraphicPayload(kind, st, title);
  if (!id) {
    const created = await createGraphic(payload);
    return { id: created.id, mt: created.mt };
  }
  const updated = await updateGraphic(id, mt, payload);
  return { id, mt: updated.mt };
}
