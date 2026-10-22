// The on-air page for a graphic: player.html beside the studio's own page.
export const embedUrl = (id) => {
  const url = new URL('player.html', window.location.href);
  url.search = `?id=${encodeURIComponent(id)}`;
  url.hash = '';
  return url.toString();
};
