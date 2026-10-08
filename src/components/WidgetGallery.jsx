import { WIDGET_TPLS } from '../data/widgetTemplates.js';
import { WidgetThumb, TemplateCard, ScratchCard } from './TemplateThumbs.jsx';

// The Heading + List widget's templates, in the Templates room's Widgets tab.
export default function WidgetGallery({ onPick }) {
  return (
    <div className="tpl-grid">
      <ScratchCard onOpen={() => onPick('crimson-dots')} />
      {WIDGET_TPLS.map((t) => (
        <TemplateCard key={t.id} name={t.name} onOpen={() => onPick(t.id)}>
          <WidgetThumb t={t} />
        </TemplateCard>
      ))}
    </div>
  );
}
