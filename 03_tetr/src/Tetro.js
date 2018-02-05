import autobind from 'autobind-decorator';
import Game from './frame/Game';
import Field from './Field';

// https://fontlibrary.org/en/font/segment7         For score and shit


// Let's agree that blocks of the field will be 20x20, and thus the
//  field (at 10x20 blocks) will be 200 wide and 400 tall.
// Leaving 10% on the top and bottom each gives us a height of 500.
// A single-player experience is a 200-wide field, a 120-wide preview 
//  area, and 130 worth of gutters, bringing us to 450 wide.  For two
//  players, double that but knock off 50 of extra gutter, for 850.

@autobind
class Tetro extends Game {
  constructor(config) {
    super(config);
    this.context.canvas.height = 500;
    this.context.canvas.width = 850;
    this.p1field = new Field();
  }

  handleKeydown(event) {
    //console.log("aight", event.key, event.code, event.keyCode);
    var gonnaPrevent = true;
    var keyMapping = {
      KeyA: () => { this.p1field.tryMove([-1, 0]); },
      KeyD: () => { this.p1field.tryMove([1, 0]); },
      KeyW: () => { this.p1field.tryRot(1); },
      KeyS: () => { this.p1field.tryRot(-1); },
      KeyZ: () => { this.p1field.oneDrop(); },
      KeyX: () => { this.p1field.softDrop(); },
      KeyC: () => { this.p1field.hardDrop(); },
    };
    var noop = ()=>{ gonnaPrevent = false; }
    (keyMapping[event.code] || noop)();
    if (gonnaPrevent) { event.preventDefault(); }
  }


  render(context) {
    context.fillStyle = 'dimgrey';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    this.p1field.render(context, 50, 50);
    this.p1field.renderPreview(context, 280, 50);
    this.p1field.renderScore(context, 280, 200);
  }

  physics_tick(tick_size) {
    this.p1field.physics_tick(tick_size)
  }
}

export default Tetro;
