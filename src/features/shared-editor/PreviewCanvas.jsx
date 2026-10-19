import { createContext, useContext, useRef } from 'react';
import FullscreenButton from './FullscreenButton.jsx';

// Buttons the page puts in the preview's corner, beside full screen (the studio's Settings).
export const PreviewActions = createContext(null);

// The live preview's card: a stage that can go full screen, holding the graphic as it renders.
//   variant: '' (ticker), 'widget-canvas' or 'jacket-canvas' — the stage's own sizing
export default function PreviewCanvas({ variant = '', children }) {
  const canvasRef = useRef(null);
  const actions = useContext(PreviewActions);
  return (
    <div className="card studio-canvas-card">
      <div className={'broadcast-canvas' + (variant ? ' ' + variant : '')} ref={canvasRef}>
        <div className="canvas-actions">
          {actions}
          <FullscreenButton targetRef={canvasRef} />
        </div>
        {children}
      </div>
    </div>
  );
}
