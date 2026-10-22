import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

// Keeps only the CSS rules the bundle's own code can use. Every string in the bundled source
// files (and the page's HTML) is split into class names; one ending in "-" or cut by a
// `${…}` is a prefix (`'widget-texture-' + id`, `anim-${transition}`). A selector stays when
// every class in it (outside :not(…)) is one of those; @keyframes and rules without classes
// always stay. The studio's stylesheet holds editor and on-air rules together; the on-air
// page needs only the second. `keep` = class prefixes added by other scripts at run time,
// which no source string names (the Cleo player's own elements).
const STRINGS = /'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`]*)`/g;
const CUT = '\u0000';

function classesIn(files) {
  const exact = new Set();
  const prefixes = new Set();
  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    for (const m of code.matchAll(STRINGS)) {
      const text = (m[1] ?? m[2] ?? m[3]).replace(/\$\{[^}]*\}/g, CUT);
      for (const token of text.split(/[\s"'=<>]+/)) {
        if (!token) continue;
        const [head] = token.split(CUT);
        if (token.includes(CUT) || head.endsWith('-')) {
          if (head.length > 1) prefixes.add(head);
        } else exact.add(token);
      }
    }
  }
  return { exact, prefixes: [...prefixes] };
}

export default function pruneCss({ keep = [] } = {}) {
  let outDir = 'dist';
  let root = process.cwd();
  const sources = new Set();
  return {
    name: 'prune-css',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
      root = config.root;
    },
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        for (const id of Object.keys(chunk.modules)) {
          const file = id.split('?')[0];
          if (file.startsWith(path.join(root, 'src')) && /\.(jsx?|tsx?)$/.test(file)) sources.add(file);
        }
        if (chunk.facadeModuleId?.endsWith('.html')) sources.add(chunk.facadeModuleId);
      }
    },
    writeBundle(_, bundle) {
      for (const html of Object.keys(bundle).filter((f) => f.endsWith('.html'))) sources.add(path.resolve(root, html));
      const used = classesIn([...sources].filter((f) => fs.existsSync(f)));
      const prefixes = [...used.prefixes, ...keep];
      const known = (c) => used.exact.has(c) || prefixes.some((p) => c.startsWith(p));
      const usable = (selector) => [...selector.replace(/:not\([^)]*\)/g, '').matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].every((m) => known(m[1]));
      for (const name of Object.keys(bundle).filter((f) => f.endsWith('.css'))) {
        const file = path.resolve(root, outDir, name);
        const css = postcss.parse(fs.readFileSync(file, 'utf8'));
        css.walkRules((rule) => {
          if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
          const kept = rule.selectors.filter(usable);
          if (!kept.length) rule.remove();
          else rule.selectors = kept;
        });
        css.walkAtRules((at) => { if (at.nodes && !at.nodes.length) at.remove(); });
        fs.writeFileSync(file, css.toString());
      }
    },
  };
}
