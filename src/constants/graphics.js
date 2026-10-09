import { initialState, initialWidgetState, initialJacketState } from './initialState.js';
import { TPLS } from './tickerTemplates.js';
import { WIDGET_TPLS } from './widgetTemplates.js';
import { JACKET_TPLS } from './jacketTemplates.js';

const clone = (o) => JSON.parse(JSON.stringify(o));

// The three kinds of graphic. Each names its templates, its starting state, the gallery tab
// it lives under, and how picking a template shapes the state (kept exactly as before).
export const GRAPHICS = {
  ticker: {
    name: 'Ticker',
    category: 'ticker',
    templates: TPLS,
    initial: initialState,
    applyTemplate: (s, id) => {
      const t = TPLS.find((tpl) => tpl.id === id);
      return !t ? { ...s, template: id } : {
        ...s,
        template: id,
        style: clone(t.style),
        badge: { ...s.badge, ...clone(t.badge), customText: t.badge.type },
        text: clone(t.text),
      };
    },
  },
  widget: {
    name: 'Widget',
    category: 'widgets',
    templates: WIDGET_TPLS,
    initial: initialWidgetState,
    applyTemplate: (s, id) => {
      const t = WIDGET_TPLS.find((tpl) => tpl.id === id);
      return !t ? { ...s, template: id } : { ...s, template: id, style: clone(t.style) };
    },
  },
  jacket: {
    name: 'Jacket',
    category: 'jackets',
    templates: JACKET_TPLS,
    initial: initialJacketState,
    applyTemplate: (s, id) => {
      const t = JACKET_TPLS.find((tpl) => tpl.id === id);
      return !t ? { ...s, template: id } : { ...s, template: id, style: clone(t.style) };
    },
  },
};

// Gallery tab → kind of graphic.
export const KIND_BY_CATEGORY = { ticker: 'ticker', widgets: 'widget', jackets: 'jacket' };

export const TEMPLATE_COUNT = TPLS.length + WIDGET_TPLS.length + JACKET_TPLS.length;
