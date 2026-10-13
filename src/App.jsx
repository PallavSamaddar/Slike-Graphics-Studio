import { useState } from 'react';
import { GRAPHICS, KIND_BY_CATEGORY } from './constants/graphics.js';
import { BRAND, ROOMS, PROFILE_MENU } from './constants/navigation.jsx';
import useGraphic from './hooks/useGraphic.js';
import useDocument from './hooks/useDocument.js';
import useCurrentUser from './hooks/useCurrentUser.js';
import { ToastHost, TopBar, useTheme } from './ui-kit';
import HomePage from './pages/HomePage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';
import StudioPage from './pages/StudioPage.jsx';
import { TickerContent, TickerStyle, TickerPreview } from './features/ticker';
import { WidgetContent, WidgetStyle, WidgetPreview } from './features/widget';
import { JacketContent, JacketStyle, JacketPreview } from './features/jacket';
import LiveFeedPreview from './features/shared-editor/LiveFeedPreview.jsx';

// The app shell: the header band, and which page is showing.
//   view: 'home' | 'gallery' | 'studio' (with `kind`: 'ticker' | 'widget' | 'jacket')
export default function App() {
  const [view, setView] = useState('home');
  const [kind, setKind] = useState('ticker');
  const [returnView, setReturnView] = useState('home'); // where the studio's back button goes
  const [galleryCategory, setGalleryCategory] = useState('ticker');
  const graphics = { ticker: useGraphic(GRAPHICS.ticker), widget: useGraphic(GRAPHICS.widget), jacket: useGraphic(GRAPHICS.jacket) };
  const docs = useDocument(graphics);
  const { pick: themePick, setPick: setThemePick } = useTheme();
  const user = useCurrentUser();

  const showStudio = (k, state, from) => {
    setReturnView(from);
    setKind(k);
    setView('studio');
  };
  // A template starts a new, unsaved graphic.
  const openTemplate = (k, id, from) => {
    docs.startNew();
    showStudio(k, graphics[k].applyTemplate(id), from);
  };
  // A saved graphic opens from Home.
  const openGraphic = async (id) => {
    const { kind: k, state } = await docs.open(id);
    showStudio(k, state, 'home');
  };
  const seeAll = (category) => { setGalleryCategory(category); setView('gallery'); };
  const back = () => { if (returnView === 'gallery') setGalleryCategory(GRAPHICS[kind].category); setView(returnView); };

  const room = view === 'home' ? 'home' : view === 'gallery' ? 'templates' : returnView === 'gallery' ? 'templates' : 'home';

  let page;
  if (view === 'home') {
    page = <HomePage onPick={(k, id) => openTemplate(k, id, 'home')} onSeeAll={seeAll} onOpenGraphic={openGraphic} />;
  } else if (view === 'gallery') {
    page = <TemplatesPage key={galleryCategory} initialCategory={galleryCategory} onPick={(category, id) => openTemplate(KIND_BY_CATEGORY[category], id, 'gallery')} />;
  } else {
    const g = graphics[kind];
    // Content fills the left column; the preview and, under it, the style sections the right.
    const parts = {
      ticker: {
        content: <TickerContent st={g.cur} setSt={g.setCur} />,
        style: <TickerStyle st={g.cur} setSt={g.setCur} />,
        preview: <LiveFeedPreview kind="ticker" st={g.cur} setSt={g.setCur}>{(st) => <TickerPreview st={st} setSt={g.setCur} />}</LiveFeedPreview>,
      },
      widget: {
        content: <WidgetContent st={g.cur} setSt={g.setCur} />,
        style: <WidgetStyle st={g.cur} setSt={g.setCur} />,
        preview: <LiveFeedPreview kind="widget" st={g.cur} setSt={g.setCur}>{(st) => <WidgetPreview st={st} setSt={g.setCur} />}</LiveFeedPreview>,
      },
      jacket: {
        content: <JacketContent st={g.cur} setSt={g.setCur} />,
        style: <JacketStyle st={g.cur} setSt={g.setCur} />,
        preview: <JacketPreview st={g.cur} setSt={g.setCur} />,
      },
    }[kind];
    page = <StudioPage kind={kind} {...docs.studio(kind)} onBack={back} content={parts.content} style={parts.style} preview={parts.preview} />;
  }

  return (
    <ToastHost>
      <div className="shell">
        <TopBar
          brand={BRAND}
          rooms={ROOMS}
          room={room}
          onRoom={(id) => setView(id === 'home' ? 'home' : 'gallery')}
          user={user}
          menu={PROFILE_MENU}
          themePick={themePick}
          onThemePick={setThemePick}
        />
        <main id="main" className="view-in" key={view === 'studio' ? `studio-${kind}` : view}>{page}</main>
      </div>
    </ToastHost>
  );
}
