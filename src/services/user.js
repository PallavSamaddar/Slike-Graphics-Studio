// The signed-in person and the Slike accounts site, as slike-frontend does it:
// user.me for the profile, accounts /me to view it, accounts /logout to leave,
// and the accounts login (with ?redirect= back here) when not signed in.
import { callRpc } from './rpc.js';

const ACCOUNTS = import.meta.env.VITE_ACCOUNTS;
const LOGOUT_URL = import.meta.env.VITE_LOGOUT_URL;

let mePromise = null;

// user.me's result, unwrapped the same way slike-frontend's GetMeApi does. Asked once per
// page — the top bar and the upload SDK (its auth token) share it; a failure is asked again.
export function getMe() {
  mePromise ??= callRpc('user.me').then((res) => {
    const user = res?.data?.result ?? res?.data ?? res;
    if (!user || !Object.keys(user).length) throw new Error('No user found');
    return user;
  }).catch((err) => {
    mePromise = null;
    throw err;
  });
  return mePromise;
}

// The top bar's profile: { name, email, initials }.
export function toProfile(user) {
  const name = user.display_name || user.name || user.username || user.email || '';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  return { name, email: user.email || '', initials: initials || '?' };
}

// Sends the browser to the accounts login, coming back to this page after.
export function goToLogin() {
  if (!ACCOUNTS) return;
  window.location.href = `${ACCOUNTS}?redirect=${encodeURIComponent(window.location.href)}`;
}

export function openProfile() {
  if (ACCOUNTS) window.open(`${ACCOUNTS}/me`, '_blank', 'noopener');
}

export function logOut() {
  if (LOGOUT_URL) window.location.href = `${LOGOUT_URL}?redirect=${encodeURIComponent(window.location.origin)}`;
}
