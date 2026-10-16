// Tells this browser's open players (another tab, e.g. one from "Open URL") the moment a
// graphic goes on or off air, so they read it again at once instead of on their next poll.
// Players on other devices still catch up on their own poll.
const CHANNEL = 'graphic-air';

export function announceAirChange(id) {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage({ id });
    channel.close();
  } catch { /* no BroadcastChannel — players catch up on their poll */ }
}

export function onAirChange(id, fn) {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e) => { if (e.data?.id === id) fn(); };
    return () => channel.close();
  } catch {
    return () => {};
  }
}
