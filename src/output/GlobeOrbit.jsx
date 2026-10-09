import globeDots from '../assets/globe-dots.svg';

// "Earth Orbit" background — a dotted wireframe globe with elliptical orbit
// rings sweeping around it, echoing the broadcast motion-graphics look.
export default function GlobeOrbit() {
  return (
    <div className="globe-orbit">
      <div className="globe-orbit-ring globe-orbit-ring-1" />
      <div className="globe-orbit-ring globe-orbit-ring-2" />
      <div className="globe-orbit-ring globe-orbit-ring-3" />
      <img className="globe-orbit-sphere" src={globeDots} alt="" />
    </div>
  );
}
