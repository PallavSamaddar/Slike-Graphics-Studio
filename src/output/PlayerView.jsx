import { useEffect, useState } from 'react';
import { decodeState } from '../utils/playerUrl.js';
import { GRAPHICS } from '../constants/graphics.js';
import { getGraphic } from '../services/graphics.js';
import { airState } from '../services/graphicMapper.js';
import useLiveFeed from '../hooks/useLiveFeed.js';
import { fetchGraphicFeed, titledItems } from '../services/feed.js';
import TickerView from './TickerView.jsx';
import WidgetView from './WidgetView.jsx';
import JacketView from './JacketView.jsx';

const FOLLOW_EVERY_MS = 10 * 1000;

// Standalone page: renders ONLY the ticker bar (or widget card, or jacket) at real size, on a
// transparent page background — meant to be opened as its own tab/URL (or dropped into OBS as a
// browser source) with no editor chrome.
//   #/player?id=<graphic>          what is on air for that graphic, followed as it is pushed
//   #/player?kind=…&data=<state>   a fixed state packed into the URL (an unsaved graphic)
export default function PlayerView({ hash }) {
  const query = hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  const id = params.get('id');
  const data = params.get('data');
  const kindParam = params.get('kind') || 'ticker';

  let fixed = null;
  let dataError = null;
  try {
    fixed = data ? decodeState(data) : null;
  } catch (e) {
    dataError = 'Could not read graphic data from URL.';
  }

  const onAir = useOnAir(id);

  // What is on air wins; the URL's own state is the fallback when the backend can't be read.
  let kind = kindParam;
  let st = null;
  let note = null;
  if (id && onAir.status === 'ready') { kind = onAir.kind; st = onAir.st; }
  else if (fixed) st = fixed;
  else if (id && onAir.status === 'loading') note = 'Loading…';
  else if (id && onAir.status === 'off') note = 'Nothing is on air for this graphic yet.';
  else if (id && onAir.status === 'error') note = `Could not read the graphic: ${onAir.message}`;
  else note = dataError || 'No graphic data provided.';

  if (!st) {
    return (
      <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', color: '#7A756E' }}>
        {note}
      </div>
    );
  }

  return (
    <div className="player-page">
      {kind === 'jacket' ? <JacketView st={st} /> : <LiveGraphic kind={kind} st={st} id={id} />}
    </div>
  );
}

// Reads the graphic by id and keeps reading, so a push from the studio reaches the screen
// within seconds. A read that fails keeps the last good state.
//   → { status: 'loading' } | { status: 'ready', kind, st, v } | { status: 'off', kind } | { status: 'error', message }
function useOnAir(id) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    if (!id) return undefined;
    let stopped = false;
    let lastMt = null;
    const read = () => getGraphic(id)
      .then((g) => {
        if (stopped || !g || g.mt === lastMt) return;
        lastMt = g.mt;
        const spec = GRAPHICS[g.kind];
        const st = spec && airState(g, spec.initial);
        setState(st ? { status: 'ready', kind: g.kind, st, v: g.config?.air?.v } : { status: 'off', kind: g.kind });
      })
      .catch((err) => {
        if (!stopped) setState((s) => (s.status === 'ready' ? s : { status: 'error', message: err.message }));
      });
    read();
    const timer = setInterval(read, FOLLOW_EVERY_MS);
    return () => { stopped = true; clearInterval(timer); };
  }, [id]);

  return state;
}

function LiveGraphic({ kind, st, id }) {
  const live = useLiveFeed(kind, st, {
    feedKey: id,
    load: () => fetchGraphicFeed(id).then(titledItems),
    immediate: true,
  });
  return kind === 'widget' ? <WidgetView st={live.st} /> : <TickerView st={live.st} />;
}
