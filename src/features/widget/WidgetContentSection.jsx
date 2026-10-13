import ContentSource, { ContentSourceSwitch } from '../shared-editor/ContentSource.jsx';
import { Field, Row, Section } from '../../ui-kit';

// The Heading + List widget's Content section: the Manual | Feed switch at the title's right
// (the side it is on drives both the Heading and the Description lines, and is the source
// the widget is saved with), then the fields themselves — mirroring the ticker's Content
// source model on `st`. Each source keeps its own heading and lines, so switching back and
// forth loses neither.
export default function WidgetContentSection({ st, setSt }) {
  const setHeading = (v) => setSt((s) => ({ ...s, heading: v, headings: { ...s.headings, [s.src]: v } }));

  const headingField = (
    <Row>
      <Field label={<>Heading <span className="req-mark">*</span></>} grow path="heading">
        <input type="text" placeholder="Enter title here" value={st.heading} onChange={(e) => setHeading(e.target.value)} />
      </Field>
    </Row>
  );

  return (
    <Section title="Content" action={<ContentSourceSwitch st={st} setSt={setSt} kind="widget" />}>
      {st.src === 'manual' && (
        <>
          {headingField}
          <Row className="widget-desc-items">
            <ContentSource
              st={st}
              setSt={setSt}
              bare
              kind="widget"
              itemsLabel={<>Description lines <span className="req-mark">*</span></>}
            />
          </Row>
        </>
      )}

      {st.src !== 'manual' && (
        <div className="widget-desc-items">
          <ContentSource st={st} setSt={setSt} bare kind="widget" afterUrl={headingField} />
        </div>
      )}
    </Section>
  );
}
