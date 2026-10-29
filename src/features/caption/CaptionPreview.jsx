import CaptionView from '../../output/CaptionView.jsx';
import PreviewCanvas from '../shared-editor/PreviewCanvas.jsx';

// The caption as it goes on air, over a stand-in picture; drag the strap to place it.
export default function CaptionPreview({ st, setSt }) {
  return (
    <PreviewCanvas variant="caption-canvas">
      <CaptionView st={st} setSt={setSt} />
    </PreviewCanvas>
  );
}
