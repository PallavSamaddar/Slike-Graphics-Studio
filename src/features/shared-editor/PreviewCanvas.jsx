import { useRef } from 'react';
import FullscreenButton from './FullscreenButton.jsx';

// The live preview's card: a stage that can go full screen, holding the graphic as it renders.
//   variant: '' (ticker), 'widget-canvas' or 'jacket-canvas' — the stage's own sizing
export default function PreviewCanvas({ variant = '', children }) {
  const canvasRef = useRef(null);
  return (
    <div className="card studio-canvas-card">
      <div className={'broadcast-canvas' + (variant ? ' ' + variant : '')} ref={canvasRef}>
        <FullscreenButton targetRef={canvasRef} />
        {children}
      </div>
    </div>
  );
}
