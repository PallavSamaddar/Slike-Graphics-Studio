import ContentSource, { ContentSourceSwitch } from '../shared-editor/ContentSource.jsx';
import { Field, Row, Section } from '../../ui-kit';
import WidgetManualItems from './WidgetManualItems.jsx';
import ContentTitle from '../shared-editor/ContentTitle.jsx';

export default function WidgetContentSection({ st, setSt }) {
  const staticOn = !!st.staticTitle && st.showFeedDescription === false;
  const staticTitleField = (
    <Row>
      <Field label="Static heading" grow path="staticText" off={!staticOn} offReason="Untick Descriptions and tick Static heading (above the preview) to show it">
        <input
          type="text"
          placeholder="BREAKING NEWS"
          value={st.staticText ?? st.category ?? ''}
          disabled={!staticOn}
          onChange={(e) => setSt((s) => ({ ...s, staticText: e.target.value }))}
        />
      </Field>
    </Row>
  );

  return (
    <Section title={<ContentTitle />} action={<ContentSourceSwitch st={st} setSt={setSt} />}>
      {st.src === 'manual' && (
        <>
          {staticTitleField}
          <WidgetManualItems st={st} setSt={setSt} />
        </>
      )}

      {st.src !== 'manual' && (
        <div className="widget-desc-items">
          <ContentSource st={st} setSt={setSt} bare kind="widget" afterUrl={staticTitleField} />
        </div>
      )}
    </Section>
  );
}
