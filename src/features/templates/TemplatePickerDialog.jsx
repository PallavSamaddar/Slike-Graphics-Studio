import { useState } from 'react';
import { Dialog, Tabs } from '../../ui-kit';
import TemplateChoices, { CATEGORIES, TITLES } from './TemplateChoices.jsx';

// The template chooser as a popup over the page it was opened from: the kinds as tabs, the
// picked kind's templates under them. Picking one starts a new graphic from it.
//   category: the kind it opens on · onPick(category, templateId) · onClose()
export default function TemplatePickerDialog({ category: initial, onPick, onClose }) {
  const [category, setCategory] = useState(initial);
  return (
    <Dialog
      title={TITLES[category] || 'Templates'}
      size="picker"
      onCancel={onClose}
      foot={<button type="button" className="btn ghost" onClick={onClose}>Cancel</button>}
    >
      <Tabs tabs={CATEGORIES} value={category} onChange={setCategory} ariaLabel="Kind of graphic" />
      <TemplateChoices category={category} onPick={onPick} />
    </Dialog>
  );
}
