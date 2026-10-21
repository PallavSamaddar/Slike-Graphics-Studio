import { useEffect, useRef, useState } from 'react';
import { GRAPHICS } from '../constants/graphics.js';
import { getOnAirGraphic } from '../services/graphics.js';
import { fromGraphic } from '../services/graphicMapper.js';
import usePoll from '../hooks/usePoll.js';
import { onAirChange } from '../services/airSignal.js';
import TickerView from './TickerView.jsx';
import WidgetView from './WidgetView.jsx';
import JacketView from './JacketView.jsx';
import FitToWindow, { NATURAL_WIDTH } from './FitToWindow.jsx';

const ON_AIR_POLL_MS = 15 * 1000;
const PLAYER_WIDTH = NATURAL_WIDTH;
const LIVE_REFRESH_ACTION = 'SLIKE_GRAPHIC';
const TICKER_HEIGHT_MESSAGE = 'SLIKE_TICKER_HEIGHT';
export default function PlayerView({ hash }) {
  const id = new URLSearchParams(hash.split('?')[1] || '').get('id');
  if (!id) {
    return <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', color: '#7A756E' }}>No graphic id in the URL.</div>;
  }
  return <OnAirGraphic id={id} />;
}

function OnAirGraphic({ id }) {
  const [onAir, setOnAir] = useState(null);
  const [nudged, setNudged] = useState(0);
  const fresh = useRef(true);
  const shownV = useRef(0);
  useEffect(() => onAirChange(id, () => { fresh.current = true; setNudged((n) => n + 1); }), [id]);
  useEffect(() => {
    const onMessage = (e) => {
      const msg = e.data;
      if (msg?.action !== LIVE_REFRESH_ACTION || msg.id !== id) return;
      if (Number(msg.v) <= shownV.current) return;
      fresh.current = true;
      setNudged((n) => n + 1);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [id]);

  usePoll((isStopped) => {
    const skipCache = fresh.current;
    fresh.current = false;
    return getOnAirGraphic(id, { fresh: skipCache })
      .then((g) => {
        const spec = GRAPHICS[g.kind];
        if (isStopped() || !spec) return;
        shownV.current = g.v || 0;
        setOnAir({ kind: g.kind, st: fromGraphic(g, spec.initial) });
      })
      .catch((err) => { if (!isStopped()) setOnAir((cur) => (err.code === 404 || !cur ? { gone: true } : cur)); });
  }, ON_AIR_POLL_MS, [id, nudged], { immediate: true });

  if (!onAir || onAir.gone) return null;
  return <GraphicOnPage kind={onAir.kind} st={onAir.st} />;
}

function GraphicOnPage({ kind, st }) {
  const pageRef = useRef(null);
  useEffect(() => {
    const ticker = kind === 'ticker' && window.parent !== window ? pageRef.current?.firstElementChild : null;
    if (!ticker) return undefined;
    const send = () => window.parent.postMessage({ name: TICKER_HEIGHT_MESSAGE, height: ticker.offsetHeight }, '*');
    send();
    const observer = new ResizeObserver(send);
    observer.observe(ticker);
    return () => observer.disconnect();
  }, [kind, st]);

  const view = kind === 'jacket' ? <JacketView st={st} /> : kind === 'widget' ? <WidgetView st={st} /> : <TickerView st={st} />;
  const width = PLAYER_WIDTH[kind];
  return <div ref={pageRef} className={`player-page player-${kind}`}>{width ? <FitToWindow width={width}>{view}</FitToWindow> : view}</div>;
}
