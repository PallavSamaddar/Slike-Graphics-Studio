import { ChooserCard, RowMenu, useToast } from '../../ui-kit';
import { GRAPHIC_KIND, SOURCE_LABEL } from '../../services/graphics.js';
import { playerUrl } from '../../utils/playerUrl.js';
import { ago } from '../../utils/time.js';
import { THUMBS } from '../templates/TemplateThumbs.jsx';
import { savedThumb } from './savedThumb.js';

export const KIND_LABEL = { [GRAPHIC_KIND.TICKER]: 'Ticker', [GRAPHIC_KIND.WIDGET]: 'Widget', [GRAPHIC_KIND.JACKET]: 'Jacket' };

// Copies `text`; the receipt is the toast.
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

// A saved graphic in the library: its picture with where it stands over it, its name, its
// kind, and the ⋯ with Open · Copy ID · Copy player URL · Duplicate · Archive.
//   g: a card from useGraphicsIndex
export default function GraphicCard({ g, onOpen, onDuplicate, onArchive }) {
  const copy = useCopy();
  const url = g.published ? playerUrl(g.air.snap, g.kind, g.id) : null;
  return (
    <ChooserCard
      name={g.title || `Untitled ${g.kind}`}
      reach={KIND_LABEL[g.kind] || g.kind}
      onOpen={() => onOpen(g.id)}
      menu={(
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
      )}
    >
      <Thumb g={g} />
    </ChooserCard>
  );
}

// The card's picture: the graphic drawn small in its own template, or its first line when the
// template is unknown; over it, where it stands (published, its source) and when it was edited.
export function Thumb({ g, compact = false }) {
  const ThumbOf = THUMBS[g.kind];
  const thumb = ThumbOf && savedThumb(g);
  const meta = !compact && (
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
