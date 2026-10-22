import { useEffect, useRef, useState } from 'react';
import { useGraphicStats, INDEX_REFRESH_MS } from '../features/home/useGraphicsIndex.js';
import StartNew from '../features/home/StartNew.jsx';
import GraphicsLibrary from '../features/home/GraphicsLibrary.jsx';
import TemplatePickerDialog from '../features/templates/TemplatePickerDialog.jsx';

export default function HomePage({ onPickTemplate, onOpenGraphic }) {
  const [refresh, setRefresh] = useState(0);
  const [picking, setPicking] = useState(null); // the kind's gallery category, while its picker is open
  // A change (archive, duplicate…) re-reads the list a little later, once the index has it;
  // several changes in a row re-read it once, and leaving the page cancels it.
  const refreshTimer = useRef(null);
  const changed = () => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => setRefresh((n) => n + 1), INDEX_REFRESH_MS);
  };
  useEffect(() => () => clearTimeout(refreshTimer.current), []);
  const stats = useGraphicStats(refresh);

  // My Graphics takes most of the page; Start new sits in a narrow column on the right.
  return (
    <div className="home-split">
      <div className="home-main">
        <GraphicsLibrary stats={stats} refresh={refresh} onChanged={changed} onOpen={onOpenGraphic} />
      </div>
      <aside className="home-aside">
        <StartNew onPick={setPicking} />
      </aside>
      {picking && <TemplatePickerDialog category={picking} onPick={onPickTemplate} onClose={() => setPicking(null)} />}
    </div>
  );
}
