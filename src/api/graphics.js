// One function per b2b-cms `graphic.*` RPC method. Field names and values
// here must match app/models/graphic.go in b2b-cms.
import { callRpc } from './rpc.js';

export const GRAPHIC_KIND = { TICKER: 'ticker', WIDGET: 'widget', JACKET: 'jacket' };
export const SOURCE_TYPE = { MANUAL: 'manual', RSS: 'rss' };

const METHOD = {
  CREATE: 'graphic.create',
  GET: 'graphic.get',
  UPDATE: 'graphic.update',
  LIST: 'graphic.list',
  ARCHIVE: 'graphic.archive',
  DELETE: 'graphic.delete',
  DUPLICATE: 'graphic.duplicate',
  STATS: 'graphic.stats',
  PREVIEW: 'graphic.preview',
};

// Library rows only — leaves the heavy `config` out of list responses.
const LIST_FIELDS = ['id', 'title', 'kind', 'template_id', 'source', 'mt', 'ctby'];
// Title matches rank above headline matches. `title.sat` is the
// search-as-you-type sub-field from config/mappings/graphic.json.
const SEARCH_FIELDS = [{ field: 'title.sat', boost: 3 }, { field: 'source.items' }];
const DEFAULT_SORT = { mt: 'desc' }; // most recently edited first
const DEFAULT_PAGE_SIZE = 24;

// Turns simple UI filters into Arise's list query (QuerySchema).
function buildQuery({ kind, sourceType, search, sort = DEFAULT_SORT, size = DEFAULT_PAGE_SIZE, from = 0 } = {}) {
  const must = {};
  if (kind) must.kind = kind;
  if (sourceType) must['source.type'] = sourceType;
  const query = { must, sort, size, from };
  if (search?.trim()) query.search = { query: search.trim(), fields: SEARCH_FIELDS };
  return query;
}

// `graphic` = { title, kind, template_id, source, config } (see graphicMapper.js).
export const createGraphic = (graphic) => callRpc(METHOD.CREATE, graphic);

export const getGraphic = (id) => callRpc(METHOD.GET, { id });

// `mt` is the version the editor loaded. Rejected with code 409 (error.isConflict)
// if someone saved in between. Resolves to the changed fields, including the new mt.
export const updateGraphic = (id, mt, changes) => callRpc(METHOD.UPDATE, { ...changes, id, mt });

// Resolves to { list, count }. filters: { kind, sourceType, search, sort, size, from }.
export const listGraphics = (filters) =>
  callRpc(METHOD.LIST, { ...buildQuery(filters), fields: LIST_FIELDS });

// Archive hides a graphic and can be undone. Delete is permanent (admins only).
export const archiveGraphic = (id) => callRpc(METHOD.ARCHIVE, { id });
export const unarchiveGraphic = (id) => callRpc(METHOD.ARCHIVE, { id, archive: 0 });
export const deleteGraphic = (id) => callRpc(METHOD.DELETE, { id });

// Resolves to the new copy (with its own id).
export const duplicateGraphic = (id) => callRpc(METHOD.DUPLICATE, { id });

// Resolves to { total, archived, kind: { ticker, widget, jacket }, source: { manual, rss } }.
export const getGraphicStats = () => callRpc(METHOD.STATS);

// Render-ready cards, feed and manual alike:
// { list: [{ id, title, kind, template_id, source_type, items, config, mt }], count }.
export const previewGraphics = (filters) => callRpc(METHOD.PREVIEW, buildQuery(filters));
