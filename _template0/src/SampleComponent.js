import autobind from 'autobind-decorator';
import Game from './frame/Game';



@autobind
class Sample extends Game {
  constructor(config) {
    super(config);
  }

  handleKeydown(event) {
  }


  render(context) {
    context.fillStyle = 'dimgrey';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  }

  physics_tick(tick_size) {
  }
}

export default Sample;
