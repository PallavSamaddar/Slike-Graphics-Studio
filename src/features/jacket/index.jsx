import JacketContentSections from './JacketContentSections.jsx';
import JacketStyleSection from './JacketStyleSection.jsx';
import JacketPreview from './JacketPreview.jsx';

// The jacket editor: its form sections and its live preview.
export function JacketForm({ st, setSt }) {
  return (
    <>
      <JacketContentSections st={st} setSt={setSt} />
      <JacketStyleSection st={st} setSt={setSt} />
    </>
  );
}

export { JacketPreview };
