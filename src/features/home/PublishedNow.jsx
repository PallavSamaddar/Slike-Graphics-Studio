import { useEffect, useState } from 'react';
import { previewGraphics } from '../../services/graphics.js';
import { isAbort } from '../../services/rpc.js';
import { toCard } from './useGraphicsIndex.js';
import { savedThumb } from './savedThumb.js';
import { THUMBS } from '../templates/TemplateThumbs.jsx';
import { ago } from '../../utils/time.js';

const SHOWN = 20;
const KIND_LABEL = { ticker: 'Ticker', widget: 'Widget', jacket: 'Jacket' };

export default function PublishedNow({ refresh, onOpen }) {
  const [state, setState] = useState({ status: 'loading', list: [], count: 0 });

  useEffect(() => {
    const controller = new AbortController();
    previewGraphics({ state: 'published', sort: 'published', size: SHOWN }, { signal: controller.signal })
      .then(({ list = [], count = 0 }) => setState({ status: 'ready', list: list.map(toCard), count }))
      .catch((err) => { if (!isAbort(err)) setState((s) => ({ ...s, status: 'error' })); });
    return () => controller.abort();
  }, [refresh]);

  return (
    <section className="start-panel" aria-label="Published">
      <div className="start-panel-head">
        <h2 className="type-card-title">Published{state.count ? <span className="panel-count">{state.count}</span> : null}</h2>
        <span className="start-panel-sub">Your graphics that are live right now</span>
      </div>
      {state.status === 'loading' && <div className="pub-empty">Loading…</div>}
      {state.status === 'error' && <div className="pub-empty">Couldn’t load published graphics.</div>}
      {state.status === 'ready' && !state.list.length && <div className="pub-empty">Nothing published yet — publish a graphic to see it here.</div>}
      {state.status === 'ready' && state.list.length > 0 && (
        <ul className="start-list pub-list">
          {state.list.map((g) => {
            const Thumb = THUMBS[g.kind];
            const thumb = Thumb && savedThumb(g);
            return (
              <li key={g.id}>
                <button type="button" className="start-row" onClick={() => onOpen(g.id)}>
                  <span className="start-row-thumb start-row-thumb-sm" aria-hidden="true">
                    {thumb && <span className="start-row-thumb-inner"><Thumb t={thumb.t} {...thumb.text} /></span>}
                  </span>
                  <span className="start-row-text">
                    <span className="start-row-name" title={g.title}>{g.title || 'Untitled'}</span>
                    <span className="start-row-sub">
                      {KIND_LABEL[g.kind] || g.kind}{g.air?.v ? ` · v${g.air.v}` : ''}{g.air?.at ? ` · ${ago(g.air.at)}` : ''}
                    </span>
                  </span>
                  <span className="pub-dot" title="Published" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
