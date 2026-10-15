import ContentSource, { ContentSourceSwitch } from '../shared-editor/ContentSource.jsx';
import { Field, Row, Section } from '../../ui-kit';
import WidgetManualItems from './WidgetManualItems.jsx';
import ContentTitle from '../shared-editor/ContentTitle.jsx';

export default function WidgetContentSection({ st, setSt }) {
  const feedHeadingField = (
    <Row>
      <Field label="Heading" grow path="category">
        <input type="text" placeholder="e.g. News (optional)" value={st.category || ''} onChange={(e) => setSt((s) => ({ ...s, category: e.target.value }))} />
      </Field>
    </Row>
  );

  return (
    <Section title={<ContentTitle />} action={<ContentSourceSwitch st={st} setSt={setSt} />}>
      {st.src === 'manual' && <WidgetManualItems st={st} setSt={setSt} />}

      {st.src !== 'manual' && (
        <div className="widget-desc-items">
          <ContentSource st={st} setSt={setSt} bare kind="widget" afterUrl={feedHeadingField} />
        </div>
      )}
    </Section>
  );
}
