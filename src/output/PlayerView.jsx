import { decodeState } from '../utils/playerUrl.js';
import useLiveFeed from '../hooks/useLiveFeed.js';
import { fetchGraphicFeed, titledItems } from '../services/feed.js';
import TickerView from './TickerView.jsx';
import WidgetView from './WidgetView.jsx';
import JacketView from './JacketView.jsx';

// Standalone page: renders ONLY the ticker bar (or widget card) at real
// size, on a transparent page background — meant to be opened as its own
// tab/URL (or dropped into OBS as a browser source) with no editor chrome.
export default function PlayerView({ hash }) {
  const query = hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  const data = params.get('data');
  const kind = params.get('kind') || 'ticker';
  const id = params.get('id');

  let st = null;
  let error = null;
  try {
    st = data ? decodeState(data) : null;
  } catch (e) {
    error = 'Could not read graphic data from URL.';
  }

  if (!st) {
    return (
      <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', color: '#7A756E' }}>
        {error || 'No graphic data provided.'}
      </div>
    );
  }

  return (
    <div className="player-page">
      {kind === 'jacket' ? <JacketView st={st} /> : <LiveGraphic kind={kind} st={st} id={id} />}
    </div>
  );
}

function LiveGraphic({ kind, st, id }) {
  const live = useLiveFeed(kind, st, {
    feedKey: id,
    load: () => fetchGraphicFeed(id).then(titledItems),
    immediate: true,
  });
  return kind === 'widget' ? <WidgetView st={live.st} /> : <TickerView st={live.st} />;
}
