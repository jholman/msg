import * as jf from './frame/Frame';

@jf.autobind
class LevelBoard {
  constructor(config) {
    // console.log(jf);
    this.levelData = config.levelData;
    this.avatarData = {
      box: new jf.Geom.Aabb({
        left: -30,
        right: 30,
        top: 80,
        bottom: 0,
      }),
      loc: {
        x: config.levelData.avatar_start.x,
        y: config.levelData.avatar_start.y,
      },
      vel: {
        x: 0,
        y: 0,
      },
    }

    this.report = false;
  }

  handleKeydown(event) {
    var keyMapping = {
      KeyI: () => { this.avatarData.loc.y += 50 },
      KeyJ: () => { this.avatarData.loc.x -= 50 },
      KeyK: () => { this.avatarData.loc.y -= 50 },
      KeyL: () => { this.avatarData.loc.x += 50 },
    };
    if (keyMapping[event.code]) {
      keyMapping[event.code]();
//      console.log(this.avatarData.loc);
//      this.report = true;
      return true;
    }
    return false;
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
      left: jf.clamp(0, this.avatarData.loc.x - viewport_offset_x, this.levelData.width - context.canvas.width),
      bottom: jf.clamp(0, this.avatarData.loc.y - viewport_offset_y, this.levelData.height - context.canvas.height),
      width: c_width,
      height: c_height,
    });

//    if (this.report) {
//      console.log("viewport:", JSON.stringify(viewport) );
//      console.log("avatar top:",  c_height - (this.avatarData.loc.y + this.avatarData.box.top - viewport.bottom));
//    }

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

    // draw the player (as a black box)
    context.fillStyle = 'black';
    context.fillRect( 
        this.avatarData.loc.x + this.avatarData.box.left - viewport.left,
        c_height - (this.avatarData.loc.y + this.avatarData.box.top - viewport.bottom),
        this.avatarData.box.width,
        this.avatarData.box.height
    );

    this.report = false;
  }
}


export default LevelBoard;
