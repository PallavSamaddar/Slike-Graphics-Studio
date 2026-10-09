import { useCallback, useEffect, useState } from 'react';
import { previewGraphics, getGraphicStats, duplicateGraphic, archiveGraphic, GRAPHIC_KIND } from '../api/graphics.js';
import { RowMenu } from '../ui/controls.jsx';
import { useToast } from '../ui/Toast.jsx';
import { TemplateCard } from './TemplateThumbs.jsx';

// "Your graphics" on Home: the most recently edited saved graphics (graphic.preview) as
// chooser cards, and totals per kind (graphic.stats).
const RECENT_COUNT = 6;
const KIND_LABEL = { [GRAPHIC_KIND.TICKER]: 'Ticker', [GRAPHIC_KIND.WIDGET]: 'Widget', [GRAPHIC_KIND.JACKET]: 'Jacket' };
const SOURCE_LABEL = { manual: 'Manual', rss: 'Feed' };
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

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
      const [preview, nextStats] = await Promise.all([previewGraphics({ size: RECENT_COUNT }), getGraphicStats()]);
      setGraphics(preview.list);
      setStats(nextStats);
      setError('');
      setStatus('ready');
    } catch (err) {
      setError(`Couldn't load your graphics: ${err.message}`);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Runs a card action, then refreshes the row so counts and order stay right.
  const runAction = (action, id, receipt) => action(id)
    .then(() => { toast(receipt); return load(); })
    .catch((err) => toast(err.message, 'bad'));
  const open = (id) => onOpen(id).catch((err) => toast(`Couldn't open that graphic: ${err.message}`, 'bad'));

  return (
    <section className="home-sec">
      <div className="home-sec-head">
        <h2 className="type-card-title">Your graphics</h2>
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
        <div className="tpl-grid">
          {graphics.map((g) => (
            <TemplateCard
              key={g.id}
              name={g.title}
              reach={KIND_LABEL[g.kind] || g.kind}
              onOpen={() => open(g.id)}
              menu={(
                <RowMenu
                  label={`More for “${g.title}”`}
                  items={[
                    { label: 'Duplicate', onClick: () => runAction(duplicateGraphic, g.id, 'Duplicated') },
                    { label: 'Archive', onClick: () => runAction(archiveGraphic, g.id, 'Archived') },
                  ]}
                />
              )}
            >
              <div className="saved-thumb">
                {g.source_type && <span className="saved-src">{SOURCE_LABEL[g.source_type] || g.source_type}</span>}
                <span className="saved-line">{g.items?.[0] || 'No headlines yet'}</span>
                <span className="saved-time">{editedAgo(g.mt)}</span>
              </div>
            </TemplateCard>
          ))}
        </div>
      )}
    </section>
  );
}
