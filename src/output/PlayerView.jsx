import { useEffect, useRef, useState } from 'react';
import { GRAPHICS } from '../constants/graphics.js';
import { getOnAirGraphic } from '../services/graphics.js';
import { fromGraphic } from '../services/graphicMapper.js';
import usePoll from '../hooks/usePoll.js';
import { onAirChange } from '../services/airSignal.js';
import TickerView from './TickerView.jsx';
import WidgetView from './WidgetView.jsx';
import JacketView from './JacketView.jsx';
import FitToWindow from './FitToWindow.jsx';

const ON_AIR_POLL_MS = 60 * 1000;
const PLAYER_WIDTH = { widget: 640, jacket: 640 };
export default function PlayerView({ hash }) {
  const id = new URLSearchParams(hash.split('?')[1] || '').get('id');
  if (!id) {
    return <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', color: '#7A756E' }}>No graphic id in the URL.</div>;
  }
  return <OnAirGraphic id={id} />;
}

function OnAirGraphic({ id }) {
  const [onAir, setOnAir] = useState(null); // { kind, st } | { gone: true }
  // Bumped when this browser publishes or takes the graphic off air: read it again at once,
  // past the CDN's copy — that one read only; the polls after it go back to the CDN.
  const [nudged, setNudged] = useState(0);
  const fresh = useRef(false);
  useEffect(() => onAirChange(id, () => { fresh.current = true; setNudged((n) => n + 1); }), [id]);

  usePoll((isStopped) => {
    const skipCache = fresh.current;
    fresh.current = false;
    return getOnAirGraphic(id, { fresh: skipCache })
      .then((g) => {
        const spec = GRAPHICS[g.kind];
        if (!isStopped() && spec) setOnAir({ kind: g.kind, st: fromGraphic(g, spec.initial) });
      })
      // Not on air (404): clear it. Any other failure (network, server) keeps what's showing.
      .catch((err) => { if (!isStopped()) setOnAir((cur) => (err.code === 404 || !cur ? { gone: true } : cur)); });
  }, ON_AIR_POLL_MS, [id, nudged], { immediate: true });

  if (!onAir || onAir.gone) return null;
  return <GraphicOnPage kind={onAir.kind} st={onAir.st} />;
}

function GraphicOnPage({ kind, st }) {
  const view = kind === 'jacket' ? <JacketView st={st} /> : kind === 'widget' ? <WidgetView st={st} /> : <TickerView st={st} />;
  const width = PLAYER_WIDTH[kind];
  return <div className={`player-page player-${kind}`}>{width ? <FitToWindow width={width}>{view}</FitToWindow> : view}</div>;
}
