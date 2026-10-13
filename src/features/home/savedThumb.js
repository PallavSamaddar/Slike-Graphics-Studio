import { GRAPHICS } from '../../constants/graphics.js';

const findTemplate = (kind, id) => {
  const templates = GRAPHICS[kind]?.templates || [];
  return templates.find((t) => t.id === id) || templates[0];
};

function tickerTemplate(tpl, config) {
  const style = { ...tpl.style, ...config.style };
  const badge = { ...tpl.badge, ...config.badge };
  return {
    ...tpl,
    style,
    badge,
    text: { ...tpl.text, ...config.text },
    mini: {
      ...tpl.mini,
      bg: style.bgGradient || style.bgColor || tpl.mini.bg,
      tc: style.textColor || tpl.mini.tc,
      bb: badge.show === false ? null : badge.bgColor || tpl.mini.bb,
      bt: badge.textColor || tpl.mini.bt,
      badge: badge.customText || badge.type || tpl.mini.badge,
    },
  };
}

export function savedThumb(g) {
  const tpl = findTemplate(g.kind, g.template_id);
  if (!tpl) return null;
  const config = g.config || {};
  const lines = (g.items || []).filter((x) => typeof x === 'string' && x.trim());

  if (g.kind === 'ticker') {
    return { t: tickerTemplate(tpl, config), text: lines.length ? { lines: lines.slice(0, 2) } : {} };
  }
  const t = { ...tpl, style: { ...tpl.style, ...config.style } };
  if (g.kind === 'widget') {
    const text = {};
    if (config.heading) text.heading = config.heading;
    if (lines[0]) text.line = lines[0];
    return { t, text };
  }
  return { t, text: {} };
}
