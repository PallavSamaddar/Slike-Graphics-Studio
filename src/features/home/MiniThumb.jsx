import { THUMBS } from '../templates/TemplateThumbs.jsx';
import { savedThumb } from './savedThumb.js';

export default function MiniThumb({ g, kind = g?.kind, t, className = '' }) {
  const Thumb = THUMBS[kind];
  const saved = g && Thumb ? savedThumb(g) : null;
  const tpl = saved ? saved.t : t;
  return (
    <span className={'mini-thumb' + (className ? ' ' + className : '')} aria-hidden="true">
      {Thumb && tpl && <span className="mini-thumb-in"><Thumb t={tpl} {...(saved?.text || {})} /></span>}
    </span>
  );
}
