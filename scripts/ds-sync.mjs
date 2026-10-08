#!/usr/bin/env node
// ds:sync — pulls the Player Console design system into src/ds/vendor/.
//
// The design system is consumed as a dependency, not copied into the source tree:
// src/ds/vendor/ is git-ignored and rebuilt from the system's own export every time
// this runs (it also runs before `dev` and `build`).
//
// Source: the system's `project/` folder, exported from the Claude Design artifact
// (https://claude.ai/artifact/XZnAh4ZPTW3mTpsiAMUsht). Point DS_PATH at it, or keep it
// at ../player-console-ds/project next to this repo.
//
// What it writes:
//   vendor/bundle.css   — components/bundle.css, unchanged
//   vendor/tokens.json  — tokens.json, unchanged (for tools)
//   vendor/fonts/*      — the system's font files, unchanged
//   vendor/tokens.css   — compiled from tokens.json, exactly as the system compiles it
//                         (`:root, [data-theme="<first>"]` colours and shadows, one block per
//                         further theme, `:root` for every other family and `--font-<key>`,
//                         a `.type-*` class per type style, `@font-face` per font).
//   vendor/SOURCE.txt   — where it came from and the system's last change.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.resolve(root, process.env.DS_PATH || '../player-console-ds/project');
const out = path.join(root, 'src/ds/vendor');

const need = ['tokens.json', 'components/bundle.css'];
for (const f of need) {
  if (!fs.existsSync(path.join(src, f))) {
    console.error(`ds:sync — no ${f} under ${src}.\nExport the Player Console design system's project/ folder there, or set DS_PATH.`);
    process.exit(1);
  }
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });

fs.copyFileSync(path.join(src, 'components/bundle.css'), path.join(out, 'bundle.css'));
fs.copyFileSync(path.join(src, 'tokens.json'), path.join(out, 'tokens.json'));

const tokens = JSON.parse(fs.readFileSync(path.join(src, 'tokens.json'), 'utf8'));

// ---- tokens.css ----------------------------------------------------------------------
const themes = tokens.color.themes.map((t) => t.id);
const first = themes[0];
const val = (v) => (typeof v === 'string' && /^\{[^}]+\}$/.test(v) ? `var(--${v.slice(1, -1)})` : v);
const perTheme = (t, th) => (typeof t.value === 'string' ? (th === first ? t.value : undefined) : t.value[th]);
const esc = (n) => n.replace(/\./g, '\\.');

let css = `/* ${tokens.name} — generated from tokens.json by scripts/ds-sync.mjs. Do not edit. */\n`;

for (const f of tokens.type.fonts || []) {
  const file = f.file.includes('/') ? f.file : `fonts/${f.file}`;
  const base = path.basename(file);
  fs.copyFileSync(path.join(src, file), path.join(out, 'fonts', base));
  css += `@font-face { font-family: "${f.family}"; src: url("./fonts/${base}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style || 'normal'}; font-display: swap; }\n`;
}

const themed = [...tokens.color.tokens, ...((tokens.shadow && tokens.shadow.tokens) || [])];
themes.forEach((th, i) => {
  const sel = i === 0 ? `:root, [data-theme="${th}"]` : `[data-theme="${th}"]`;
  const lines = themed
    .map((t) => [t.name, perTheme(t, th)])
    .filter(([, v]) => v !== undefined)
    .map(([n, v]) => `  --${esc(n)}: ${val(v)};`);
  css += `${sel} {\n${lines.join('\n')}\n}\n`;
});

const plain = Object.entries(tokens)
  .filter(([k, v]) => !['color', 'type', 'shadow'].includes(k) && v && Array.isArray(v.tokens))
  .flatMap(([, v]) => v.tokens);
const fams = Object.entries(tokens.type.families || {}).map(([k, v]) => `  --font-${k}: ${v};`);
css += `:root {\n${plain.map((t) => `  --${esc(t.name)}: ${t.value};`).join('\n')}\n${fams.join('\n')}\n}\n`;

for (const g of tokens.type.groups || []) {
  for (const s of g.styles) {
    const fam = s.family || g.family;
    const decl = [
      fam && `font-family: var(--font-${fam})`,
      s.fontSize && `font-size: ${s.fontSize}`,
      s.lineHeight && `line-height: ${s.lineHeight}`,
      s.fontWeight && `font-weight: ${s.fontWeight}`,
      s.letterSpacing && `letter-spacing: ${s.letterSpacing}`,
      s.textTransform && `text-transform: ${s.textTransform}`,
    ].filter(Boolean);
    css += `.${esc(s.name)} { ${decl.join('; ')}; }\n`;
  }
}

fs.writeFileSync(path.join(out, 'tokens.css'), css);

let last = '';
try {
  const idx = JSON.parse(fs.readFileSync(path.join(src, 'design-system.json'), 'utf8'));
  if (idx.lastChange) last = `${idx.lastChange.at} by ${idx.lastChange.by}`;
} catch { /* the index is optional */ }
fs.writeFileSync(path.join(out, 'SOURCE.txt'), `${tokens.name}\nfrom: ${src}\nlast change: ${last || 'unknown'}\nsynced: ${new Date().toISOString()}\n`);

console.log(`ds:sync — ${tokens.name} → src/ds/vendor (${themes.join(', ')}; last change ${last || 'unknown'})`);
