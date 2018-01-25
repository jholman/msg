require('./styles/main.scss');


import Tetr from './Tetr';

var t = new Tetr({
  targetDiv: 'game-canvas',
});
t.start();      // I feel this shouldn't be necessary

document.title = 'Tetr';


