import { useEffect, useState } from 'react';

// The studio's routes, in the hash so the player (#/player, main.jsx) and the pages share
// one entry. Each is a plain object the app shell switches on:
//   #/                               { view: 'home' }
//   #/templates/<category>           { view: 'gallery', category }
//   #/new/<kind>/<template>          { view: 'new', kind, template }
//   #/edit/<id>?stream=<id>&name=…   { view: 'edit', id, stream: { id, name, off } | null }
// `stream` is how Slike Live says a graphic is on a running stream: it opens the control
// panel with the stream's id and name, and the panel records it on the graphic (air.live) so
// Home and the panel show ON AIR everywhere. `&off=1` says the stream stopped using it.
export const routes = {
  home: () => '#/',
  gallery: (category) => `#/templates/${category}`,
  newGraphic: (kind, template) => `#/new/${kind}/${encodeURIComponent(template)}`,
  edit: (id, stream) => `#/edit/${encodeURIComponent(id)}` + (stream ? `?${new URLSearchParams({ stream: stream.id, name: stream.name || '' })}` : ''),
};

export function parseRoute(hash = window.location.hash) {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(query);
  switch (parts[0]) {
    case 'templates': return { view: 'gallery', category: parts[1] || 'ticker' };
    case 'new': return parts[1] && parts[2] ? { view: 'new', kind: parts[1], template: decodeURIComponent(parts[2]) } : { view: 'home' };
    case 'edit': {
      if (!parts[1]) return { view: 'home' };
      const stream = params.get('stream');
      return { view: 'edit', id: decodeURIComponent(parts[1]), stream: stream ? { id: stream, name: params.get('name') || '', off: params.get('off') === '1' } : null };
    }
    default: return { view: 'home' };
  }
}

// Goes to `hash`; `replace` swaps the current entry (after a first save turns #/new into #/edit).
export function navigate(hash, { replace = false } = {}) {
  if (replace) window.history.replaceState(null, '', hash);
  else window.location.hash = hash;
  // replaceState fires no hashchange; tell listeners ourselves
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export default function useRoute() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const onChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
