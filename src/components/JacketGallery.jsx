import { JACKET_TPLS } from '../data/jacketTemplates.js';
import { JacketThumb, TemplateCard, ScratchCard } from './TemplateThumbs.jsx';

// The Jacket's (full-bleed live-feed overlay) templates, in the Templates room's Jackets tab.
export default function JacketGallery({ onPick }) {
  return (
    <div className="tpl-grid">
      <ScratchCard onOpen={() => onPick('crimson-global')} />
      {JACKET_TPLS.map((t) => (
        <TemplateCard key={t.id} name={t.name} onOpen={() => onPick(t.id)}>
          <JacketThumb t={t} />
        </TemplateCard>
      ))}
    </div>
  );
}
