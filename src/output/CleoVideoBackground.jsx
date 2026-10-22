import { useEffect, useRef } from 'react';
import loadScript from '../utils/loadScript.js';

const CPL_URL = import.meta.env.VITE_CPL_BASE_URL;
const API_KEY = import.meta.env.VITE_CPL_API_KEY;
const MEDIA_BASE = (import.meta.env.VITE_CPL_MEDIA_BASE || '').replace(/\/+$/, '');

const AUTOPLAY_ON_READY = 2; // as GeneralPlayer: load, then play() on MEDIA_READY

export default function CleoVideoBackground({ mediaId, opacity = 1, className = '' }) {
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

  return <div ref={elRef} className={'widget-video-bg widget-cleo-bg' + (className ? ' ' + className : '')} style={{ opacity }} />;
}
