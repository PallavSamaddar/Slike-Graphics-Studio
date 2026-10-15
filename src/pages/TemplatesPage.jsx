import { KIND_BY_CATEGORY, galleryTemplates } from '../constants/graphics.js';
import { ChooserCard, ChooserGrid, CreateCard, PageHead, Tabs } from '../ui-kit';
import { THUMBS } from '../features/templates/TemplateThumbs.jsx';
import ComingSoonPanel from '../features/templates/ComingSoonPanel.jsx';

const CATEGORIES = [
  { id: 'ticker', label: 'Ticker' },
  { id: 'widgets', label: 'Widgets' },
  { id: 'captions', label: 'Captions' },
  { id: 'jackets', label: 'Jackets' },
];
const TITLES = { ticker: 'Choose a template', widgets: 'Choose a widget style', jackets: 'Choose a jacket style', captions: 'Captions' };
// "Start from scratch" opens this template for each kind (as before).
const SCRATCH = { ticker: 'scratch', widgets: 'crimson-dots', jackets: 'crimson-global' };

// The Templates room: the kinds of graphic as tabs, each kind's templates as chooser cards,
// led by Start from scratch. The tab is the route's (#/templates/<category>).
//   category · onCategory(category) · onPick(category, templateId)
export default function TemplatesPage({ category = 'ticker', onCategory, onPick }) {
  const kind = KIND_BY_CATEGORY[category];
  const Thumb = kind && THUMBS[kind];

  return (
    <>
      <PageHead title={TITLES[category] || 'Templates'} />
      <Tabs tabs={CATEGORIES} value={category} onChange={onCategory} ariaLabel="Kind of graphic" />

      {!kind ? (
        <ComingSoonPanel category={category} />
      ) : (
        <ChooserGrid>
          <CreateCard label="Start from scratch" onOpen={() => onPick(category, SCRATCH[category])} />
          {galleryTemplates(kind).map((t) => (
            <ChooserCard key={t.id} name={t.name} reach={t.layout?.label} onOpen={() => onPick(category, t.id)}>
              <Thumb t={t} />
            </ChooserCard>
          ))}
        </ChooserGrid>
      )}
    </>
  );
}
