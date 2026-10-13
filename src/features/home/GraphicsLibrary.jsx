import { useState } from 'react';
import { ChooserGrid, EmptyState, SegmentedControl, Tabs } from '../../ui-kit';
import { GRAPHIC_KIND, SOURCE_TYPE } from '../../services/graphics.js';
import GraphicCard, { KIND_LABEL } from './GraphicCard.jsx';

const PAGE = 24;
const SOURCES = [{ value: 'all', label: 'All sources' }, { value: SOURCE_TYPE.MANUAL, label: 'Manual' }, { value: SOURCE_TYPE.RSS, label: 'Feed' }];
const STATES = [{ value: 'all', label: 'Any state' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft only' }];
const SORTS = [{ value: 'edited', label: 'Recently edited' }, { value: 'published', label: 'Recently published' }, { value: 'name', label: 'Name' }];
const FILTERS_OFF = { query: '', kind: 'all', source: 'all', state: 'all' };

const matches = (g, q) => !q
  || (g.title || '').toLowerCase().includes(q)
  || g.id === q
  || (g.items || []).some((line) => typeof line === 'string' && line.toLowerCase().includes(q));

const SORT_BY = {
  edited: (a, b) => b.mt - a.mt,
  published: (a, b) => (b.air?.at || 0) - (a.air?.at || 0) || b.mt - a.mt,
  name: (a, b) => (a.title || '').localeCompare(b.title || '') || b.mt - a.mt,
};

// The page numbers to show: the first, the last, and the ones around the current, with … between.
function pageNumbers(page, pages) {
  const want = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const out = [];
  for (let n = 1; n <= pages; n++) {
    if (want.has(n)) out.push(n);
    else if (out[out.length - 1] !== '…') out.push('…');
  }
  return out;
}

// My Graphics: every saved graphic, searched and narrowed (kind, source, state), sorted, a
// page at a time.
//   index: useGraphicsIndex() · onOpen(id)
export default function GraphicsLibrary({ index, onOpen }) {
  const { status, graphics, error, reload, duplicate, archive } = index;
  const [filters, setFilters] = useState(FILTERS_OFF);
  const [sort, setSort] = useState('edited');
  const [page, setPage] = useState(1);
  const set = (patch) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };

  const counts = Object.values(GRAPHIC_KIND).reduce((n, k) => ({ ...n, [k]: graphics.filter((g) => g.kind === k).length }), {});
  const tabs = [
    { id: 'all', label: `All · ${graphics.length}` },
    ...Object.values(GRAPHIC_KIND).map((k) => ({ id: k, label: `${KIND_LABEL[k]}s · ${counts[k]}` })),
  ];

  const q = filters.query.trim().toLowerCase();
  const list = graphics
    .filter((g) => filters.kind === 'all' || g.kind === filters.kind)
    .filter((g) => filters.source === 'all' || g.source_type === filters.source)
    .filter((g) => filters.state === 'all' || (filters.state === 'published' ? g.published : !g.published))
    .filter((g) => matches(g, q))
    .sort(SORT_BY[sort]);
  const narrowed = JSON.stringify(filters) !== JSON.stringify(FILTERS_OFF);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const at = Math.min(page, pages); // an archive on the last page can leave it empty
  const from = (at - 1) * PAGE;
  const goTo = (n) => {
    setPage(n);
    document.querySelector('.lib')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  let body;
  if (status === 'error') {
    body = (
      <EmptyState title="Couldn't load your graphics">
        {error} <button type="button" className="zlink" onClick={reload}>Try again</button>
      </EmptyState>
    );
  } else if (status === 'loading') {
    body = <div className="saved-status" role="status">Loading your graphics…</div>;
  } else if (graphics.length === 0) {
    body = <EmptyState title="Nothing saved yet">Start a ticker, widget or jacket above; it shows up here once saved.</EmptyState>;
  } else if (list.length === 0) {
    body = (
      <EmptyState title="Nothing matches">
        No graphic fits this search and these filters. <button type="button" className="zlink" onClick={() => set(FILTERS_OFF)}>Clear them</button>
      </EmptyState>
    );
  } else {
    body = (
      <>
        <ChooserGrid>
          {list.slice(from, from + PAGE).map((g) => (
            <GraphicCard key={g.id} g={g} onOpen={onOpen} onDuplicate={duplicate} onArchive={archive} />
          ))}
        </ChooserGrid>
        {pages > 1 && (
          <nav className="lib-pages" aria-label="Pages of graphics">
            <span className="saved-sum">{from + 1}–{Math.min(from + PAGE, list.length)} of {list.length}</span>
            <span className="lib-gap" />
            <button type="button" className="btn ghost small" disabled={at === 1} onClick={() => goTo(at - 1)}>‹ Prev</button>
            {pageNumbers(at, pages).map((n, i) => (
              n === '…'
                ? <span key={`gap-${i}`} className="lib-page-gap">…</span>
                : <button key={n} type="button" className={'btn small' + (n === at ? '' : ' ghost')} aria-current={n === at ? 'page' : undefined} onClick={() => goTo(n)}>{n}</button>
            ))}
            <button type="button" className="btn ghost small" disabled={at === pages} onClick={() => goTo(at + 1)}>Next ›</button>
          </nav>
        )}
      </>
    );
  }

  return (
    <section className="home-sec lib" aria-label="My Graphics">
      <div className="home-sec-head">
        <h2 className="type-card-title">My Graphics</h2>
        {status === 'ready' && narrowed && <span className="saved-sum">{list.length} of {graphics.length}</span>}
      </div>
      {status === 'ready' && graphics.length > 0 && (
        <>
          <Tabs tabs={tabs} value={filters.kind} onChange={(kind) => set({ kind })} ariaLabel="Kind of graphic" />
          <div className="lib-bar">
            <input
              className="search"
              type="search"
              value={filters.query}
              placeholder="Search by name, headline or ID"
              aria-label="Search your graphics"
              onChange={(e) => set({ query: e.target.value })}
            />
            <SegmentedControl value={filters.source} options={SOURCES} onChange={(source) => set({ source })} ariaLabel="Content source" />
            <SegmentedControl value={filters.state} options={STATES} onChange={(state) => set({ state })} ariaLabel="Published or draft" />
            <span className="lib-gap" />
            <label className="lib-sort"><span>Sort</span><SegmentedControl value={sort} options={SORTS} onChange={setSort} ariaLabel="Sort by" /></label>
          </div>
        </>
      )}
      {body}
    </section>
  );
}
