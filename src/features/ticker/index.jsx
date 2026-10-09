import TickerContentSection from './TickerContentSection.jsx';
import TickerStyleSections from './TickerStyleSections.jsx';
import TickerPreview from './TickerPreview.jsx';

// The ticker editor: its form sections and its live preview.
export function TickerForm({ st, setSt }) {
  return (
    <>
      <TickerContentSection st={st} setSt={setSt} />
      <TickerStyleSections st={st} setSt={setSt} />
    </>
  );
}

export { TickerPreview };
