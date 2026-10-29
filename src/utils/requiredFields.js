const filled = (v) => typeof v === 'string' && v.trim() !== '';

const REQUIRED = {
  ticker: [],
  widget: (st) => {
    if (st.src !== 'manual') return [];
    const titles = st.drafts?.manual?.length ? st.drafts.manual : [''];
    return titles.map((title, i) => ({
      path: `drafts.manual.${i}`,
      label: titles.length > 1 ? `Title (item ${i + 1})` : 'Title',
      isMissing: () => !filled(title),
    }));
  },
  jacket: [
    { path: 'headline', label: 'Headline', isMissing: (st) => !filled(st.headline) },
  ],
  caption: (st) => {
    const names = st.names?.length ? st.names : [''];
    return names.map((name, i) => ({
      path: `names.${i}`,
      label: names.length > 1 ? `Name (caption ${i + 1})` : 'Name',
      isMissing: () => !filled(name),
    }));
  },
};

export const missingFields = (kind, st) => {
  const fields = typeof REQUIRED[kind] === 'function' ? REQUIRED[kind](st) : REQUIRED[kind] || [];
  return fields.filter((f) => f.isMissing(st));
};

export const requiredMessage = (label) => `${label} is required.`;

export const missingFieldsMessage = (fields, act) =>
  `Please fill in the required field${fields.length === 1 ? '' : 's'} to ${act}: ${fields.map((f) => f.label).join(', ')}.`;
