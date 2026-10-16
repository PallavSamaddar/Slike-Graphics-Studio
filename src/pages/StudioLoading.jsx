import { EditorHeader } from '../ui-kit';

const Line = ({ w }) => <span className="skel skel-line" style={{ width: w }} />;

// The studio's own layout while its graphic loads — header, content, preview and style in
// place, filled with placeholders — so the page is there at once and the data drops in.
//   onBack()
export default function StudioLoading({ onBack }) {
  return (
    <div aria-busy="true" aria-label="Opening the graphic">
      <EditorHeader
        name={<span className="skel skel-line studio-loading-name" />}
        onBack={onBack}
        publish={{ label: 'Publish', ghost: true, disabled: true, title: 'Opening the graphic…' }}
        more={[]}
      />
      <div className="detail studio-detail">
        <div className="form keyform">
          <div className="fieldset studio-loading-fields">
            <Line w="28%" />
            <span className="skel studio-loading-box" />
            <Line w="70%" />
            <Line w="55%" />
            <Line w="62%" />
            <Line w="40%" />
          </div>
        </div>
        <aside className="studio-side">
          <div className="studio-preview"><span className="skel studio-loading-preview" /></div>
          <div className="form keyform studio-style">
            <div className="fieldset studio-loading-fields">
              <Line w="22%" />
              <Line w="80%" />
              <Line w="65%" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
