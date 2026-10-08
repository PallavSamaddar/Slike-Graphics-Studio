import { useState } from 'react';
import { TPLS } from '../data/templates.js';
import ComingSoonPanel from './ComingSoonPanel.jsx';
import WidgetGallery from './WidgetGallery.jsx';
import JacketGallery from './JacketGallery.jsx';
import { TickerThumb, TemplateCard, ScratchCard } from './TemplateThumbs.jsx';

const CATEGORIES = [
  { id: 'ticker', label: 'Ticker' },
  { id: 'widgets', label: 'Widgets' },
  { id: 'captions', label: 'Captions' },
  { id: 'jackets', label: 'Jackets' },
];
const TITLES = { ticker: 'Choose a template', widgets: 'Choose a widget style', jackets: 'Choose a jacket style', captions: 'Captions' };

// The Templates room: its head, the kinds of graphic as tabs, and each kind's templates as
// chooser cards, led by Start from scratch.
export default function TemplateGallery({ onPick, initialCategory }) {
  const [category, setCategory] = useState(initialCategory || 'ticker');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{TITLES[category]}</h1>
        </div>
      </div>

      <div className="scope-tabs" role="tablist" aria-label="Kind of graphic">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            className={'stab' + (category === c.id ? ' on' : '')}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {category === 'widgets' ? (
        <WidgetGallery onPick={(id) => onPick('widgets', id)} />
      ) : category === 'jackets' ? (
        <JacketGallery onPick={(id) => onPick('jackets', id)} />
      ) : category !== 'ticker' ? (
        <ComingSoonPanel category={category} />
      ) : (
        <div className="tpl-grid">
          <ScratchCard onOpen={() => onPick('ticker', 'scratch')} />
          {TPLS.map((t) => (
            <TemplateCard key={t.id} name={t.name} onOpen={() => onPick('ticker', t.id)}>
              <TickerThumb t={t} />
            </TemplateCard>
          ))}
        </div>
      )}
    </>
  );
}
