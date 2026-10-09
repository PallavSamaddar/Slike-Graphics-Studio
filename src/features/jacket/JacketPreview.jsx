import JacketView from '../../output/JacketView.jsx';
import PreviewCanvas from '../shared-editor/PreviewCanvas.jsx';

// The jacket as it goes on air, live while you edit.
export default function JacketPreview({ st, setSt }) {
  return (
    <PreviewCanvas variant="jacket-canvas">
      <JacketView st={st} setSt={setSt} />
    </PreviewCanvas>
  );
}
