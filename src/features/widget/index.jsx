import WidgetContentSection from './WidgetContentSection.jsx';
import WidgetStyleSections from './WidgetStyleSections.jsx';
import WidgetPreview from './WidgetPreview.jsx';

// The widget editor: its form sections and its live preview. `viewTab` (the content source
// tab being edited) is shared, so the preview mirrors the draft tab that is open.
export function WidgetForm({ st, setSt, viewTab, setViewTab }) {
  return (
    <>
      <WidgetContentSection st={st} setSt={setSt} viewTab={viewTab} setViewTab={setViewTab} />
      <WidgetStyleSections st={st} setSt={setSt} />
    </>
  );
}

export { WidgetPreview };
