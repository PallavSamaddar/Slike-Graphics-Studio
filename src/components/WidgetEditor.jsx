import ContentSource, { ContentSourceTabs } from './ContentSource.jsx';

// Left-panel form for the Heading + List widget: a Manual/Feed/JSON source
// picker up top (drives both Heading and Description lines), then the
// fields themselves — mirroring the ticker's Content Source model on `st`.
// viewTab/setViewTab are lifted to App so the live preview (a sibling panel)
// can mirror whichever draft tab is open, not just the last-saved source.
export default function WidgetEditor({ st, setSt, viewTab, setViewTab }) {
  const setHeading = (v) => setSt((s) => ({ ...s, heading: v }));

  const headingField = (
    <div className="form-g" style={{ marginBottom: 16 }}>
      <label className="form-lbl">
        Heading <span className="req-mark">*</span>
      </label>
      <input
        type="text"
        className="form-inp"
        placeholder="Enter title here"
        value={st.heading}
        onChange={(e) => setHeading(e.target.value)}
      />
    </div>
  );

  return (
    <div className="sec">
      <div className="sec-hd"><span className="sec-title">Content</span></div>

      <div className="form-g" style={{ marginBottom: 16 }}>
        <ContentSourceTabs st={st} viewTab={viewTab} onViewTabChange={setViewTab} kind="widget" />
      </div>

      {viewTab === 'manual' && (
        <>
          {headingField}
          <div className="form-g widget-desc-items" style={{ marginBottom: 16 }}>
            <label className="form-lbl">
              Description lines <span className="req-mark">*</span>
            </label>
            <ContentSource st={st} setSt={setSt} bare hideTabs kind="widget" viewTab={viewTab} onViewTabChange={setViewTab} />
          </div>
        </>
      )}

      {viewTab !== 'manual' && (
        <>
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
        </>
      )}
    </div>
  );
}
