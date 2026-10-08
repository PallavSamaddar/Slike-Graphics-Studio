import { useState } from 'react';
import { initialState, initialWidgetState, initialJacketState } from './data/initialState.js';
import { TPLS } from './data/templates.js';
import { WIDGET_TPLS } from './data/widgetTemplates.js';
import { JACKET_TPLS } from './data/jacketTemplates.js';
import { useTheme } from './useTheme.js';
import { ToastHost } from './ui/Toast.jsx';
import TopBar from './ui/TopBar.jsx';
import TemplateGallery from './components/TemplateGallery.jsx';
import HomeDashboard from './components/HomeDashboard.jsx';
import StudioPage from './components/StudioPage.jsx';
import EditorPanel from './components/EditorPanel.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import StyleControls from './components/StyleControls.jsx';
import WidgetEditor from './components/WidgetEditor.jsx';
import WidgetPreviewPanel from './components/WidgetPreviewPanel.jsx';
import WidgetStyleControls from './components/WidgetStyleControls.jsx';
import JacketEditor from './components/JacketEditor.jsx';
import JacketPreviewPanel from './components/JacketPreviewPanel.jsx';
import JacketStyleControls from './components/JacketStyleControls.jsx';

const ROOMS = [
  { id: 'home', label: 'Home' },
  { id: 'templates', label: 'Templates', count: TPLS.length + WIDGET_TPLS.length + JACKET_TPLS.length },
];

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'gallery' | 'studio' | 'studio-widget' | 'studio-jacket'
  const [returnView, setReturnView] = useState('home'); // where the studio's back button goes
  const [galleryCategory, setGalleryCategory] = useState('ticker');
  const [st, setSt] = useState(initialState);
  const [savedSt, setSavedSt] = useState(initialState);
  const [wst, setWst] = useState(initialWidgetState);
  const [savedWst, setSavedWst] = useState(initialWidgetState);
  const [jst, setJst] = useState(initialJacketState);
  const [savedJst, setSavedJst] = useState(initialJacketState);
  const [widgetPreviewTab, setWidgetPreviewTab] = useState(initialWidgetState.src);
  // What is on air, per graphic: the published snapshot (what the player URL carries), its
  // version and note, and the template state it started from. null until first published.
  const [pub, setPub] = useState({ ticker: null, widget: null, jacket: null });
  const [base, setBase] = useState({ ticker: initialState, widget: initialWidgetState, jacket: initialJacketState });
  const { pick: themePick, setPick: setThemePick } = useTheme();

  const startFrom = (kind, next) => {
    setBase((b) => ({ ...b, [kind]: next }));
    setPub((p) => ({ ...p, [kind]: null }));
  };

  const applyTemplate = (id) => {
    setSt((s) => {
      const t = TPLS.find((tpl) => tpl.id === id);
      const next = !t ? { ...s, template: id } : {
        ...s,
        template: id,
        style: JSON.parse(JSON.stringify(t.style)),
        badge: { ...s.badge, ...JSON.parse(JSON.stringify(t.badge)), customText: t.badge.type },
        text: JSON.parse(JSON.stringify(t.text)),
      };
      setSavedSt(next);
      startFrom('ticker', next);
      return next;
    });
  };

  const applyWidgetTemplate = (id) => {
    setWst((s) => {
      const t = WIDGET_TPLS.find((tpl) => tpl.id === id);
      const next = !t ? { ...s, template: id } : { ...s, template: id, style: JSON.parse(JSON.stringify(t.style)) };
      setSavedWst(next);
      startFrom('widget', next);
      return next;
    });
  };

  const applyJacketTemplate = (id) => {
    setJst((s) => {
      const t = JACKET_TPLS.find((tpl) => tpl.id === id);
      const next = !t ? { ...s, template: id } : { ...s, template: id, style: JSON.parse(JSON.stringify(t.style)) };
      setSavedJst(next);
      startFrom('jacket', next);
      return next;
    });
  };

  const handlePick = (category, id) => {
    setReturnView('gallery');
    if (category === 'widgets') {
      applyWidgetTemplate(id);
      setView('studio-widget');
      return;
    }
    if (category === 'jackets') {
      applyJacketTemplate(id);
      setView('studio-jacket');
      return;
    }
    applyTemplate(id);
    setView('studio');
  };

  const room = view === 'home' ? 'home' : view === 'gallery' ? 'templates' : returnView === 'gallery' ? 'templates' : 'home';
  const onRoom = (id) => setView(id === 'home' ? 'home' : 'gallery');
  const shellTop = <TopBar room={room} rooms={ROOMS} onRoom={onRoom} themePick={themePick} onThemePick={setThemePick} />;

  // Save keeps the draft; Publish saves quietly, then puts it on air as the next version.
  const writer = (kind, cur, setSaved, setCur, saved) => ({
    onSave: () => setSaved(cur),
    onPublish: (note) => {
      setSaved(cur);
      const v = (pub[kind]?.v || 0) + 1;
      setPub((p) => ({ ...p, [kind]: { snap: cur, v, note } }));
      return v;
    },
    onDiscard: () => setCur(saved),
  });

  let page;
  if (view === 'home') {
    page = (
      <HomeDashboard
        onPickTicker={(id) => { setReturnView('home'); applyTemplate(id); setView('studio'); }}
        onPickWidget={(id) => { setReturnView('home'); applyWidgetTemplate(id); setView('studio-widget'); }}
        onPickJacket={(id) => { setReturnView('home'); applyJacketTemplate(id); setView('studio-jacket'); }}
        onSeeAllTicker={() => { setGalleryCategory('ticker'); setView('gallery'); }}
        onSeeAllWidgets={() => { setGalleryCategory('widgets'); setView('gallery'); }}
        onSeeAllJackets={() => { setGalleryCategory('jackets'); setView('gallery'); }}
      />
    );
  } else if (view === 'gallery') {
    page = <TemplateGallery key={galleryCategory} onPick={handlePick} initialCategory={galleryCategory} />;
  } else if (view === 'studio-widget') {
    page = (
      <StudioPage
        kind="widget"
        cur={wst}
        saved={savedWst}
        base={base.widget}
        pub={pub.widget}
        {...writer('widget', wst, setSavedWst, setWst, savedWst)}
        onBack={() => { if (returnView === 'gallery') setGalleryCategory('widgets'); setView(returnView); }}
        form={<>
          <WidgetEditor st={wst} setSt={setWst} viewTab={widgetPreviewTab} setViewTab={setWidgetPreviewTab} />
          <WidgetStyleControls st={wst} setSt={setWst} />
        </>}
        preview={<WidgetPreviewPanel st={wst} setSt={setWst} viewTab={widgetPreviewTab} />}
      />
    );
  } else if (view === 'studio-jacket') {
    page = (
      <StudioPage
        kind="jacket"
        cur={jst}
        saved={savedJst}
        base={base.jacket}
        pub={pub.jacket}
        {...writer('jacket', jst, setSavedJst, setJst, savedJst)}
        onBack={() => { if (returnView === 'gallery') setGalleryCategory('jackets'); setView(returnView); }}
        form={<>
          <JacketEditor st={jst} setSt={setJst} />
          <JacketStyleControls st={jst} setSt={setJst} />
        </>}
        preview={<JacketPreviewPanel st={jst} setSt={setJst} />}
      />
    );
  } else {
    page = (
      <StudioPage
        kind="ticker"
        cur={st}
        saved={savedSt}
        base={base.ticker}
        pub={pub.ticker}
        {...writer('ticker', st, setSavedSt, setSt, savedSt)}
        onBack={() => { if (returnView === 'gallery') setGalleryCategory('ticker'); setView(returnView); }}
        form={<>
          <EditorPanel st={st} setSt={setSt} />
          <StyleControls st={st} setSt={setSt} />
        </>}
        preview={<PreviewPanel st={st} setSt={setSt} />}
      />
    );
  }

  return (
    <ToastHost>
      <div className="shell">
        {shellTop}
        <main id="main" className="view-in" key={view}>{page}</main>
      </div>
    </ToastHost>
  );
}
