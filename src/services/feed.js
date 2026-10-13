import { callRpc } from './rpc.js';

const API_BASE = import.meta.env.VITE_API_BACKEND;
const MRSS = 'http://search.yahoo.com/mrss/';
const CONTENT = 'http://purl.org/rss/1.0/modules/content/';
const MEDIA_TYPES = /^(image|video)\//;

export class FeedError extends Error {}

const text = (el) => (el?.textContent || '').trim();

// An element's first child by local name, in a namespace or by its prefixed name.
function child(item, name, ns) {
  const byNs = ns ? item.getElementsByTagNameNS(ns, name)[0] : null;
  return byNs || item.getElementsByTagName(name)[0] || null;
}

function mediaUrl(item) {
  const content = [...item.getElementsByTagNameNS(MRSS, 'content')]
    .find((el) => el.getAttribute('url') && (!el.getAttribute('type') || MEDIA_TYPES.test(el.getAttribute('type'))));
  if (content) return content.getAttribute('url');
  const thumb = item.getElementsByTagNameNS(MRSS, 'thumbnail')[0];
  if (thumb?.getAttribute('url')) return thumb.getAttribute('url');
  const enclosure = [...item.getElementsByTagName('enclosure')].find((el) => MEDIA_TYPES.test(el.getAttribute('type') || ''));
  return enclosure?.getAttribute('url') || null;
}

// → [{ title, description, media }] — empty strings / null where an item lacks the field.
function parseFeed(xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new FeedError("This isn't a valid RSS or Atom feed.");
  const rss = [...doc.getElementsByTagName('item')];
  const atom = rss.length ? [] : [...doc.getElementsByTagName('entry')];
  if (!rss.length && !atom.length) throw new FeedError('This feed has no items.');
  return (rss.length ? rss : atom).map((item) => ({
    title: text(child(item, 'title')),
    description: text(child(item, 'description')) || text(child(item, 'encoded', CONTENT)) || text(child(item, 'summary')) || text(child(item, 'content')),
    media: mediaUrl(item),
  }));
}

async function fetchFeed(url) {
  let res;
  try {
    res = await callRpc('graphic.feed', { url });
  } catch (err) {
    // 502: the feed was unreachable or answered with an error (404 and the like).
    throw new FeedError(err.code === 502 ? 'Invalid feed URL.' : err.message);
  }
  return parseFeed(res?.body || '');
}

// The player's read: the headlines the backend's refresh cron last saved on the graphic,
// as [{ title, media }] (the cron doesn't keep descriptions).
export async function fetchGraphicFeed(graphicId) {
  const res = await fetch(`${API_BASE}/graphicfeed?id=${encodeURIComponent(graphicId)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new FeedError(json.msg || `the feed answered HTTP ${res.status}`);
  return (json.data?.items || []).map((i) => ({ title: i.title, description: '', media: i.media || null }));
}

// The feed's items checked against what the graphic needs: every headline comes from an
// item's title, so items without one are left out, and a feed with none is an error.
export function titledItems(items) {
  const titled = items.filter((i) => i.title);
  if (!titled.length) throw new FeedError('No item in this feed has a title.');
  return titled;
}

export async function loadFeed(url) {
  return titledItems(await fetchFeed(url));
}

export function withFeedItems(kind, st, items) {
  const titles = items.map((i) => i.title);
  const next = { ...st, drafts: { ...(st.drafts || {}), rss: titles }, items: titles };
  if (kind === 'widget') {
    next.heading = titles[0] || '';
    next.items = titles.slice(1);
  }
  const mediaList = st.media?.rss || [];
  if (mediaList.length) {
    const pos = mediaList.find(Boolean)?.pos || 'left';
    next.media = { ...st.media, rss: items.map((i) => (i.media ? { pos, url: i.media } : null)) };
  }
  return next;
}

export const REFRESH_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 60, label: 'Every 1 min' },
  { value: 300, label: 'Every 5 min' },
  { value: 900, label: 'Every 15 min' },
  { value: 1800, label: 'Every 30 min' },
];
