# Slike Graphics Studio

Broadcast graphics editor for tickers, widgets and jackets: pick a template, edit it beside a live preview, save, and publish it to a player URL.

```
npm install
npm run dev      # https://local.sli.ke:8443 (needs "127.0.0.1 local.sli.ke" in /etc/hosts)
npm run build
```

Saving talks to the b2b-cms backend (`VITE_API_BACKEND`, JSON-RPC `graphic.*`) and uploads media
through `VITE_UPLOAD`; both are set in `.env` / `.env.production` (not in git; ask the team for them).

## Routes

Everything is in the hash, so one entry serves the studio and the player.

| Route | Shows |
| --- | --- |
| `#/` | Home |
| `#/templates/<ticker\|widgets\|jackets\|captions>` | the Templates room on that tab |
| `#/new/<kind>/<template>` | a new graphic from that template; its first save moves it to `#/edit/<id>` |
| `#/edit/<id>` | the saved graphic's editor and control panel |
| `#/edit/<id>?stream=<streamId>&name=<stream name>` | the same, opened by Slike Live for a graphic a running stream is using: the panel records the stream on the graphic (`config.air.live`), so the header here and Home everywhere show **ON AIR · name** and Publish reads *Push to air*. The claim lapses 6 h after Live last opened the panel; `&off=1` clears it at once, as does *Take off air* |
| `#/player?id=<id>&kind=…&data=…` | the output only: what is on air for that id, re-read every 10 s so a push reaches the screen; `data` is the state as copied, used when the backend can't be read (no login) |

## Publishing

The backend stores a graphic, not a publish, so the publish record travels inside the graphic's `config.air`
(`services/air.js`): the version, who pushed it, when, the note, the pushed state (`snap`) and the version
history. The editor keeps it apart from the editable state (`graphicMapper.js`); Save keeps it, Publish writes
the next version, *Take off air* clears `snap`. Players read `snap`. The studio also watches the open graphic
(`hooks/useRemoteWatch.js`) and shows a reload bar when someone else saves it.

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
│   └── home/            Home's parts: StartNew, PublishedStrip, GraphicsLibrary + GraphicCard, on
│                        useGraphicsIndex (every saved graphic as a card, with its publish record)
├── output/              what goes on air: TickerView, WidgetView, JacketView, PlayerView, …
├── hooks/               useRoute (the hash routes), useGraphic (one kind's edit / saved / on-air state),
│                        useDocument (the open graphic's backend identity: open, save, publish, take off
│                        air), useRemoteWatch (someone else's save), useMediaUpload (file uploads)
├── services/            backend calls: rpc, graphics (graphic.* methods), graphicMapper, air (the publish
│                        record), upload
├── constants/           templates, initial state, graphics, navigation, fonts, animations, video presets
├── utils/               changeDiff (review rows), playerUrl, time, color, files, placeholderThumb
├── styles/              app.css (output + editor parts), studio.css (page layout), legacy-tokens.css
└── assets/              videos and texture images
```

Conventions: components in PascalCase `.jsx`, one component per file; no API calls inside components (they go through `services/` and hooks); hooks `useX.js`; constants and utils camelCase `.js`. A component used by more than one feature lives in `features/shared-editor` or, if it is a general UI part, in `ui-kit`.
