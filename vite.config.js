import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [react(), mkcert()],
  // Same local address as slike-frontend: the b2b backend only accepts
  // browser calls (and sends the login cookie) for allowed origins like
  // https://local.sli.ke:8443. Needs "127.0.0.1 local.sli.ke" in /etc/hosts.
  server: {
    host: 'local.sli.ke',
    port: 8443,
    strictPort: true, // any other port would be refused by the backend
  },
});
