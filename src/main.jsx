import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import PlayerView from './components/PlayerView.jsx';
import './styles.css';

const isPlayer = window.location.hash.startsWith('#/player');
if (isPlayer) document.body.classList.add('player-body');

const render = () =>
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      {isPlayer ? <PlayerView hash={window.location.hash} /> : <App />}
    </React.StrictMode>
  );

// The studio wears the Player Console design system; the standalone #/player output
// does not load it, so what goes on air renders exactly as before.
if (isPlayer) render();
else import('./ds/index.js').then(render);
