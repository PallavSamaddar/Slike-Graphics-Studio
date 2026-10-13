import { useState } from 'react';
import { ChooserGrid, EmptyState, SegmentedControl, Tabs, useToast } from '../../ui-kit';
import { GRAPHIC_KIND, SOURCE_TYPE, duplicateGraphic, archiveGraphic } from '../../services/graphics.js';
import GraphicCard, { KIND_LABEL } from './GraphicCard.jsx';
import { useGraphicsPage, toCard, PAGE } from './useGraphicsIndex.js';

const SOURCES = [{ value: 'all', label: 'All sources' }, { value: SOURCE_TYPE.MANUAL, label: 'Manual' }, { value: SOURCE_TYPE.RSS, label: 'Feed' }];
const STATES = [{ value: 'all', label: 'Any state' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft only' }];
const SORTS = [{ value: 'edited', label: 'Recently edited' }, { value: 'published', label: 'Recently published' }, { value: 'name', label: 'Name' }];
const FILTERS_OFF = { query: '', kind: 'all', source: 'all', state: 'all' };

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

// My Graphics: every saved graphic, searched and narrowed (kind, source, state) and sorted by
// the backend (graphic.preview), a page at a time; the tab counts come from graphic.stats.
//   stats: useGraphicStats() · refresh: moves after a Duplicate/Archive · onChanged() · onOpen(id)
export default function GraphicsLibrary({ stats, refresh, onChanged, onOpen }) {
  const toast = useToast();
  const [filters, setFilters] = useState(FILTERS_OFF);
  const [sort, setSort] = useState('edited');
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const set = (patch) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };
  const changeSort = (next) => { setSort(next); setPage(1); };
  const { status, loading, graphics, count, error, patch } = useGraphicsPage({ ...filters, sort }, page, `${refresh}:${retry}`);

  const act = (action, id, receipt, apply) => action(id)
    .then((result) => { patch((list) => apply(list, result)); toast(receipt); onChanged(); })
    .catch((err) => toast(err.message, 'bad'));
  const duplicate = (id) => act(duplicateGraphic, id, 'Duplicated', (list, copy) => (copy?.id ? [toCard(copy), ...list.filter((g) => g.id !== copy.id)] : list));
  const archive = (id) => act(archiveGraphic, id, 'Archived', (list) => list.filter((g) => g.id !== id));
  const reload = () => setRetry((n) => n + 1);

  const total = stats?.total ?? 0;
  const tabs = [
    { id: 'all', label: stats ? `All · ${total}` : 'All' },
    ...Object.values(GRAPHIC_KIND).map((k) => ({ id: k, label: stats ? `${KIND_LABEL[k]}s · ${stats.kind?.[k] ?? 0}` : `${KIND_LABEL[k]}s` })),
  ];

  const list = graphics;
  const narrowed = JSON.stringify(filters) !== JSON.stringify(FILTERS_OFF);
  const pages = Math.max(1, Math.ceil(count / PAGE));
  const at = Math.min(page, pages);
  const from = (at - 1) * PAGE;
  const goTo = (n) => {
    setPage(n);
    document.querySelector('.lib')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  let body;
  if (loading) {
    body = <SkeletonCards count={Math.min(PAGE, graphics.length || 8)} />;
  } else if (status === 'error') {
    body = (
      <EmptyState title="Couldn't load your graphics">
        {error} <button type="button" className="zlink" onClick={reload}>Try again</button>
      </EmptyState>
    );
  } else if (!narrowed && count === 0) {
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
          {list.map((g) => (
            <GraphicCard key={g.id} g={g} onOpen={onOpen} onDuplicate={duplicate} onArchive={archive} />
          ))}
        </ChooserGrid>
        {pages > 1 && (
          <nav className="lib-pages" aria-label="Pages of graphics">
            <span className="saved-sum">{from + 1}–{Math.min(from + PAGE, count)} of {count}</span>
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
        {status === 'ready' && narrowed && <span className="saved-sum">{count} of {total}</span>}
      </div>
      {(narrowed || total > 0 || count > 0) && (
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
            <label className="lib-sort"><span>Sort</span><SegmentedControl value={sort} options={SORTS} onChange={changeSort} ariaLabel="Sort by" /></label>
          </div>
        </>
      )}
      {body}
    </section>
  );
}

function SkeletonCards({ count }) {
  return (
    <div className="tpl-grid" role="status" aria-label="Loading your graphics">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="dlg-card tpl-choice skel-card" aria-hidden="true">
          <div className="tpl-thumb skel skel-thumb" />
          <div className="dc-top">
            <span className="skel skel-line skel-title" />
            <span className="skel skel-line skel-chip" />
          </div>
        </div>
      ))}
    </div>
  );
}
