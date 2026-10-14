import { useState } from 'react';
import { GRAPHICS } from '../constants/graphics.js';
import { getOnAirGraphic } from '../services/graphics.js';
import { fromGraphic } from '../services/graphicMapper.js';
import usePoll from '../hooks/usePoll.js';
import TickerView from './TickerView.jsx';
import WidgetView from './WidgetView.jsx';
import JacketView from './JacketView.jsx';
import FitToWindow, { FIT_INSET, NATURAL_WIDTH } from './FitToWindow.jsx';

const ON_AIR_POLL_MS = 60 * 1000;
export default function PlayerView({ hash }) {
  const id = new URLSearchParams(hash.split('?')[1] || '').get('id');
  if (!id) {
    return <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', color: '#7A756E' }}>No graphic id in the URL.</div>;
  }
  return <OnAirGraphic id={id} />;
}

function OnAirGraphic({ id }) {
  const [onAir, setOnAir] = useState(null); // { kind, st } | { gone: true }
  usePoll((isStopped) => getOnAirGraphic(id)
    .then((g) => {
      const spec = GRAPHICS[g.kind];
      if (!isStopped() && spec) setOnAir({ kind: g.kind, st: fromGraphic(g, spec.initial) });
    })
    .catch(() => { if (!isStopped()) setOnAir((cur) => cur || { gone: true }); }),
  ON_AIR_POLL_MS, [id], { immediate: true });

  if (!onAir || onAir.gone) return null;
  return <GraphicOnPage kind={onAir.kind} st={onAir.st} />;
}

function GraphicOnPage({ kind, st }) {
  const view = kind === 'jacket' ? <JacketView st={st} /> : kind === 'widget' ? <WidgetView st={st} /> : <TickerView st={st} />;
  const width = NATURAL_WIDTH[kind];
  return <div className={`player-page player-${kind}`}>{width ? <FitToWindow width={width} inset={FIT_INSET[kind] || 0}>{view}</FitToWindow> : view}</div>;
}
