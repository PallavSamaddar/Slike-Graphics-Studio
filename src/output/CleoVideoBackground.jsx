import { useEffect, useRef } from 'react';
import loadScript from '../utils/loadScript.js';

// Every video a graphic plays on screen goes through the Slike Cleo player — a widget's
// background (uploaded, or still uploading) and a jacket's main video. Set up as
// slike-frontend's GeneralPlayer (src/components/CleoPlayer/GeneralPlayer.tsx): cpl.js, then
// `new window.CleoPlayer(config, cb)` on a div; played on MEDIA_READY, paused and destroyed when
// the video changes or the graphic goes away. Muted, looping and without controls.
//   mediaId: a Slike media id — Cleo looks it up under the mediainfo base, as everywhere else
//   src:     a file or stream URL (an .mp4 or .m3u8, or a local blob: while uploading) — handed to
//            Cleo through callbacks.onMediaData, which replaces that lookup (cleo-player
//            public/open.html). Cleo still needs a non-empty id: a dot-free token from the URL.
const CPL_URL = import.meta.env.VITE_CPL_BASE_URL;
const API_KEY = import.meta.env.VITE_CPL_API_KEY;
const MEDIA_BASE = (import.meta.env.VITE_CPL_MEDIA_BASE || '').replace(/\/+$/, '');

const AUTOPLAY_ON_READY = 2; // as GeneralPlayer: load, then play() on MEDIA_READY

// Cleo splits an id on "." and treats one starting "yt" as YouTube — so a short token instead.
const urlToken = (url) => {
  let hash = 0;
  for (let i = 0; i < url.length; i++) hash = (hash * 31 + url.charCodeAt(i)) >>> 0;
  return `url${hash.toString(36)}`;
};

// What Cleo would have fetched for a media id, for a URL: an .m3u8 plays through its HLS
// player, anything else natively. `flavours.support` is read by Cleo's light build only.
function mediaDataFor(url) {
  const probe = document.createElement('video');
  return {
    playerType: /\.m3u8(\?|$)/i.test(url) ? 'hls' : 'native',
    isLive: false,
    video: {
      url,
      flavours: { support: { hls: !!probe.canPlayType('application/vnd.apple.mpegurl'), mse: typeof window.MediaSource !== 'undefined', mp4: true } },
    },
  };
}

export default function CleoVideoBackground({ mediaId, src, opacity = 1, className = '' }) {
  const elRef = useRef(null);

  useEffect(() => {
    if ((!mediaId && !src) || !CPL_URL || !elRef.current) return undefined;
    let player = null;
    let gone = false;
    const url = src ? new URL(src, window.location.href).href : null;
    const what = mediaId || url;

    loadScript(CPL_URL)
      .then(() => {
        const { CleoPlayer } = window;
        if (gone || !CleoPlayer) return;
        player = new CleoPlayer({
          id: mediaId || urlToken(url),
          el: elRef.current,
          autoPlay: AUTOPLAY_ON_READY,
          apiKey: API_KEY,
          mute: true,
          controls: false,
          skipModule: { skipAd: true, skipAnalytics: true },
          callbacks: {
            onPlayerConfig: () => ({ player: { bgPause: false, loop: true, fgResume: false } }),
            ...(mediaId ? {} : { onMediaData: (_id, done) => done(200, null, mediaDataFor(url)) }),
          },
          internals: { mediaBase: `${MEDIA_BASE}/` },
        }, (error) => {
          if (error) console.error('CleoPlayer could not play', what, error);
        });
        player.on(CleoPlayer.Events?.MEDIA_READY, () => player?.play());
        player.on(CleoPlayer.Events?.LOAD_ERROR, (eventName, obj) => console.error(eventName, obj));
      })
      .catch((err) => console.error('CleoPlayer SDK failed to load', err));

    return () => {
      gone = true;
      try {
        if (player?.state) player.pause();
        player?.destroy?.();
      } catch (err) {
        console.warn('Error destroying CleoPlayer', err);
      }
      player = null;
    };
  }, [mediaId, src]);

  return <div ref={elRef} className={'widget-video-bg widget-cleo-bg' + (className ? ' ' + className : '')} style={{ opacity }} />;
}
