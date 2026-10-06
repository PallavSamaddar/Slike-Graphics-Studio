import { useState } from 'react';
import { initialState, initialWidgetState, initialJacketState } from './data/initialState.js';
import { TPLS } from './data/templates.js';
import { WIDGET_TPLS } from './data/widgetTemplates.js';
import { JACKET_TPLS } from './data/jacketTemplates.js';
import { useTheme } from './useTheme.js';
import TemplateGallery from './components/TemplateGallery.jsx';
import HomeDashboard from './components/HomeDashboard.jsx';
import Header from './components/Header.jsx';
import EditorPanel from './components/EditorPanel.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import WidgetEditor from './components/WidgetEditor.jsx';
import WidgetPreviewPanel from './components/WidgetPreviewPanel.jsx';
import JacketEditor from './components/JacketEditor.jsx';
import JacketPreviewPanel from './components/JacketPreviewPanel.jsx';

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
  const [saved, setSaved] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
      return next;
    });
  };

  const applyWidgetTemplate = (id) => {
    setWst((s) => {
      const t = WIDGET_TPLS.find((tpl) => tpl.id === id);
      const next = !t ? { ...s, template: id } : { ...s, template: id, style: JSON.parse(JSON.stringify(t.style)) };
      setSavedWst(next);
      return next;
    });
  };

  const applyJacketTemplate = (id) => {
    setJst((s) => {
      const t = JACKET_TPLS.find((tpl) => tpl.id === id);
      const next = !t ? { ...s, template: id } : { ...s, template: id, style: JSON.parse(JSON.stringify(t.style)) };
      setSavedJst(next);
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

  const handleSave = (kind) => {
    if (kind === 'widget') setSavedWst(wst);
    else if (kind === 'jacket') setSavedJst(jst);
    else setSavedSt(st);
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  };

  const handleResetTicker = () => setSt(savedSt);
  const handleResetWidget = () => setWst(savedWst);
  const handleResetJacket = () => setJst(savedJst);

  if (view === 'home') {
    return (
      <HomeDashboard
        theme={theme}
        onToggleTheme={toggleTheme}
        onPickTicker={(id) => { setReturnView('home'); applyTemplate(id); setView('studio'); }}
        onPickWidget={(id) => { setReturnView('home'); applyWidgetTemplate(id); setView('studio-widget'); }}
        onPickJacket={(id) => { setReturnView('home'); applyJacketTemplate(id); setView('studio-jacket'); }}
        onSeeAllTicker={() => { setGalleryCategory('ticker'); setView('gallery'); }}
        onSeeAllWidgets={() => { setGalleryCategory('widgets'); setView('gallery'); }}
        onSeeAllJackets={() => { setGalleryCategory('jackets'); setView('gallery'); }}
      />
    );
  }

  if (view === 'gallery') {
    return (
      <TemplateGallery
        onPick={handlePick}
        theme={theme}
        onToggleTheme={toggleTheme}
        initialCategory={galleryCategory}
        onHome={() => setView('home')}
      />
    );
  }

  if (view === 'studio-widget') {
    return (
      <>
        <Header
          st={wst}
          kind="widget"
          onSave={() => handleSave('widget')}
          saved={saved}
          onBack={() => { if (returnView === 'gallery') setGalleryCategory('widgets'); setView(returnView); }}
          dirty={JSON.stringify(wst) !== JSON.stringify(savedWst)}
          onReset={handleResetWidget}
        />
        <div className="studio">
          <main className="panel-center">
            <div className="tab-body">
              <WidgetEditor st={wst} setSt={setWst} viewTab={widgetPreviewTab} setViewTab={setWidgetPreviewTab} />
            </div>
          </main>
          <WidgetPreviewPanel st={wst} setSt={setWst} viewTab={widgetPreviewTab} />
        </div>
      </>
    );
  }

  if (view === 'studio-jacket') {
    return (
      <>
        <Header
          st={jst}
          kind="jacket"
          onSave={() => handleSave('jacket')}
          saved={saved}
          onBack={() => { if (returnView === 'gallery') setGalleryCategory('jackets'); setView(returnView); }}
          dirty={JSON.stringify(jst) !== JSON.stringify(savedJst)}
          onReset={handleResetJacket}
        />
        <div className="studio">
          <main className="panel-center">
            <div className="tab-body">
              <JacketEditor st={jst} setSt={setJst} />
            </div>
          </main>
          <JacketPreviewPanel st={jst} setSt={setJst} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        st={st}
        onSave={() => handleSave('ticker')}
        saved={saved}
        onBack={() => { if (returnView === 'gallery') setGalleryCategory('ticker'); setView(returnView); }}
        dirty={JSON.stringify(st) !== JSON.stringify(savedSt)}
        onReset={handleResetTicker}
      />
      <div className="studio">
        <EditorPanel st={st} setSt={setSt} />
        <PreviewPanel st={st} setSt={setSt} />
      </div>
    </>
  );
}
