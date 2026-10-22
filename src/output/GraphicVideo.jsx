import { useEffect, useRef, useState } from 'react';
import CleoVideoBackground from './CleoVideoBackground.jsx';

// A video a graphic plays on screen — muted, looping, inline, without controls — in a plain
// <video>, the lightest way to play it:
//   an .mp4 (or a local blob: while uploading) → the <video> plays it itself
//   an .m3u8 (an upload's <cdn base>/hls/master.m3u8) → itself where the browser plays HLS
//     (Safari, recent Chrome); elsewhere through hls.js's light build, fetched only then
//     (~119 KB gzipped, against ~348 KB for the whole Cleo player), at the quality the
//     player's on-screen size needs and with a short buffer, to keep memory low
// With no URL to play (a graphic saved before its upload's CDN base was kept), or when the
// URL fails, it falls back to the Cleo player by Slike media id.
const isHls = (url) => /\.m3u8(\?|$)/i.test(url);
const playsHlsItself = (video) => !!video.canPlayType('application/vnd.apple.mpegurl');

export default function GraphicVideo({ src, mediaId, opacity = 1, className = '' }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src, mediaId]);

  useEffect(() => {
    const video = ref.current;
    if (!src || failed || !video) return undefined;
    let hls = null;
    let gone = false;
    const fail = () => { if (!gone) setFailed(true); };
    const play = () => video.play().catch(() => {}); // muted, so autoplay is allowed
    video.muted = true;

    if (isHls(src) && !playsHlsItself(video)) {
      import('hls.js/light')
        .then(({ default: Hls }) => {
          if (gone) return;
          if (!Hls.isSupported()) { fail(); return; }
          hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 10, backBufferLength: 10 });
          hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) fail(); });
          hls.loadSource(src);
          hls.attachMedia(video);
          play();
        })
        .catch(fail);
    } else {
      video.src = src;
      play();
    }

    return () => {
      gone = true;
      hls?.destroy();
      video.removeAttribute('src');
      video.load(); // lets the browser drop the decoded video at once
    };
  }, [src, failed]);

  if (!src || failed) return mediaId ? <CleoVideoBackground mediaId={mediaId} opacity={opacity} className={className} /> : null;
  return (
    <video
      ref={ref}
      className={'widget-video-bg' + (className ? ' ' + className : '')}
      style={{ opacity }}
      muted
      loop
      playsInline
      autoPlay
      onError={() => setFailed(true)}
    />
  );
}

// An upload's HLS stream, from the CDN base its media record gives (media.list cdn[0].base).
export const uploadStream = (cdnBase) => (cdnBase ? `${cdnBase.replace(/\/+$/, '')}/hls/master.m3u8` : null);
