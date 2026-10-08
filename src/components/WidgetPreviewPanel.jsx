import { useRef } from 'react';
import WidgetView from './WidgetView.jsx';
import FullscreenButton from './FullscreenButton.jsx';

export default function WidgetPreviewPanel({ st, setSt, viewTab }) {
  const canvasRef = useRef(null);

  return (
    <div className="card studio-canvas-card">
      <div className="broadcast-canvas widget-canvas" ref={canvasRef}>
        <FullscreenButton targetRef={canvasRef} />
        <WidgetView st={st} setSt={setSt} viewTab={viewTab} />
      </div>

    </div>
  );
}
