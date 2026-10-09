// Everything the studio wears, in load order: the UI kit, then the app's own layers.
// The #/player output loads none of this (see main.jsx).
import '../ui-kit/styles';
import './legacy-tokens.css';
import './studio.css';
