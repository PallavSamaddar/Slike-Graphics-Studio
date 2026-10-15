import { useState } from 'react';
import { useGraphicStats, INDEX_REFRESH_MS } from '../features/home/useGraphicsIndex.js';
import StartNew from '../features/home/StartNew.jsx';
import GraphicsLibrary from '../features/home/GraphicsLibrary.jsx';
import PublishedNow from '../features/home/PublishedNow.jsx';
import TemplatePickerDialog from '../features/templates/TemplatePickerDialog.jsx';

export default function HomePage({ onPickTemplate, onOpenGraphic }) {
  const [refresh, setRefresh] = useState(0);
  const [picking, setPicking] = useState(null); // the kind's gallery category, while its picker is open
  const changed = () => setTimeout(() => setRefresh((n) => n + 1), INDEX_REFRESH_MS);
  const stats = useGraphicStats(refresh);

  // My Graphics takes most of the page; Start new sits in a narrow column on the right.
  return (
    <div className="home-split">
      <div className="home-main">
        <GraphicsLibrary stats={stats} refresh={refresh} onChanged={changed} onOpen={onOpenGraphic} />
      </div>
      <aside className="home-aside">
        <StartNew onSeeAll={setPicking} />
        <PublishedNow refresh={refresh} onOpen={onOpenGraphic} />
      </aside>
      {picking && <TemplatePickerDialog category={picking} onPick={onPickTemplate} onClose={() => setPicking(null)} />}
    </div>
  );
}
