import { PageHead, Tabs } from '../ui-kit';
import TemplateChoices, { CATEGORIES, TITLES } from '../features/templates/TemplateChoices.jsx';

// The Templates room: the kinds of graphic as tabs, each kind's templates as chooser cards,
// led by Start from scratch. The tab is the route's (#/templates/<category>).
//   category · onCategory(category) · onPick(category, templateId)
export default function TemplatesPage({ category = 'ticker', onCategory, onPick }) {
  return (
    <>
      <PageHead title={TITLES[category] || 'Templates'} />
      <Tabs tabs={CATEGORIES} value={category} onChange={onCategory} ariaLabel="Kind of graphic" />
      <TemplateChoices category={category} onPick={onPick} />
    </>
  );
}
