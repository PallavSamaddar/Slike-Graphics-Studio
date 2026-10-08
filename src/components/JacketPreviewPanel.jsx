import { useRef } from 'react';
import JacketView from './JacketView.jsx';
import FullscreenButton from './FullscreenButton.jsx';

export default function JacketPreviewPanel({ st, setSt }) {
  const canvasRef = useRef(null);

  return (
    <div className="card studio-canvas-card">
      <div className="broadcast-canvas jacket-canvas" ref={canvasRef}>
        <FullscreenButton targetRef={canvasRef} />
        <JacketView st={st} setSt={setSt} />
      </div>

    </div>
  );
}
