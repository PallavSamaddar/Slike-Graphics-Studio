import { useEffect } from 'react';
import ContentSource, { ContentSourceSwitch } from '../shared-editor/ContentSource.jsx';
import { loadFeed, withFeedItems } from '../../services/feed.js';
import { Field, Row, Section } from '../../ui-kit';
import WidgetManualItems from './WidgetManualItems.jsx';
import ContentTitle from '../shared-editor/ContentTitle.jsx';

export default function WidgetContentSection({ st, setSt }) {
  useEffect(() => {
    const url = (st.rssUrl || '').trim();
    if (!url || !st.drafts?.rss?.length || (st.descriptions?.rss || []).some(Boolean)) return undefined;
    let stopped = false;
    loadFeed(url)
      .then((items) => { if (!stopped) setSt((s) => withFeedItems('widget', s, items)); })
      .catch(() => {});
    return () => { stopped = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const staticTitleField = (
    <Row>
      <Field label={<>Heading <span className="req-mark">*</span></>} grow path="staticText">
        <input
          type="text"
          placeholder="BREAKING NEWS"
          value={st.staticText ?? st.category ?? ''}
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
