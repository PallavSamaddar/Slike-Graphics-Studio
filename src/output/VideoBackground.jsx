// Looping, muted, autoplaying video used as a widget background — the user's
// own uploaded motion-graphics footage instead of a CSS/SVG approximation.
export default function VideoBackground({ src, opacity = 1 }) {
  return (
    <video
      className="widget-video-bg"
      style={{ opacity }}
      src={src}
      autoPlay
      loop
      muted
      playsInline
    />
  );
}
