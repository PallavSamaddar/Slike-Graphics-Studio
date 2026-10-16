import { callRpc } from './rpc.js';
import { feedMediaOn } from '../constants/widgetTemplates.js';

const MRSS = 'http://search.yahoo.com/mrss/';
const CONTENT = 'http://purl.org/rss/1.0/modules/content/';
const MEDIA_TYPES = /^(image|video)\//;

export class FeedError extends Error {}

const text = (el) => (el?.textContent || '').trim();
const htmlParser = new DOMParser();
const plain = (html) => {
  if (!html) return '';
  const textOnly = /[<&]/.test(html) ? htmlParser.parseFromString(html, 'text/html').body.textContent || '' : html;
  return textOnly.replace(/\s+/g, ' ').trim();
};
const PLACEHOLDER = /^(undefined|null|none|n\/a|-)$/i;
const firstText = (els) => {
  for (const el of els) {
    const t = plain(text(el));
    if (t && !PLACEHOLDER.test(t)) return t;
  }
  return '';
};

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

function parseFeed(xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new FeedError("This isn't a valid RSS or Atom feed.");
  const rss = [...doc.getElementsByTagName('item')];
  const atom = rss.length ? [] : [...doc.getElementsByTagName('entry')];
  if (!rss.length && !atom.length) throw new FeedError('This feed has no items.');
  const parsed = (rss.length ? rss : atom).map((item) => ({
    title: text(child(item, 'title')),
    description: firstText([
      child(item, 'description'),
      child(item, 'encoded', CONTENT),
      child(item, 'summary'),
      child(item, 'content'),
      item.getElementsByTagNameNS(MRSS, 'description')[0],
    ]),
    media: mediaUrl(item),
  }));
  const first = rss[0] || atom[0];
  return parsed;
}

async function fetchFeed(url) {
  let res;
  try {
    res = await callRpc('graphic.feed', { url });
  } catch (err) {
    throw new FeedError(err.code === 502 ? 'Invalid feed URL.' : err.message);
  }
  return parseFeed(res?.body || '');
}

function titledItems(items) {
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
  if (kind === 'widget') next.descriptions = { ...st.descriptions, rss: items.map((i) => i.description || '') };
  const mediaList = st.media?.rss || [];
  if (feedMediaOn(st)) {
    const pos = mediaList.find(Boolean)?.pos || st.style?.badgeImagePos || 'left';
    next.media = { ...st.media, rss: items.map((i) => (i.media ? { pos, url: i.media } : null)) };
  }
  return next;
}

export function withoutFeedItems(st) {
  const next = { ...st, drafts: { ...st.drafts, rss: [] } };
  if (st.src === 'rss') next.items = [];
  if (st.descriptions) next.descriptions = { ...st.descriptions, rss: [] };
  if (st.media) next.media = { ...st.media, rss: [] };
  if (feedMediaOn(st)) next.showFeedMedia = true;
  return next;
}

// A graphic without the parts a feed refresh writes — what's left are the person's own edits.
export const withoutFeed = (st) => ({
  ...st,
  rssRefreshSec: undefined,
  items: undefined,
  drafts: { ...st.drafts, rss: undefined },
  descriptions: { ...st.descriptions, rss: undefined },
  media: { ...st.media, rss: undefined },
});

// What a graphic shows from its feed, comparable between two states of it.
const feedPart = (st) => JSON.stringify([st?.drafts?.rss, st?.descriptions?.rss, st?.media?.rss]);
export const sameFeed = (a, b) => feedPart(a) === feedPart(b);
// True if the two states differ only in what a feed refresh writes (or not at all).
export const onlyFeedDiffers = (a, b) => JSON.stringify(withoutFeed(a)) === JSON.stringify(withoutFeed(b));

export const REFRESH_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 60, label: 'Every 1 min' },
  { value: 300, label: 'Every 5 min' },
  { value: 900, label: 'Every 15 min' },
  { value: 1800, label: 'Every 30 min' },
];
