import TickerView from '../../output/TickerView.jsx';
import PreviewCanvas from '../shared-editor/PreviewCanvas.jsx';

// The ticker as it goes on air, over a placeholder video frame, live while you edit.
export default function TickerPreview({ st }) {
  return (
    <PreviewCanvas>
      <div className="broadcast-frame-group">
        <div className="broadcast-frame" id="broadcastFrame">
          <div className="broadcast-video">
            <svg className="broadcast-wave" viewBox="0 0 100 60" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.7">
              <path d="M0 30c8-11 16 11 25 0s17-11 25 0 17 11 25 0 17-11 25 0" />
              <path d="M0 38c8-11 16 11 25 0s17-11 25 0 17 11 25 0 17-11 25 0" opacity=".6" />
              <path d="M0 22c8-11 16 11 25 0s17-11 25 0 17 11 25 0 17-11 25 0" opacity=".4" />
            </svg>
          </div>
          <TickerView st={st} scaled />
        </div>
      </div>
    </PreviewCanvas>
  );
}
