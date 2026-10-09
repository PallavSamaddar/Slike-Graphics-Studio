import { useState } from 'react';
import { GRAPHICS, KIND_BY_CATEGORY } from '../constants/graphics.js';
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
// led by Start from scratch.   onPick(galleryCategory, templateId)
export default function TemplatesPage({ onPick, initialCategory }) {
  const [category, setCategory] = useState(initialCategory || 'ticker');
  const kind = KIND_BY_CATEGORY[category];
  const Thumb = kind && THUMBS[kind];

  return (
    <>
      <PageHead title={TITLES[category]} />
      <Tabs tabs={CATEGORIES} value={category} onChange={setCategory} ariaLabel="Kind of graphic" />

      {!kind ? (
        <ComingSoonPanel category={category} />
      ) : (
        <ChooserGrid>
          <CreateCard label="Start from scratch" onOpen={() => onPick(category, SCRATCH[category])} />
          {GRAPHICS[kind].templates.map((t) => (
            <ChooserCard key={t.id} name={t.name} onOpen={() => onPick(category, t.id)}>
              <Thumb t={t} />
            </ChooserCard>
          ))}
        </ChooserGrid>
      )}
    </>
  );
}
