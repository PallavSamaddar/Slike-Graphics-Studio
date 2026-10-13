import { useEffect, useState } from 'react';
import { getMe, goToLogin, toProfile } from '../services/user.js';

const LOADING = { name: '…', email: '', initials: '' };
const UNKNOWN = { name: 'Account', email: "Couldn't load your profile", initials: '?' };

// The signed-in person for the top bar, from user.me on load. Not signed in (401) sends
// the browser to the accounts login, as slike-frontend does; any other failure keeps the
// studio usable with a placeholder.
export default function useCurrentUser() {
  const [user, setUser] = useState(LOADING);

  useEffect(() => {
    getMe()
      .then((me) => setUser(toProfile(me)))
      .catch((err) => {
        if (err.isUnauthorized) goToLogin();
        else setUser(UNKNOWN);
      });
  }, []);

  return user;
}
