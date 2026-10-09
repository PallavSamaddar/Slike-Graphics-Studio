import { useState } from 'react';
import { initialState, initialWidgetState, initialJacketState } from './data/initialState.js';
import { TPLS } from './data/templates.js';
import { WIDGET_TPLS } from './data/widgetTemplates.js';
import { JACKET_TPLS } from './data/jacketTemplates.js';
import { useTheme } from './useTheme.js';
import { getGraphic } from './api/graphics.js';
import { saveGraphic, fromGraphic, hasInlineMedia } from './api/graphicMapper.js';
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

// The graphic open in the studio. id/mt are null until its first save; mt is the saved
// version, sent back on every update so the backend can refuse a save that would
// overwrite someone else's newer one. savedTitle is the name as last saved.
const NEW_DOC = { id: null, mt: null, title: '', savedTitle: '' };
const CONFLICT_MESSAGE = 'Someone else saved this graphic after you opened it. Reopen it from Home to get their changes.';
const UPLOADING_MESSAGE = 'A video or image is still uploading. Save again once it finishes.';

// Deep copy, so editing a new graphic never mutates the initial state or a template.
const clone = (obj) => JSON.parse(JSON.stringify(obj));

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
  const [doc, setDoc] = useState(NEW_DOC);
  const { pick: themePick, setPick: setThemePick } = useTheme();

  // Per-kind editor wiring, so save and open don't need a branch per kind.
  const EDITORS = {
    ticker: { view: 'studio', initial: initialState, set: setSt, setSaved: setSavedSt },
    widget: { view: 'studio-widget', initial: initialWidgetState, set: setWst, setSaved: setSavedWst },
    jacket: { view: 'studio-jacket', initial: initialJacketState, set: setJst, setSaved: setSavedJst },
  };

  // Loads `next` into a kind's editor as its saved state, starting point and nothing on air.
  const startFrom = (kind, next) => {
    EDITORS[kind].set(next);
    EDITORS[kind].setSaved(next);
    setBase((b) => ({ ...b, [kind]: next }));
    setPub((p) => ({ ...p, [kind]: null }));
  };

  // Each template starts a new, unsaved graphic from the initial state, not the current
  // editor state, so nothing from the previously opened or saved graphic carries over.
  const applyTemplate = (id) => {
    const s = clone(initialState);
    const t = TPLS.find((tpl) => tpl.id === id);
    const next = !t ? { ...s, template: id } : {
      ...s,
      template: id,
      style: clone(t.style),
      badge: { ...s.badge, ...clone(t.badge), customText: t.badge.type },
      text: clone(t.text),
    };
    setDoc(NEW_DOC);
    startFrom('ticker', next);
  };

  const applyWidgetTemplate = (id) => {
    const s = clone(initialWidgetState);
    const t = WIDGET_TPLS.find((tpl) => tpl.id === id);
    const next = !t ? { ...s, template: id } : { ...s, template: id, style: clone(t.style) };
    setDoc(NEW_DOC);
    startFrom('widget', next);
    setWidgetPreviewTab(next.src);
  };

  const applyJacketTemplate = (id) => {
    const s = clone(initialJacketState);
    const t = JACKET_TPLS.find((tpl) => tpl.id === id);
    const next = !t ? { ...s, template: id } : { ...s, template: id, style: clone(t.style) };
    setDoc(NEW_DOC);
    startFrom('jacket', next);
  };

  // graphic.get, then load it into the matching editor. Errors are shown by the caller.
  const handleOpenGraphic = async (id) => {
    const graphic = await getGraphic(id);
    const editor = EDITORS[graphic.kind];
    if (!editor) throw new Error(`unknown graphic type "${graphic.kind}"`);
    const next = fromGraphic(graphic, editor.initial);
    startFrom(graphic.kind, next);
    if (graphic.kind === 'widget') setWidgetPreviewTab(next.src);
    const title = graphic.title || '';
    setDoc({ id: graphic.id, mt: graphic.mt, title, savedTitle: title });
    setReturnView('home');
    setView(editor.view);
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

  // graphic.create on the first save, graphic.update after that. Throws with a message
  // the page can show; the editor's saved state moves only once the backend has it.
  const persist = async (kind, cur) => {
    // Picked files sit in the editor as local data:/blob: URLs until their upload ends.
    if (hasInlineMedia(cur)) throw new Error(UPLOADING_MESSAGE);
    try {
      const { id, mt } = await saveGraphic({ ...doc, kind, st: cur });
      setDoc((d) => ({ ...d, id, mt, savedTitle: d.title }));
      EDITORS[kind].setSaved(cur);
    } catch (err) {
      throw new Error(err.isConflict ? CONFLICT_MESSAGE : `Not saved: ${err.message}`);
    }
  };

  // Save keeps the draft; Publish saves quietly, then puts it on air as the next version.
  // Publishing is local for now: the backend stores the graphic, not what is on air.
  const writer = (kind, cur, setCur, saved) => ({
    title: doc.title,
    savedTitle: doc.savedTitle,
    isNew: !doc.id,
    onTitleChange: (title) => setDoc((d) => ({ ...d, title })),
    onSave: () => persist(kind, cur),
    onPublish: async (note) => {
      await persist(kind, cur);
      const v = (pub[kind]?.v || 0) + 1;
      setPub((p) => ({ ...p, [kind]: { snap: cur, v, note } }));
      return v;
    },
    onDiscard: () => {
      setCur(saved);
      setDoc((d) => ({ ...d, title: d.savedTitle }));
    },
  });

  let page;
  if (view === 'home') {
    page = (
      <HomeDashboard
        onPickTicker={(id) => { setReturnView('home'); applyTemplate(id); setView('studio'); }}
        onPickWidget={(id) => { setReturnView('home'); applyWidgetTemplate(id); setView('studio-widget'); }}
        onPickJacket={(id) => { setReturnView('home'); applyJacketTemplate(id); setView('studio-jacket'); }}
        onOpenGraphic={handleOpenGraphic}
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
        {...writer('widget', wst, setWst, savedWst)}
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
        {...writer('jacket', jst, setJst, savedJst)}
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
        {...writer('ticker', st, setSt, savedSt)}
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
