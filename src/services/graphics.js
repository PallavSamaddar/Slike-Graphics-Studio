import { callRpc, getPublic } from './rpc.js';

export const GRAPHIC_KIND = { TICKER: 'ticker', WIDGET: 'widget', JACKET: 'jacket', CAPTION: 'caption' };
export const SOURCE_TYPE = { MANUAL: 'manual', RSS: 'rss' };
export const SOURCE_LABEL = { [SOURCE_TYPE.MANUAL]: 'Manual', [SOURCE_TYPE.RSS]: 'Feed' };

const METHOD = {
  CREATE: 'graphic.create',
  GET: 'graphic.get',
  UPDATE: 'graphic.update',
  ARCHIVE: 'graphic.archive',
  DUPLICATE: 'graphic.duplicate',
  STATS: 'graphic.stats',
  PREVIEW: 'graphic.preview',
  PUBLISH: 'graphic.publish',
  UNPUBLISH: 'graphic.unpublish',
};

const DEFAULT_PAGE_SIZE = 24;
const SEARCH_FIELDS = [{ field: 'title', boost: 3 }, { field: 'source.items' }];
const ID_PATTERN = /^[a-z0-9]{10}$/i;

export const SORT = {
  edited: { sort: { mt: 'desc' } },
  published: { sort: { on_air: 'desc', published_at: 'desc', mt: 'desc' }, sort_priority: ['on_air', 'published_at', 'mt'] },
  name: { sort: { 'title.keyword': 'asc' } },
};

function buildQuery({ kind, sourceType, state, search, sort = 'edited', size = DEFAULT_PAGE_SIZE, from = 0 } = {}) {
  const must = {};
  const mustNot = {};
  if (kind) must.kind = kind;
  if (sourceType) must['source.type'] = sourceType;
  if (state === 'published') must.on_air = 1;
  if (state === 'draft') mustNot.on_air = 1;
  const query = { must, ...SORT[sort] || SORT.edited, size, from };
  if (Object.keys(mustNot).length) query.must_not = mustNot;
  const text = search?.trim();
  if (text && ID_PATTERN.test(text)) must.id = text;
  else if (text) query.search = { query: text, fields: SEARCH_FIELDS };
  return query;
}

export const createGraphic = (graphic) => callRpc(METHOD.CREATE, graphic);

export const getGraphic = (id, opts) => callRpc(METHOD.GET, { id }, opts);
export const publishGraphic = (id, mt, note) => callRpc(METHOD.PUBLISH, { id, mt, note });

export const unpublishGraphic = (id) => callRpc(METHOD.UNPUBLISH, { id });

// `fresh` skips the CDN's cached copy (a read right after a publish).
export const getOnAirGraphic = (id, { fresh = false } = {}) =>
  getPublic(`/graphicembed?id=${encodeURIComponent(id)}${fresh ? `&t=${Date.now()}` : ''}`);

export const updateGraphic = (id, mt, changes) =>
  callRpc(METHOD.UPDATE, { ...changes, id, if_match: { field: 'mt', value: mt } });

export const archiveGraphic = (id) => callRpc(METHOD.ARCHIVE, { id });

export const duplicateGraphic = (id) => callRpc(METHOD.DUPLICATE, { id });

export const getGraphicStats = (opts) => callRpc(METHOD.STATS, {}, opts);

export const previewGraphics = (filters, opts) => callRpc(METHOD.PREVIEW, buildQuery(filters), opts);
