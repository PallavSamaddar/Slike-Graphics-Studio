// The fields a graphic can't be saved or published without — the ones the editor marks
// with a red `*`. `path` matches the Field's `path`, so the field shows the error itself.
const filled = (v) => typeof v === 'string' && v.trim() !== '';

const REQUIRED = {
  ticker: [],
  widget: [
    { path: 'heading', label: 'Heading', isMissing: (st) => !filled(st.heading) },
    // Feed fills the lines from their source; only a manual list is typed in.
    { path: 'items', label: 'Description lines', isMissing: (st) => st.src === 'manual' && !(st.items || []).some(filled) },
  ],
  jacket: [
    { path: 'headline', label: 'Headline', isMissing: (st) => !filled(st.headline) },
  ],
};

// → [{ path, label }] of the required fields still empty in `st`.
export const missingFields = (kind, st) => (REQUIRED[kind] || []).filter((f) => f.isMissing(st));

// The line under an empty field.
export const requiredMessage = (label) => `${label} is required.`;

// The toast when a save or publish is stopped: "Please fill in the required fields to save: Heading, Headline."
export const missingFieldsMessage = (fields, act) =>
  `Please fill in the required field${fields.length === 1 ? '' : 's'} to ${act}: ${fields.map((f) => f.label).join(', ')}.`;
