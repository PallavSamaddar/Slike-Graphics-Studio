import { useLayoutEffect, useRef, useState } from 'react';
import { GRAPHICS } from '../constants/graphics.js';
import { getOnAirGraphic } from '../services/graphics.js';
import { fromGraphic } from '../services/graphicMapper.js';
import usePoll from '../hooks/usePoll.js';
import TickerView from './TickerView.jsx';
import WidgetView from './WidgetView.jsx';
import JacketView from './JacketView.jsx';

const ON_AIR_POLL_MS = 60 * 1000;
const NATURAL_WIDTH = { widget: 420, jacket: 640 };
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
  return <div className="player-page">{width ? <FitToWindow width={width}>{view}</FitToWindow> : view}</div>;
}

function FitToWindow({ width, children }) {
  const innerRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useLayoutEffect(() => {
    const inner = innerRef.current;
    const measure = () => {
      const height = inner.offsetHeight;
      if (!height) return;
      setFit({ scale: Math.min(window.innerWidth / width, window.innerHeight / height), height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width]);

  return (
    <div className="player-fit" style={{ width: width * fit.scale, height: fit.height * fit.scale }}>
      <div ref={innerRef} className="player-fit-inner" style={{ width, transform: `scale(${fit.scale})` }}>
        {children}
      </div>
    </div>
  );
}
