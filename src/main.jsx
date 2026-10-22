import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/app.css';
import { inFrame } from './utils/frame.js';

const oldPlayer = window.location.hash.startsWith('#/player');
if (oldPlayer) window.location.replace(new URL(`player.html?${window.location.hash.split('?')[1] || ''}`, window.location.href).href);
else if (inFrame) document.documentElement.classList.add('in-frame');

const render = (page) =>
  ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>{page}</React.StrictMode>);
if (!oldPlayer) Promise.all([import('./App.jsx'), import('./styles/index.js')]).then(([{ default: App }]) => render(<App />));
