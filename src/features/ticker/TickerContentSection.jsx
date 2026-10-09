import ContentSource from '../shared-editor/ContentSource.jsx';

// The ticker's Content source section, first on the editor's one surface.
export default function TickerContentSection({ st, setSt }) {
  return <ContentSource st={st} setSt={setSt} />;
}
