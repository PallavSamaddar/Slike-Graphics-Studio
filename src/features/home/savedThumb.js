import { GRAPHICS } from '../../constants/graphics.js';
import { feedMediaOn } from '../../constants/widgetTemplates.js';

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
    const src = g.source_type || g.source?.type || 'rss';
    const legacy = src === 'manual' && config.heading && !Array.isArray(config.descriptions?.manual);
    const hideDescriptions = config.showFeedDescription === false;
    const synced = src === 'rss' && Array.isArray(g.descriptions) && g.descriptions.length > 0;
    const descriptions = hideDescriptions ? [] : synced ? g.descriptions : config.descriptions?.[src] || [];
    const titles = synced ? (g.items || []) : config.drafts?.[src]?.length ? config.drafts[src] : lines;
    const withDesc = titles.findIndex((title, i) => title?.trim() && descriptions[i]?.trim());
    const text = legacy
      ? { heading: config.heading, line: lines[0] || '' }
      : withDesc >= 0
        ? { heading: titles[withDesc], line: descriptions[withDesc] }
        : { heading: lines[0] || 'Untitled', line: '' };
    const shown = Math.max(0, withDesc);
    const feedMedia = config.media?.rss || [];
    const itemImage = src === 'rss'
      ? (feedMediaOn(config) ? (synced ? g.media?.[shown] : feedMedia[shown]?.url) : null)
      : config.media?.manual?.[shown]?.url;
    text.image = itemImage || config.style?.badgeImage || null;
    text.imagePos = (src === 'rss' && feedMedia.find(Boolean)?.pos) || config.style?.badgeImagePos;
    return { t, text };
  }
  return { t, text: {} };
}
