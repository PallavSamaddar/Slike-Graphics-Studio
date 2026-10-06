import { useRef } from 'react';
import JacketView from './JacketView.jsx';
import JacketStyleControls from './JacketStyleControls.jsx';
import FullscreenButton from './FullscreenButton.jsx';

export default function JacketPreviewPanel({ st, setSt }) {
  const canvasRef = useRef(null);

  return (
    <aside className="panel-right">
      <div className="broadcast-canvas jacket-canvas" ref={canvasRef}>
        <FullscreenButton targetRef={canvasRef} />
        <JacketView st={st} setSt={setSt} />
      </div>

      <div className="panel-right-scroll">
        <JacketStyleControls st={st} setSt={setSt} />
      </div>
    </aside>
  );
}
