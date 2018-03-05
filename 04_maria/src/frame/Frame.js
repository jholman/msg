import autobind from 'autobind-decorator';
import Game from './Game.js';
import Geom from './Geom.js';

function clamp(min, input, max) {
  return Math.max(min, Math.min(input, max));
}


// TODO: sure wish that frame/fixclass.js was working, so I could include it here

export {
  autobind,
  clamp,
  Game,
  Geom,
}

