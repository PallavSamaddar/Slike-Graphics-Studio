import { useEffect, useRef, useState } from 'react';
import { GRAPHICS, KIND_BY_CATEGORY } from './constants/graphics.js';
import { BRAND, ROOMS, PROFILE_MENU } from './constants/navigation.jsx';
import useGraphic from './hooks/useGraphic.js';
import useDocument from './hooks/useDocument.js';
import useCurrentUser from './hooks/useCurrentUser.js';
import useRoute, { navigate, routes } from './hooks/useRoute.js';
import { inFrame } from './utils/frame.js';
import { EmptyState, ToastHost, TopBar, useTheme } from './ui-kit';
import HomePage from './pages/HomePage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';
import StudioPage from './pages/StudioPage.jsx';
import StudioLoading from './pages/StudioLoading.jsx';
import { TickerContent, TickerStyle, TickerPreview } from './features/ticker';
import { WidgetContent, WidgetStyle, WidgetPreview } from './features/widget';
import { JacketContent, JacketStyle, JacketPreview } from './features/jacket';
import LiveFeedPreview from './features/shared-editor/LiveFeedPreview.jsx';

// The app shell: the header band, and which page the route (hooks/useRoute.js) shows.
export default function App() {
  const route = useRoute();
  const graphics = { ticker: useGraphic(GRAPHICS.ticker), widget: useGraphic(GRAPHICS.widget), jacket: useGraphic(GRAPHICS.jacket) };
  const { setPick: setThemePick, theme } = useTheme({ followHost: inFrame });
  const user = useCurrentUser();

  // The studio once its graphic is loaded: { kind }; while it loads, null; or the failure.
  const [studio, setStudio] = useState(null);
  const [openError, setOpenError] = useState('');
  const loadedRef = useRef(''); // the studio route last loaded, so a re-render never reloads it
  const fromRef = useRef(routes.home()); // where the studio's back goes: the room it was opened from

  // A new graphic's first save gives it an id: the address becomes its own, without a reload.
  const docs = useDocument(graphics, {
    onCreated: (id) => {
      loadedRef.current = `edit:${id}`;
      navigate(routes.edit(id), { replace: true });
    },
  });

  useEffect(() => {
    if (route.view === 'new') {
      const key = `new:${route.kind}:${route.template}`;
      if (loadedRef.current === key) return;
      if (!GRAPHICS[route.kind]) { navigate(routes.home(), { replace: true }); return; }
      loadedRef.current = key;
      docs.startNew();
      graphics[route.kind].applyTemplate(route.template);
      setOpenError('');
      setStudio({ kind: route.kind });
    } else if (route.view === 'edit') {
      const key = `edit:${route.id}`;
      if (loadedRef.current === key) return;
      loadedRef.current = key;
      setStudio(null);
      setOpenError('');
      docs.open(route.id)
        .then(({ kind }) => {
          if (loadedRef.current !== key) return;
          setStudio({ kind });
        })
        .catch((err) => { if (loadedRef.current === key) setOpenError(err.message); });
    } else {
      loadedRef.current = '';
      setStudio(null);
      fromRef.current = route.view === 'gallery' ? routes.gallery(route.category) : routes.home();
    }
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  const inStudio = route.view === 'new' || route.view === 'edit';
  const room = route.view === 'gallery' || (inStudio && fromRef.current.startsWith('#/templates')) ? 'templates' : 'home';
  // In a frame the host page has its own back, so the studio shows none.
  const back = inFrame ? null : () => navigate(fromRef.current);
  const pickTemplate = (category, id) => navigate(routes.newGraphic(KIND_BY_CATEGORY[category], id));

  let page;
  if (route.view === 'home') {
    page = (
      <HomePage
        onPickTemplate={pickTemplate}
        onOpenGraphic={(id) => navigate(routes.edit(id))}
      />
    );
  } else if (route.view === 'gallery') {
    page = (
      <TemplatesPage
        category={route.category}
        onCategory={(category) => navigate(routes.gallery(category), { replace: true })}
        onPick={pickTemplate}
      />
    );
  } else if (openError) {
    page = (
      <EmptyState title="Couldn't open this graphic">
        {openError} <button type="button" className="zlink" onClick={() => { loadedRef.current = ''; navigate(route.id ? routes.edit(route.id, route.stream) : routes.home(), { replace: true }); }}>Try again</button>
        {' · '}<button type="button" className="zlink" onClick={() => navigate(routes.home())}>Home</button>
      </EmptyState>
    );
  } else if (!studio) {
    page = <StudioLoading onBack={back} />;
  } else {
    const kind = studio.kind;
    const g = graphics[kind];
    const editor = docs.studio(kind);
    // Content fills the left column; the preview and, under it, the style sections the right.
    const parts = {
      ticker: {
        content: <TickerContent st={g.cur} setSt={g.setCur} />,
        style: <TickerStyle st={g.cur} setSt={g.setCur} />,
        preview: <LiveFeedPreview st={g.cur} refreshedAt={editor.doc.feedRefreshedAt} onFeed={editor.graphic.applyFeed}>{(st) => <TickerPreview st={st} />}</LiveFeedPreview>,
      },
      widget: {
        content: <WidgetContent st={g.cur} setSt={g.setCur} />,
        style: <WidgetStyle st={g.cur} setSt={g.setCur} />,
        preview: <LiveFeedPreview st={g.cur} refreshedAt={editor.doc.feedRefreshedAt} onFeed={editor.graphic.applyFeed}>{(st) => <WidgetPreview st={st} setSt={g.setCur} />}</LiveFeedPreview>,
      },
      jacket: {
        content: <JacketContent st={g.cur} setSt={g.setCur} />,
        style: <JacketStyle st={g.cur} setSt={g.setCur} />,
        preview: <JacketPreview st={g.cur} setSt={g.setCur} />,
      },
    }[kind];
    page = (
      <StudioPage
        kind={kind}
        {...editor}
        stream={null}
        onBack={back}
        content={parts.content}
        style={parts.style}
        preview={parts.preview}
      />
    );
  }

  const pageKey = inStudio ? `studio-${studio?.kind || 'loading'}-${route.id || route.template}` : route.view;

  return (
    <ToastHost>
      <div className="shell">
        {!inFrame && <TopBar
          brand={BRAND}
          rooms={ROOMS}
          room={room}
          onRoom={(id) => navigate(id === 'home' ? routes.home() : routes.gallery('ticker'))}
          onBrand={() => navigate(routes.home())}
          user={user}
          menu={PROFILE_MENU}
          theme={theme}
          onThemePick={inFrame ? undefined : setThemePick}
        />}
        <main id="main" className="view-in" key={pageKey}>{page}</main>
      </div>
    </ToastHost>
  );
}
