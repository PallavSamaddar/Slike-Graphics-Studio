import { ChooserCard, RowMenu, useToast } from '../../ui-kit';
import { GRAPHIC_KIND, SOURCE_LABEL } from '../../services/graphics.js';
import { embedUrl } from '../../utils/playerUrl.js';
import { ago } from '../../utils/time.js';
import { THUMBS } from '../templates/TemplateThumbs.jsx';
import { savedThumb } from './savedThumb.js';

export const KIND_LABEL = { [GRAPHIC_KIND.TICKER]: 'Ticker', [GRAPHIC_KIND.WIDGET]: 'Widget', [GRAPHIC_KIND.JACKET]: 'Jacket' };

export const useCopy = () => {
  const toast = useToast();
  return async (text, receipt) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(receipt);
    } catch {
      toast('The browser would not let us copy — select it and copy it yourself', 'bad');
    }
  };
};

function GraphicMenu({ g, onOpen, onDuplicate, onArchive }) {
  const copy = useCopy();
  const url = g.published ? embedUrl(g.id) : null;
  return (
    <RowMenu
      label={`More for “${g.title}”`}
      items={[
        { label: 'Open', onClick: () => onOpen(g.id) },
        { label: 'Copy ID', fact: g.id, onClick: () => copy(g.id, 'ID copied') },
        { label: 'Copy player URL', dim: !g.published, title: g.published ? undefined : 'Not published yet', onClick: () => copy(url, 'URL copied') },
        { label: 'Duplicate', onClick: () => onDuplicate(g.id) },
        { label: 'Archive', danger: true, onClick: () => onArchive(g.id) },
      ]}
    />
  );
}

export default function GraphicCard({ g, onOpen, onDuplicate, onArchive }) {
  return (
    <ChooserCard
      name={g.title || `Untitled ${g.kind}`}
      reach={KIND_LABEL[g.kind] || g.kind}
      onOpen={() => onOpen(g.id)}
      menu={<GraphicMenu g={g} onOpen={onOpen} onDuplicate={onDuplicate} onArchive={onArchive} />}
    >
      <Thumb g={g} />
    </ChooserCard>
  );
}

export function Thumb({ g }) {
  const ThumbOf = THUMBS[g.kind];
  const thumb = ThumbOf && savedThumb(g);
  const meta = (
    <div className="saved-meta">
      {g.live && <span className="saved-onair" title={`On air on ${g.live.name || g.live.id} · seen ${ago(g.live.at)}`}>● On air</span>}
      {g.published && <span className="saved-pub" title={g.air.by ? `v${g.air.v} · ${g.air.by} · ${ago(g.air.at)}` : `v${g.air.v}`}>Published v{g.air.v}</span>}
      {g.source_type && <span className="saved-src">{SOURCE_LABEL[g.source_type] || g.source_type}</span>}
      <span className="saved-time" title={`Edited ${ago(g.mt)}`}>{ago(g.mt)}</span>
    </div>
  );
  if (!thumb) {
    return (
      <div className="saved-thumb">
        <span className="saved-line">{g.items?.[0] || 'No headlines yet'}</span>
        {meta}
      </div>
    );
  }
  return (
    <div className="saved-thumb-pic">
      <ThumbOf t={thumb.t} {...thumb.text} />
      {meta}
    </div>
  );
}
export function GraphicRow({ g, onOpen, onDuplicate, onArchive }) {
  const ThumbOf = THUMBS[g.kind];
  const thumb = ThumbOf && savedThumb(g);
  const name = g.title || `Untitled ${g.kind}`;
  const line = (g.items || []).find((x) => typeof x === 'string' && x.trim());
  const open = () => onOpen(g.id);
  return (
    <div
      className="glist-row"
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); } }}
    >
      <span className="glist-thumb" aria-hidden="true">
        {thumb && <span className="glist-thumb-inner"><ThumbOf t={thumb.t} {...thumb.text} /></span>}
      </span>
      <span className="glist-name">
        <span className="glist-title" title={name}>{name}</span>
        {line && <span className="glist-line" title={line}>{line}</span>}
      </span>
      <span className="glist-kind">{KIND_LABEL[g.kind] || g.kind}</span>
      <span className="glist-status">
        {g.live ? (
          <span className="gpill onair" title={`On air on ${g.live.name || g.live.id} · seen ${ago(g.live.at)}`}>On air</span>
        ) : g.published ? (
          <span className="gpill pub" title={g.air.by ? `v${g.air.v} · ${g.air.by} · ${ago(g.air.at)}` : `v${g.air.v}`}>Published v{g.air.v}</span>
        ) : (
          <span className="gpill draft">Draft</span>
        )}
      </span>
      <span className="glist-src">{SOURCE_LABEL[g.source_type] || g.source_type || '—'}</span>
      <span className="glist-time" title={`Edited ${ago(g.mt)}`}>{ago(g.mt)}</span>
      <span className="glist-menu"><GraphicMenu g={g} onOpen={onOpen} onDuplicate={onDuplicate} onArchive={onArchive} /></span>
    </div>
  );
}

