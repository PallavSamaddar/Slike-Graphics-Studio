import { TPLS } from '../data/templates.js';
import { WIDGET_TPLS } from '../data/widgetTemplates.js';
import { JACKET_TPLS } from '../data/jacketTemplates.js';
import { RowMenu } from '../ui/controls.jsx';
import { TickerThumb, WidgetThumb, JacketThumb, TemplateCard } from './TemplateThumbs.jsx';

// Which templates to feature on the home dashboard, and what usage badge
// (if any) to show on each — static for now, no real usage tracking yet.
const FEATURED_TICKERS = [
  { id: 'classic', badge: 'Most used' },
  { id: 'gradient', badge: 'Recently used' },
  { id: 'breaking', badge: null },
];
const FEATURED_WIDGETS = [
  { id: 'crimson-dots', badge: 'Recently used' },
  { id: 'midnight-solid', badge: null },
  { id: 'paper-light', badge: null },
  { id: 'crimson-image-left', badge: null },
  { id: 'midnight-image-right', badge: null },
  { id: 'emerald-globe', badge: null },
];
const FEATURED_JACKETS = [
  { id: 'crimson-global', badge: null },
  { id: 'midnight-global', badge: null },
  { id: 'charcoal-global', badge: null },
  { id: 'emerald-global', badge: null },
];

const featured = (list, all, n) => list.map((f) => ({ f, t: all.find((tpl) => tpl.id === f.id) })).filter((x) => x.t).slice(0, n);

function Section({ title, onSeeAll, children }) {
  return (
    <section className="home-sec">
      <div className="home-sec-head">
        <h2 className="type-card-title">{title}</h2>
        {onSeeAll && <button type="button" className="zlink" onClick={onSeeAll}>See all templates →</button>}
      </div>
      <div className="tpl-grid">{children}</div>
    </section>
  );
}

// Home: the room's head, then the featured templates of each kind as chooser cards.
export default function HomeDashboard({ onPickTicker, onPickWidget, onPickJacket, onSeeAllTicker, onSeeAllWidgets, onSeeAllJackets }) {
  const card = (Thumb, onPick) => ({ f, t }) => (
    <TemplateCard key={t.id} name={t.name} reach={f.badge} onOpen={() => onPick(t.id)} menu={<RowMenu label={`More for “${t.name}”`} items={[{ label: 'Duplicate', onClick: () => onPick(t.id) }]} />}>
      <Thumb t={t} />
    </TemplateCard>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>What are you creating today?</h1>
        </div>
      </div>

      <Section title="Ticker" onSeeAll={onSeeAllTicker}>
        {featured(FEATURED_TICKERS, TPLS, 3).map(card(TickerThumb, onPickTicker))}
      </Section>

      <Section title="Widgets" onSeeAll={onSeeAllWidgets}>
        {featured(FEATURED_WIDGETS, WIDGET_TPLS, 6).map(card(WidgetThumb, onPickWidget))}
      </Section>

      <Section title="Jackets" onSeeAll={onSeeAllJackets}>
        {featured(FEATURED_JACKETS, JACKET_TPLS, 4).map(card(JacketThumb, onPickJacket))}
      </Section>

      <Section title="More coming soon">
        <div className="dlg-card tpl-choice sc-read" aria-disabled="true">
          <div className="tpl-thumb tpl-thumb-blank" />
          <div className="dc-top"><span className="dc-title">Captions</span><span className="dc-reach">Coming soon</span></div>
        </div>
      </Section>
    </>
  );
}
