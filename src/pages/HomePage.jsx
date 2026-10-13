import { useState } from 'react';
import { usePublishedGraphics, useGraphicStats, INDEX_REFRESH_MS } from '../features/home/useGraphicsIndex.js';
import StartNew from '../features/home/StartNew.jsx';
import PublishedStrip from '../features/home/PublishedStrip.jsx';
import GraphicsLibrary from '../features/home/GraphicsLibrary.jsx';

export default function HomePage({ onSeeAll, onOpenGraphic }) {
  const [refresh, setRefresh] = useState(0);
  const changed = () => setTimeout(() => setRefresh((n) => n + 1), INDEX_REFRESH_MS);
  const published = usePublishedGraphics(refresh);
  const stats = useGraphicStats(refresh);

  return (
    <>
      <StartNew onSeeAll={onSeeAll} />
      <PublishedStrip graphics={published} onOpen={onOpenGraphic} />
      <GraphicsLibrary stats={stats} refresh={refresh} onChanged={changed} onOpen={onOpenGraphic} />
    </>
  );
}
