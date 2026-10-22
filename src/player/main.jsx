import { createRoot } from 'react-dom/client';
import PlayerView from '../output/PlayerView.jsx';
import '../styles/app.css';

// The on-air page (player.html?id=…): only the graphic — no studio, no theme, no fonts it
// doesn't use. Its production build (vite.player.config.js) swaps React for Preact and keeps
// only the CSS rules the on-air code uses, so the page stays a few KB.
createRoot(document.getElementById('root')).render(<PlayerView hash={window.location.search} />);
