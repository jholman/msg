import * as jf from './frame/Frame';
import Avatar from './Avatar';

@jf.autobind
class LevelBoard {
  constructor(config) {
    this.levelData = config.levelData;
    this.avatar = new Avatar({
      loc: {
        x: config.levelData.avatar_start.x,
        y: config.levelData.avatar_start.y,
      },
      level: this,
    });
  }

  handleKey(event) {
    var gotConsumed = this.avatar.handleKey(event);
    return gotConsumed;
  }

  render(context) {

    var c_width = context.canvas.width;
    var c_height = context.canvas.height;
    var viewport_offset_x = context.canvas.width / 2;
    var viewport_offset_y = context.canvas.height / 2;

    // draw the sky
    context.fillStyle = this.levelData.background_color;
    context.fillRect(0, 0, c_width, c_height);

    var viewport = new jf.Geom.Aabb({
      left: jf.clamp(0, this.avatar.loc.x - viewport_offset_x, this.levelData.width - context.canvas.width),
      bottom: jf.clamp(0, this.avatar.loc.y - viewport_offset_y, this.levelData.height - context.canvas.height),
      width: c_width,
      height: c_height,
    });

    // draw the static parts of the level
    for (var block of this.levelData.blocks) {
      var visiblock = jf.Geom.intersectAabbAabb(block, viewport);
      if (visiblock) {
        context.fillStyle = block.color;
        context.fillRect(
            visiblock.left - viewport.left,
            c_height - (visiblock.top - viewport.bottom),
            visiblock.width,
            visiblock.height,
        );
      }
    }


    this.avatar.render(context, {x: -viewport.left, y: -viewport.bottom});

  }



  physics_tick(tick_size) {
    this.avatar.physics_tick(tick_size);
  }
}


export default LevelBoard;
