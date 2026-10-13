// Slike medias (b2b-cms `media.*`): the videos uploaded through the upload SDK, as
// slike-frontend's media list shows them.
import { callRpc } from './rpc.js';
import { UPLOAD_SOURCE } from './uploadSdk.js';

const THUMB_SIZE_SUFFIX = '_180'; // as slike-frontend's THUMBNAIL_SIZE_SUFFIX
const MEDIA_STATUS_READY = 5;
const MEDIA_STATE_READY = 10;

// The studio's uploads are registered with source UPLOAD_SOURCE (uploadSdk.js); newest first.
const UPLOADED_VIDEOS_QUERY = {
  must_not: { ctype: ['premiere'], content_type: 2, status: -99, media_status: 3 },
  must: { asset_type: ['video'], source: UPLOAD_SOURCE },
  sort: { ctuser: 'desc' },
};

// Resolves to { list, count }.
export const listUploadedVideos = ({ size = 30, from = 0 } = {}) =>
  callRpc('media.list', { ...UPLOADED_VIDEOS_QUERY, size, from });

// Transcoded and playable.
export const isMediaReady = (media) => media.status === MEDIA_STATUS_READY && media.state === MEDIA_STATE_READY;

// The media's small thumbnail, or '' when it has none yet.
export function mediaThumbUrl(media) {
  const base = (media.images?.base || media.cdn?.[0]?.base || '').replace(/\/+$/, '');
  const thumb = media.images?.thumb;
  return base && thumb ? `${base}/${thumb}${THUMB_SIZE_SUFFIX}.jpg` : '';
}
