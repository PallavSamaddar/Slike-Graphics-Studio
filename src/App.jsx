import { useState } from 'react';
import { GRAPHICS, KIND_BY_CATEGORY } from './constants/graphics.js';
import { BRAND, ROOMS, USER, PROFILE_MENU } from './constants/navigation.jsx';
import { initialWidgetState } from './constants/initialState.js';
import useGraphic from './hooks/useGraphic.js';
import useDocument from './hooks/useDocument.js';
import { ToastHost, TopBar, useTheme } from './ui-kit';
import HomePage from './pages/HomePage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';
import StudioPage from './pages/StudioPage.jsx';
import { TickerForm, TickerPreview } from './features/ticker';
import { WidgetForm, WidgetPreview } from './features/widget';
import { JacketForm, JacketPreview } from './features/jacket';

// The app shell: the header band, and which page is showing.
//   view: 'home' | 'gallery' | 'studio' (with `kind`: 'ticker' | 'widget' | 'jacket')
export default function App() {
  const [view, setView] = useState('home');
  const [kind, setKind] = useState('ticker');
  const [returnView, setReturnView] = useState('home'); // where the studio's back button goes
  const [galleryCategory, setGalleryCategory] = useState('ticker');
  const [widgetViewTab, setWidgetViewTab] = useState(initialWidgetState.src);
  const graphics = { ticker: useGraphic(GRAPHICS.ticker), widget: useGraphic(GRAPHICS.widget), jacket: useGraphic(GRAPHICS.jacket) };
  const docs = useDocument(graphics);
  const { pick: themePick, setPick: setThemePick } = useTheme();

  const showStudio = (k, state, from) => {
    if (k === 'widget') setWidgetViewTab(state.src);
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
    const parts = {
      ticker: { form: <TickerForm st={g.cur} setSt={g.setCur} />, preview: <TickerPreview st={g.cur} setSt={g.setCur} /> },
      widget: {
        form: <WidgetForm st={g.cur} setSt={g.setCur} viewTab={widgetViewTab} setViewTab={setWidgetViewTab} />,
        preview: <WidgetPreview st={g.cur} setSt={g.setCur} viewTab={widgetViewTab} />,
      },
      jacket: { form: <JacketForm st={g.cur} setSt={g.setCur} />, preview: <JacketPreview st={g.cur} setSt={g.setCur} /> },
    }[kind];
    page = <StudioPage kind={kind} {...docs.studio(kind)} onBack={back} form={parts.form} preview={parts.preview} />;
  }

  return (
    <ToastHost>
      <div className="shell">
        <TopBar
          brand={BRAND}
          rooms={ROOMS}
          room={room}
          onRoom={(id) => setView(id === 'home' ? 'home' : 'gallery')}
          user={USER}
          menu={PROFILE_MENU}
          themePick={themePick}
          onThemePick={setThemePick}
        />
        <main id="main" className="view-in" key={view === 'studio' ? `studio-${kind}` : view}>{page}</main>
      </div>
    </ToastHost>
  );
}
