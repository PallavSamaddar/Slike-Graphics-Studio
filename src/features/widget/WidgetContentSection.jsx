import ContentSource, { ContentSourceTabs } from '../shared-editor/ContentSource.jsx';
import { Field, Row, Section } from '../../ui-kit';

// The Heading + List widget's Content section: the Manual/Feed/JSON source tabs up top
// (they drive both the Heading and the Description lines), then the fields themselves —
// mirroring the ticker's Content source model on `st`.
// viewTab/setViewTab are lifted to App so the live preview (beside the form) can mirror
// whichever draft tab is open, not just the last-saved source.
export default function WidgetContentSection({ st, setSt, viewTab, setViewTab }) {
  const setHeading = (v) => setSt((s) => ({ ...s, heading: v }));

  const headingField = (
    <Row>
      <Field label={<>Heading <span className="req-mark">*</span></>} grow path="heading">
        <input type="text" placeholder="Enter title here" value={st.heading} onChange={(e) => setHeading(e.target.value)} />
      </Field>
    </Row>
  );

  return (
    <Section title="Content">
      <ContentSourceTabs st={st} viewTab={viewTab} onViewTabChange={setViewTab} kind="widget" />

      {viewTab === 'manual' && (
        <>
          {headingField}
          <Row className="widget-desc-items">
            <ContentSource
              st={st}
              setSt={setSt}
              bare
              hideTabs
              kind="widget"
              viewTab={viewTab}
              onViewTabChange={setViewTab}
              itemsLabel={<>Description lines <span className="req-mark">*</span></>}
            />
          </Row>
        </>
      )}

      {viewTab !== 'manual' && (
        <div className="widget-desc-items">
          <ContentSource
            st={st}
            setSt={setSt}
            bare
            hideTabs
            kind="widget"
            viewTab={viewTab}
            onViewTabChange={setViewTab}
            afterUrl={headingField}
          />
        </div>
      )}
    </Section>
  );
}
