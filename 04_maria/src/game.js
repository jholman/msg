require('./styles/main.scss');

import Maria from './Maria';

var maria = new Maria({
  targetDiv: 'game-canvas'
});
maria.start();

document.title = 'Super Maria Sisters';

