
export const embedUrl = (id) => {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '/player?id=' + encodeURIComponent(id);
  return url.toString();
};
