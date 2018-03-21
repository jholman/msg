import {autobind, Game, Geom} from './frame/Frame';

import maria_levels from './maria_levels.js';
import Overlay from './Overlay';
import LevelBoard from './LevelBoard';

function levelTidy(level) {
  for (var block_id in level.blocks) {
    var block = level.blocks[block_id];
    var aabb = new Geom.Aabb(block);
    aabb.color = block.color;
    level.blocks[block_id] = aabb;
  }
  return level;
}

var levels = {};
for (var level of maria_levels) { levels[level.id] = levelTidy(level); }

@autobind
class Maria extends Game {
  constructor(config) {
    super(config);

    this.context.canvas.width = 800;
    this.context.canvas.height = 600;

    this.overlay = new Overlay({onLevelChange: this.setLevel});
    this.main = new LevelBoard({levelData: levels[1]});
  }

  handleKey(event) {
    var gotConsumed = this.overlay.handleKey(event) || this.main.handleKey(event);
    if (gotConsumed) {
      event.preventDefault();
    } else {
      console.log("unconsumed keypress:", event);
    }
    return;
  }

  setLevel(levelId) {
    if (levels[levelId]) {
      this.main = new LevelBoard(levels[levelId]);
    } else {
      console.log("failed to load level", levelId, "; no such level known");
    }
  }

  render(context) {
    context.fillStyle = 'magenta';      // the intention is that main and overlay will completely hide this
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    this.main.render(context);
    this.overlay.render(context);
  }

  physics_tick(tick_size) {
    this.main.physics_tick(tick_size);
  }
}

export default Maria;
