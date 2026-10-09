import { GRAPHICS } from '../constants/graphics.js';
import { FEATURED } from '../constants/featured.js';
import { ChooserCard, ChooserGrid, PageHead, RowMenu } from '../ui-kit';
import { THUMBS } from '../features/templates/TemplateThumbs.jsx';
import SavedGraphics from '../features/home/SavedGraphics.jsx';

const SECTIONS = [
  { kind: 'ticker', title: 'Ticker' },
  { kind: 'widget', title: 'Widgets' },
  { kind: 'jacket', title: 'Jackets' },
];

function Section({ title, onSeeAll, children }) {
  return (
    <section className="home-sec">
      <div className="home-sec-head">
        <h2 className="type-card-title">{title}</h2>
        {onSeeAll && <button type="button" className="zlink" onClick={onSeeAll}>See all templates →</button>}
      </div>
      <ChooserGrid>{children}</ChooserGrid>
    </section>
  );
}

// Home: your saved graphics, the featured templates of each kind, then what is coming.
//   onPick(kind, templateId) · onSeeAll(galleryCategory) · onOpenGraphic(id) → Promise
export default function HomePage({ onPick, onSeeAll, onOpenGraphic }) {
  return (
    <>
      <PageHead title="What are you creating today?" />
      <SavedGraphics onOpen={onOpenGraphic} />

      {SECTIONS.map(({ kind, title }) => {
        const { templates, category } = GRAPHICS[kind];
        const { items, limit } = FEATURED[kind];
        const Thumb = THUMBS[kind];
        const cards = items.map((f) => ({ f, t: templates.find((tpl) => tpl.id === f.id) })).filter((x) => x.t).slice(0, limit);
        return (
          <Section key={kind} title={title} onSeeAll={() => onSeeAll(category)}>
            {cards.map(({ f, t }) => (
              <ChooserCard
                key={t.id}
                name={t.name}
                reach={f.badge}
                onOpen={() => onPick(kind, t.id)}
                menu={<RowMenu label={`More for “${t.name}”`} items={[{ label: 'Duplicate', onClick: () => onPick(kind, t.id) }]} />}
              >
                <Thumb t={t} />
              </ChooserCard>
            ))}
          </Section>
        );
      })}

      <Section title="More coming soon">
        <ChooserCard name="Captions" reach="Coming soon" disabled />
      </Section>
    </>
  );
}
