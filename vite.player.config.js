import { defineConfig } from 'vite';
import pruneCss from './build/pruneCss.js';

// The on-air page, built on its own after the studio (npm run build): Preact stands in for
// React — the same components, a few KB instead of ~45 — and its CSS keeps only the rules the
// on-air code uses. `npm run dev` serves player.html with React, the studio's own setup.
export default defineConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'preact' },
  resolve: {
    alias: [
      { find: /^react$/, replacement: 'preact/compat' },
      { find: /^react-dom\/client$/, replacement: 'preact/compat/client' },
      { find: /^react-dom$/, replacement: 'preact/compat' },
      { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
    ],
  },
  // cpl-: the Cleo player's own elements, styled to fill an uploaded-video background
  plugins: [pruneCss({ keep: ['cpl-'] })],
  build: {
    emptyOutDir: false,
    rollupOptions: { input: 'player.html' },
  },
});
