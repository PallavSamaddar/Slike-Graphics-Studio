import React from 'react';
import ReactDOM from 'react-dom/client';
import PlayerView from './output/PlayerView.jsx';
import './styles/app.css';

const isPlayer = window.location.hash.startsWith('#/player');
if (isPlayer) document.body.classList.add('player-body');

const render = (page) =>
  ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>{page}</React.StrictMode>);
if (isPlayer) render(<PlayerView hash={window.location.hash} />);
else Promise.all([import('./App.jsx'), import('./styles/index.js')]).then(([{ default: App }]) => render(<App />));
