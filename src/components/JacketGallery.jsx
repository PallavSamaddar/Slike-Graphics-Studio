import { JACKET_TPLS } from '../data/jacketTemplates.js';
import { autoTextColor } from '../utils.js';

// Preset grid for the Jacket (full-bleed live-feed overlay), rendered
// inside TemplateGallery's body slot for the "jackets" category.
export default function JacketGallery({ onPick }) {
  return (
    <div className="gallery-body">
      <div className="gallery-intro">
        <h1>Choose a jacket style</h1>
      </div>

      <div className="gallery-grid">
        <button className="gallery-card gallery-scratch" onClick={() => onPick('crimson-global')}>
          <div className="tpl-scratch-preview tpl-scratch-preview-16x9 gallery-preview-bg">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Start from scratch
          </div>
        </button>

        {JACKET_TPLS.map((t) => (
          <button key={t.id} className="gallery-card" onClick={() => onPick(t.id)}>
            <div className="jacket-mini">
              <div className="jacket-mini-video" />
              <div className="jacket-mini-inset" />
              <div className="jacket-mini-bar">
                <span className="jacket-mini-logo" style={{ background: t.style.logoGradient || t.style.logoColor, color: autoTextColor(t.style.logoColor) }}>TOI</span>
                <span className="jacket-mini-ticker" />
                <span className="jacket-mini-time" style={{ background: t.style.timeColor, color: autoTextColor(t.style.timeColor) }} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
