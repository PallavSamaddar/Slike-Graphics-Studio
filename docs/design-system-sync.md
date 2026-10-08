# Player Console design system — sync notes

The studio's UI runs on the Player Console design system (Claude Design artifact `XZnAh4ZPTW3mTpsiAMUsht`). Features, data and output are unchanged; the `#/player` output does not load the system and renders pixel-identical to before.

## How it is consumed

- `npm run ds:sync` (also runs before `dev` and `build`) rebuilds `src/ds/vendor/` from the system's exported `project/` folder: `bundle.css` and the fonts as they are, and `tokens.css` compiled from `tokens.json` the way the system compiles it. `vendor/` is git-ignored.
- Source path: `DS_PATH`, default `../player-console-ds/project`. To take an update, re-export the artifact's `project/` folder there and run `npm run ds:sync`.
- `src/ds/bridge.css` is the only local layer: page overflow, old colour names aliased to system tokens for undesigned parts, and layout the system leaves to the page.

## Deviation log

| Where | Differs from the system | Why |
| --- | --- | --- |
| Studio layout | Live preview column sits where the version rail goes; no version rail | Agreed: the preview is essential. The publish note is kept with the version but shown nowhere yet |
| Header band | App's own logomark and "Graphics Studio"; rooms are Home and Templates; Home has no count | Agreed name/logo. The system has no Home room icon, so one is drawn on its 16px / 1.5 stroke grid |
| Profile menu | No role line; "Settings" instead of "View profile" | The app has no role; items kept as they were (non-functional, as before) |
| Undesigned parts | Colour field and picker, image cropper (its own frame, zoom slider), bold/italic/underline/alignment icon strip, texture and video swatch rows with scroll arrows, texture speed stepper and opacity slider, template thumbnails, line-numbered headline editor, upload/thumbnail rows, fullscreen button, preview stage | No system design. Left structurally as they were; their colours and corners read system tokens through bridge aliases |
| Change review | No version line on a Save or Publish when nothing has been published yet; a first Publish counts "N changes from the template" | `40-not-designed-yet.md`: anything never published |
| Change review | Publish shows the next number ("→ v2 goes on air") | The app knows the next version locally |
| Publish | Greyed with its reason when nothing is waiting, instead of opening a review that reads "v3 on air" alone | Simpler; the reason is on hover |
| Discard | A quiet danger link inside the Save review that closes it and opens the house confirm; Cancel reopens the review | Asked for inside the review; stacking a confirm over a side panel is not designed |
| Writes | The busy state ("Saving…", "Publishing…") is drawn but flashes, since writes are local and instant | No server |
| ⋯ menu | Copy URL / Open URL carry the published version and grey until the first publish ("Not on air — publish it first"); the `window.prompt` copy fallback is now a red toast | Follows from the Publish step; no native prompt |
| Fields | Ticker Behaviour fields for the other display mode, the widget's Background colour under a video, and the widget Image under feed media now grey in place instead of disappearing | Interaction rule: every field stays in the DOM |
| Copy | Sentence case throughout; "Save Ticker" → "Save"; "Copied!" → "URL copied"; "Duration (sec)" → "Duration" with a `sec` unit; section titles added (Style, Badge, Behaviour, Details, Background); the formatting row split into Text case, Font, Font size and Text style; vertical align icons → Top / Middle / Bottom; logo position grid → a select; "Validated" stays as words in a ghost button | Sentence case, one control per concept, words before icons |
| Templates room | The category sidebar is a tab strip under the page head; the gallery's back button is gone (the Home room does it); cards carry template names; Start from scratch is the create card | Navigation in the band; ChooserCard has a title |
| Required mark | `*` after Heading, Description lines and Headline kept | The system has no required marker |
| Headline box | A textarea drawn with the field box's tokens (bridge) | The system draws no textarea |
| Badge text | Its 0/20 counter sits inside the box as a unit | Closest system grammar |
| Utilities | `.sr-only` added (bridge) | The system has none; used for the busy announcement |
| tokens.css | Compiled by `ds:sync` from `tokens.json` | The artifact does not publish its compiled `tokens.css` |
| Widths | Not checked below 1280px | Not designed (`40-not-designed-yet.md`) |
| styles.css | Keeps its old `:root` colours for `#/player`; 264 UI selectors the system replaced were removed | The output must not change |

## Removed

`Header`, `CategoryRail`, `CardMenu`, `ThemeToggle`, `UserMenu` (replaced by the system's parts) and `TemplatesPanel`, `SecHeader` (already unused).
