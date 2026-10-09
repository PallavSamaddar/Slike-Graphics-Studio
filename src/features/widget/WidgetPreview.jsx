import WidgetView from '../../output/WidgetView.jsx';
import PreviewCanvas from '../shared-editor/PreviewCanvas.jsx';

// The widget as it goes on air, live while you edit; it follows the content tab that is open.
export default function WidgetPreview({ st, setSt, viewTab }) {
  return (
    <PreviewCanvas variant="widget-canvas">
      <WidgetView st={st} setSt={setSt} viewTab={viewTab} />
    </PreviewCanvas>
  );
}
