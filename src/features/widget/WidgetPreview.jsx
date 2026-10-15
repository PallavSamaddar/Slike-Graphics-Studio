import { useEffect, useState } from 'react';
import WidgetView from '../../output/WidgetView.jsx';
import FitToWindow, { FIT_INSET, NATURAL_WIDTH } from '../../output/FitToWindow.jsx';
import PreviewCanvas from '../shared-editor/PreviewCanvas.jsx';
import WidgetShowBar from './WidgetShowBar.jsx';

function useFullscreen() {
  const [on, setOn] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  return on;
}

export default function WidgetPreview({ st, setSt }) {
  const fullscreen = useFullscreen();
  const view = <WidgetView st={st} preview />;
  return (
    <>
      <WidgetShowBar st={st} setSt={setSt} />
      <PreviewCanvas variant="widget-canvas">
        <FitToWindow width={NATURAL_WIDTH.widget} {...(fullscreen ? { inset: FIT_INSET.widget } : { inParent: true, maxScale: 1.6 })}>
          {view}
        </FitToWindow>
      </PreviewCanvas>
    </>
  );
}
