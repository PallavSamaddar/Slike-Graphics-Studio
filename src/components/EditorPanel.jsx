import ContentSource from './ContentSource.jsx';

// The ticker's Content source section, first on the editor's one surface.
export default function EditorPanel({ st, setSt }) {
  return <ContentSource st={st} setSt={setSt} />;
}
