import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import PlayerView from './output/PlayerView.jsx';
import './styles/app.css';

const isPlayer = window.location.hash.startsWith('#/player');
if (isPlayer) document.body.classList.add('player-body');

const render = () =>
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      {isPlayer ? <PlayerView hash={window.location.hash} /> : <App />}
    </React.StrictMode>
  );

// The studio wears the UI kit (src/ui-kit) and its own layout; the standalone #/player
// output does not load them, so what goes on air renders exactly as before.
if (isPlayer) render();
else import('./styles/index.js').then(render);
