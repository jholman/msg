import autobind from 'autobind-decorator';
import Game from './frame/Game';

import Overlay from './Overlay';
import LevelBoard from './LevelBoard';


@autobind
class Maria extends Game {
  constructor(config) {
    super(config);

    this.context.canvas.width = 800;
    this.context.canvas.height = 600;

    this.overlay = new Overlay({onLevelChange: this.setLevel});
    this.main = new LevelBoard();
  }

  handleKeydown(event) {
    var gotConsumed = this.overlay.handleKeydown(event) || this.main.handleKeydown(event);
    if (gotConsumed) {
      event.preventDefault();
    } else {
      console.log("unconsumed keypress:", event.key, event.code, event.keyCode);
    }
    return;
  }

  setLevel(levelId) {
    // TODO: attempt to load a level, and if successful, replace this.main
  }

  render(context) {
    context.fillStyle = 'magenta';      // the intention is that main and overlay will completely hide this
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    //this.main.render(context);
    this.overlay.render(context);
  }

  physics_tick(tick_size) {

  }
}

export default Maria;
