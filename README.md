# Slike Graphics Studio

Broadcast graphics editor for tickers, widgets and jackets: pick a template, edit it beside a live preview, save, and publish it to a player URL.

```
npm install
npm run dev      # https://local.sli.ke:8443 (needs "127.0.0.1 local.sli.ke" in /etc/hosts)
npm run build
```

Saving talks to the b2b-cms backend (`VITE_API_BACKEND`, JSON-RPC `graphic.*`) and uploads media
through `VITE_UPLOAD`; both are set in `.env` / `.env.production`.

## Folder structure

```
src/
├── App.jsx              app shell: header band + which page shows
├── main.jsx             entry; #/player renders the output only
├── ui-kit/              the project's own UI library (see src/ui-kit/README.md)
├── pages/               HomePage, TemplatesPage, StudioPage — thin, composition only
├── features/
│   ├── ticker/          ticker editor sections + preview (index.jsx: TickerForm, TickerPreview)
│   ├── widget/          widget editor sections + preview
│   ├── jacket/          jacket editor sections + preview
│   ├── shared-editor/   parts every editor uses: ContentSource, FormattingToolbar, ColorField,
│   │                    ImageUpload, ImageCropperModal, VideoNameModal, PreviewCanvas, …
│   ├── templates/       template thumbnails, coming-soon panel
│   └── home/            SavedGraphics — "Your graphics" on Home
├── output/              what goes on air: TickerView, WidgetView, JacketView, PlayerView, …
├── hooks/               useGraphic (one kind's edit / saved / on-air state), useDocument (the open
│                        graphic's backend identity: open, save, publish), useMediaUpload (file uploads)
├── services/            backend calls: rpc, graphics (graphic.* methods), graphicMapper, upload
├── constants/           templates, initial state, graphics, navigation, fonts, animations, video presets
├── utils/               changeDiff (review rows), playerUrl, color, files, placeholderThumb
├── styles/              app.css (output + editor parts), studio.css (page layout), legacy-tokens.css
└── assets/              videos and texture images
```

Conventions: components in PascalCase `.jsx`, one component per file; no API calls inside components (they go through `services/` and hooks); hooks `useX.js`; constants and utils camelCase `.js`. A component used by more than one feature lives in `features/shared-editor` or, if it is a general UI part, in `ui-kit`.
