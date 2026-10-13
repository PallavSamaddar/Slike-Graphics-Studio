import { useEffect, useRef } from 'react';
import loadScript from '../utils/loadScript.js';

// A widget background played by the Slike Cleo player from a Slike media id (the id the
// upload SDK returns, or one picked from the uploaded list) — set up as slike-frontend's
// GeneralPlayer (src/components/CleoPlayer/GeneralPlayer.tsx): cpl.js, then
// `new window.CleoPlayer(config, cb)` on a div with the media id, the slike api key and the
// mediainfo base the media is looked up under; played on MEDIA_READY, paused and destroyed
// when the id changes or the widget goes away. Muted, looping and without controls, like the
// other background videos.
const CPL_URL = import.meta.env.VITE_CPL_BASE_URL;
const API_KEY = import.meta.env.VITE_CPL_API_KEY;
const MEDIA_BASE = (import.meta.env.VITE_CPL_MEDIA_BASE || '').replace(/\/+$/, '');

const AUTOPLAY_ON_READY = 2; // as GeneralPlayer: load, then play() on MEDIA_READY

export default function CleoVideoBackground({ mediaId, opacity = 1 }) {
  const elRef = useRef(null);

  useEffect(() => {
    if (!mediaId || !CPL_URL || !elRef.current) return undefined;
    let player = null;
    let gone = false;

    loadScript(CPL_URL)
      .then(() => {
        const { CleoPlayer } = window;
        if (gone || !CleoPlayer) return;
        player = new CleoPlayer({
          id: mediaId,
          el: elRef.current,
          autoPlay: AUTOPLAY_ON_READY,
          apiKey: API_KEY,
          mute: true,
          controls: false,
          skipModule: { skipAd: true, skipAnalytics: true },
          callbacks: {
            onPlayerConfig: () => ({ player: { bgPause: false, loop: true, fgResume: false } }),
          },
          internals: { mediaBase: `${MEDIA_BASE}/` },
        }, (error) => {
          if (error) console.error('CleoPlayer could not play media', mediaId, error);
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
  }, [mediaId]);

  return <div ref={elRef} className="widget-video-bg widget-cleo-bg" style={{ opacity }} />;
}
