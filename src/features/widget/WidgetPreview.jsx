import WidgetView from '../../output/WidgetView.jsx';
import PreviewCanvas from '../shared-editor/PreviewCanvas.jsx';

// The widget as it goes on air, live while you edit.
export default function WidgetPreview({ st, setSt }) {
  return (
    <PreviewCanvas variant="widget-canvas">
      <WidgetView st={st} setSt={setSt} />
    </PreviewCanvas>
  );
}
