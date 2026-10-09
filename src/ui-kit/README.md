# Graphics Studio UI kit

This project's own UI library. Every screen of the studio is built from it; nothing outside this folder decides how a control looks. Change a colour, a size or a component here and the whole app follows.

## Using it

```jsx
import { Section, Row, Field, Select, Toggle } from '../../ui-kit';
```

The kit's look is loaded once by the studio (`src/styles/index.js` imports `ui-kit/styles`). The `#/player` output never loads it.

## What is in it

| Folder | What |
| --- | --- |
| `styles/tokens.css` | Design values: colours for light and dark, spacing, radii, sizes, type sizes and weights, the IBM Plex fonts. |
| `styles/kit.css` | The look of every component, built only on the tokens. |
| `styles/fonts/` | IBM Plex Sans and Mono. |
| `components/` | The React components below. |
| `hooks/` | `useTheme` (Light / Dark / Match device, kept in this browser), `useDismiss` (close a menu on outside click or Esc), `useChangeMarks` (`ChangeScope` + `useChanged`: the amber mark on a field changed since the last save). |

| Component | Use it for |
| --- | --- |
| `TopBar` | The header band: brand, rooms, profile menu with the theme choice. |
| `PageHead` | A room's title (and optional sub-line and primary act). |
| `EditorHeader` | An editor's sticky header: back, name, an optional editable title (`title` + `onTitleChange`), status, Save · Publish · ⋯. |
| `Section`, `Row`, `GroupLabel` | An editor section with its title (and optional act), a row of fields, a group name inside a section. |
| `Field` | Label, control, then a hint or an error. Pass `path` to get the change mark. |
| `Select` | Any choice of four or more answers (searchable past eight). Never a native `<select>`. |
| `SegmentedControl` | Two or three short answers side by side. |
| `Toggle` | On/off for a thing that runs or doesn't. |
| `NumberBox` | A number with its unit; ↑/↓ step by 1, Shift by 10. |
| `Tabs` | Picking one subject inside a page or section. |
| `Status`, `Version` | Where a thing stands (`live`, `off`, `pending`), a version number. |
| `ChooserCard`, `CreateCard`, `ChooserGrid` | Cards to start from (picture, name, fact, ⋯). |
| `RowMenu`, `MenuItem` | Secondary acts behind ⋯. |
| `Dialog` | A confirm: a question, one paragraph, two acts. |
| `ChangeReview` | The side panel every Save / Publish reads back in (old → new). |
| `ToastHost`, `useToast` | The one-line receipt at the bottom. |
| `EmptyState` | A pane with nothing in it yet. |

## Rules of the kit

- One control per concept: the kit's `Select`, `SegmentedControl`, `Toggle`, `Dialog` — no native select, `confirm` or `prompt`.
- One filled (accent) button per screen; everything beside it is `btn ghost`.
- Sentence case for titles and labels; machine values (versions, URLs) in the mono.
- A colour is always a token. Add a token to `tokens.css` (light and dark) before using a new colour.
- A field that can't apply greys in place (`Field off`) with its reason; it never disappears.

## Origin

The kit started (Oct 2026) as a copy of the parts of the Player Console design system this app used — tokens, the matching stylesheet rules, the fonts — and is now owned and changed only here.
