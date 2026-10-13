import { useCallback, useEffect, useState } from 'react';
import { previewAllGraphics, getGraphicStats, duplicateGraphic, archiveGraphic, GRAPHIC_KIND, SOURCE_LABEL } from '../../services/graphics.js';
import { ChooserCard, ChooserGrid, RowMenu, useToast } from '../../ui-kit';
import { THUMBS } from '../templates/TemplateThumbs.jsx';
import { savedThumb } from './savedThumb.js';

const KIND_LABEL = { [GRAPHIC_KIND.TICKER]: 'Ticker', [GRAPHIC_KIND.WIDGET]: 'Widget', [GRAPHIC_KIND.JACKET]: 'Jacket' };
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const INDEX_REFRESH_MS = 1500;

const toCard = (g) => ({
  ...g,
  source_type: g.source_type ?? g.source?.type,
  items: g.items ?? g.source?.items ?? [],
  mt: g.mt ?? Date.now(),
});

const editedAgo = (mt) => {
  const diff = Date.now() - mt;
  if (diff < MINUTE) return 'Edited just now';
  if (diff < HOUR) return `Edited ${Math.floor(diff / MINUTE)} min ago`;
  if (diff < DAY) return `Edited ${Math.floor(diff / HOUR)} h ago`;
  return `Edited ${new Date(mt).toLocaleDateString()}`;
};

const statsSummary = (stats) => [
  `${stats.total} saved`,
  ...Object.values(GRAPHIC_KIND).map((kind) => `${stats.kind?.[kind] ?? 0} ${KIND_LABEL[kind].toLowerCase()}s`),
].join(' · ');

export default function SavedGraphics({ onOpen }) {
  const toast = useToast();
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [graphics, setGraphics] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, nextStats] = await Promise.all([previewAllGraphics(), getGraphicStats()]);
      setGraphics(list);
      setStats(nextStats);
      setError('');
      setStatus('ready');
    } catch (err) {
      setError(`Couldn't load your graphics: ${err.message}`);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Runs a card action and shows its result in the row at once — the copy first, the archived
  // card gone — since graphic.preview can miss a write for a moment (the search index
  // refreshes about once a second); then asks again after that, so counts and order catch up.
  const runAction = (action, id, receipt, apply) => action(id)
    .then((result) => {
      setGraphics((list) => apply(list, result));
      toast(receipt);
      setTimeout(load, INDEX_REFRESH_MS);
    })
    .catch((err) => toast(err.message, 'bad'));
  const duplicate = (id) => runAction(duplicateGraphic, id, 'Duplicated', (list, copy) => (
    copy?.id ? [toCard(copy), ...list.filter((g) => g.id !== copy.id)] : list
  ));
  const archive = (id) => runAction(archiveGraphic, id, 'Archived', (list) => list.filter((g) => g.id !== id));
  const open = (id) => onOpen(id).catch((err) => toast(`Couldn't open that graphic: ${err.message}`, 'bad'));

  return (
    <section className="home-sec">
      <div className="home-sec-head">
        <h2 className="type-card-title">My graphics</h2>
        {stats && <span className="saved-sum">{statsSummary(stats)}</span>}
      </div>

      {status === 'error' && (
        <div className="saved-status bad" role="alert">
          {error}
          <button type="button" className="zlink" onClick={load}>Retry</button>
        </div>
      )}
      {status === 'loading' && <div className="saved-status">Loading your graphics…</div>}
      {status === 'ready' && graphics.length === 0 && (
        <div className="saved-status">Nothing saved yet. Pick a template below, then save it.</div>
      )}

      {graphics.length > 0 && (
        <ChooserGrid>
          {graphics.map((g) => (
            <ChooserCard
              key={g.id}
              name={g.title}
              reach={KIND_LABEL[g.kind] || g.kind}
              onOpen={() => open(g.id)}
              menu={(
                <RowMenu
                  label={`More for “${g.title}”`}
                  items={[
                    { label: 'Duplicate', onClick: () => duplicate(g.id) },
                    { label: 'Archive', onClick: () => archive(g.id) },
                  ]}
                />
              )}
            >
              <SavedThumb g={g} />
            </ChooserCard>
          ))}
        </ChooserGrid>
      )}
    </section>
  );
}

function SavedThumb({ g }) {
  const Thumb = THUMBS[g.kind];
  const thumb = Thumb && savedThumb(g);
  const source = g.source_type && <span className="saved-src">{SOURCE_LABEL[g.source_type] || g.source_type}</span>;
  const time = <span className="saved-time">{editedAgo(g.mt)}</span>;
  if (!thumb) {
    return (
      <div className="saved-thumb">
        {source}
        <span className="saved-line">{g.items?.[0] || 'No headlines yet'}</span>
        {time}
      </div>
    );
  }
  return (
    <div className="saved-thumb-pic">
      <Thumb t={thumb.t} {...thumb.text} />
      <div className="saved-meta">{source}{time}</div>
    </div>
  );
}
