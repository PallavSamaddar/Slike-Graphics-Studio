import { KIND_BY_CATEGORY, galleryTemplates } from '../../constants/graphics.js';
import { ChooserCard, ChooserGrid, CreateCard } from '../../ui-kit';
import { THUMBS } from './TemplateThumbs.jsx';
import ComingSoonPanel from './ComingSoonPanel.jsx';

export const CATEGORIES = [
  { id: 'ticker', label: 'Ticker' },
  { id: 'widgets', label: 'Widgets' },
  { id: 'captions', label: 'Captions' },
  { id: 'jackets', label: 'Jackets' },
];
export const TITLES = { ticker: 'Choose a template', widgets: 'Choose a widget style', jackets: 'Choose a jacket style', captions: 'Choose a caption style' };
// "Start from scratch" opens this template for each kind (as before).
const SCRATCH = { ticker: 'scratch', widgets: 'crimson-dots', jackets: 'crimson-global', captions: 'crimson-bar' };

// One kind's templates as chooser cards, led by Start from scratch — on the Templates page and
// in the home page's template picker alike.
//   category · onPick(category, templateId)
export default function TemplateChoices({ category, onPick }) {
  const kind = KIND_BY_CATEGORY[category];
  const Thumb = kind && THUMBS[kind];
  if (!kind) return <ComingSoonPanel category={category} />;
  return (
    <ChooserGrid>
      <CreateCard label="Start from scratch" onOpen={() => onPick(category, SCRATCH[category])} />
      {galleryTemplates(kind).map((t) => (
        <ChooserCard key={t.id} name={t.name} reach={t.layout?.label} onOpen={() => onPick(category, t.id)}>
          <Thumb t={t} />
        </ChooserCard>
      ))}
    </ChooserGrid>
  );
}
