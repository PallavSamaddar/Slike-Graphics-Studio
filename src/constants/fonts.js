// The typefaces a graphic's text can use (value = the CSS font-family it renders with).
export const FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: "'Playfair Display', Georgia, serif", label: 'Playfair Display' },
  { value: "Georgia, 'Times New Roman', serif", label: 'Georgia' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: "'Courier New', Courier, monospace", label: 'Courier' },
];

// font-family → its name.
export const FONT_NAME = Object.fromEntries(FONTS.map((f) => [f.value, f.label]));
