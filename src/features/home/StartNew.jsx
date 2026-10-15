import { GRAPHICS, galleryTemplates } from '../../constants/graphics.js';
import { THUMBS } from '../templates/TemplateThumbs.jsx';

const KINDS = [
  { kind: 'ticker', title: 'Ticker', blurb: 'Scrolling headlines bar' },
  { kind: 'widget', title: 'Widget', blurb: 'News card with title & image' },
  { kind: 'jacket', title: 'Jacket', blurb: 'Full-screen overlay' },
];

// Start new: a slim list, one row per kind of graphic — its picture, name and template count —
// into that kind's templates.
//   onSeeAll(galleryCategory)
export default function StartNew({ onSeeAll }) {
  return (
    <section className="start-panel" aria-label="Start new">
      <div className="start-panel-head">
        <h2 className="type-card-title">Start new</h2>
        <span className="start-panel-sub">Pick a kind, then a template</span>
      </div>
      <ul className="start-list">
        {KINDS.map(({ kind, title, blurb }) => {
          const { category } = GRAPHICS[kind];
          const templates = galleryTemplates(kind);
          const Thumb = THUMBS[kind];
          return (
            <li key={kind}>
              <button type="button" className="start-row" onClick={() => onSeeAll(category)}>
                <span className="start-row-thumb" aria-hidden="true">
                  <span className="start-row-thumb-inner"><Thumb t={templates[0]} /></span>
                </span>
                <span className="start-row-text">
                  <span className="start-row-name">{title}</span>
                  <span className="start-row-sub">{blurb}</span>
                </span>
                <span className="start-row-count" title={`${templates.length} templates`}>{templates.length}</span>
                <svg className="start-row-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </li>
          );
        })}
        <li>
          <div className="start-row off" aria-disabled="true">
            <span className="start-row-thumb start-row-thumb-blank" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2" /><line x1="7" y1="14" x2="13" y2="14" /><line x1="15" y1="14" x2="17" y2="14" /></svg>
            </span>
            <span className="start-row-text">
              <span className="start-row-name">Captions</span>
              <span className="start-row-sub">Live subtitles</span>
            </span>
            <span className="start-row-soon">Soon</span>
          </div>
        </li>
      </ul>
    </section>
  );
}
