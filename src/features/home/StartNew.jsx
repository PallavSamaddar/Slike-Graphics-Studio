import { GRAPHICS } from '../../constants/graphics.js';
import { ChooserCard } from '../../ui-kit';
import { THUMBS } from '../templates/TemplateThumbs.jsx';

const KINDS = [
  { kind: 'ticker', title: 'Ticker' },
  { kind: 'widget', title: 'Widget' },
  { kind: 'jacket', title: 'Jacket' },
];

// Start new: one compact card per kind of graphic, into that kind's templates.
//   onSeeAll(galleryCategory)
export default function StartNew({ onSeeAll }) {
  return (
    <section className="home-sec" aria-label="Start new">
      <div className="home-sec-head">
        <h2 className="type-card-title">Start new</h2>
        <span className="saved-sum">pick a kind, then a template</span>
      </div>
      <div className="start-grid">
        {KINDS.map(({ kind, title }) => {
          const { templates, category } = GRAPHICS[kind];
          const Thumb = THUMBS[kind];
          return (
            <ChooserCard key={kind} name={title} reach={`${templates.length} templates`} onOpen={() => onSeeAll(category)}>
              <Thumb t={templates[0]} />
            </ChooserCard>
          );
        })}
        <ChooserCard name="Captions" reach="Coming soon" disabled />
      </div>
    </section>
  );
}
