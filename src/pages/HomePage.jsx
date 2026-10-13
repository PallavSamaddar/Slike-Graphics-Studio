import useGraphicsIndex from '../features/home/useGraphicsIndex.js';
import StartNew from '../features/home/StartNew.jsx';
import PublishedStrip from '../features/home/PublishedStrip.jsx';
import GraphicsLibrary from '../features/home/GraphicsLibrary.jsx';

// Home, for the person running graphics: where to start, what is published, and every
// saved graphic to search and open. Templates live in their own room.
//   onSeeAll(galleryCategory) · onOpenGraphic(id)
export default function HomePage({ onSeeAll, onOpenGraphic }) {
  const index = useGraphicsIndex();
  // On air first (the latest seen), then published by the latest push.
  const published = index.graphics
    .filter((g) => g.live || g.published)
    .sort((a, b) => (!!b.live - !!a.live) || (b.live?.at || 0) - (a.live?.at || 0) || (b.air?.at || 0) - (a.air?.at || 0));

  return (
    <>
      <StartNew onSeeAll={onSeeAll} />
      <PublishedStrip graphics={published} onOpen={onOpenGraphic} />
      <GraphicsLibrary index={index} onOpen={onOpenGraphic} />
    </>
  );
}
