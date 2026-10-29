import { GRAPHICS, galleryTemplates } from '../../constants/graphics.js';
import { THUMBS } from '../templates/TemplateThumbs.jsx';

const KINDS = [
  { kind: 'ticker', blurb: 'Scrolling headlines bar' },
  { kind: 'widget', blurb: 'News card with title & image' },
  { kind: 'jacket', blurb: 'Full-screen overlay' },
  { kind: 'caption', blurb: 'Lower-third name strap' },
];
export default function StartNew({ onPick }) {
  return (
    <section className="start-panel" aria-label="Start new">
      <div className="start-panel-head">
        <h2 className="type-card-title">Start new</h2>
        <span className="start-panel-sub">Pick a kind, then a template</span>
      </div>
      <ul className="start-list">
        {KINDS.map(({ kind, blurb }) => {
          const { category, name } = GRAPHICS[kind];
          const templates = galleryTemplates(kind);
          const Thumb = THUMBS[kind];
          return (
            <li key={kind}>
              <button type="button" className="start-tile" onClick={() => onPick(category)}>
                <span className="start-tile-pic" aria-hidden="true"><Thumb t={templates[0]} /></span>
                <span className="start-tile-foot">
                  <span className="start-row-text">
                    <span className="start-row-name">{name}</span>
                    <span className="start-row-sub">{blurb}</span>
                  </span>
                  <span className="start-row-count" title={`${templates.length} templates`}>{templates.length}</span>
                  <svg className="start-row-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
