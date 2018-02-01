require('./styles/main.scss');


import Tetro from './Tetro';

var t = new Tetro({
  targetDiv: 'game-canvas',
});
t.start();      // I feel this shouldn't be necessary, but oh well

document.title = 'Tetro';


