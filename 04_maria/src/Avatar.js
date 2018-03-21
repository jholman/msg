import * as jf from './frame/Frame';

// function min_by_mag(...args) {
//   return args.reduce((acc, elt) => Math.abs(acc) < Math.abs(elt) ? acc : elt, Infinity);
// }

@jf.autobind
class Avatar {
  constructor(config) {
    this.box = config.box || new jf.Geom.Aabb({
      left: -30,
      right: 30,
      top: 80,
      bottom: 0,
    });
    this.loc = config.loc || { x: 0, y: 0 };
    this.vel = config.vel || { x: 0, y: 0 };
    this.acc = {x: 0, y: 0};
    this.heldKeys = {
      left: false,
      right: false,
      up: false,
      down: false,
    };
    this.moveRules = {
      fullSpeed: 350,
      overSpeed: 550,
      fullAccel: 300,
      fullBrake: 800,
      takeoffDuration: 100,
      jumpAccel: 2000,
    }
    this.moveContext = {
      sinceStanding: 0,
    }
  }

  handleKey(event) {
    if (event.type !== 'keydown' && event.type !== 'keyup') return false;
    var heldVal = event.type === 'keydown';
    var keyMapping = {
      KeyA: () => { this.heldKeys.left  = heldVal },
      KeyD: () => { this.heldKeys.right = heldVal },
      KeyW: () => { this.heldKeys.up    = heldVal },
      KeyS: () => { this.heldKeys.down  = heldVal },
      Space: () => { this.heldKeys.space = heldVal },
    };
    var f = keyMapping[event.code];
    if (f){
      f(event);
      return true;
    }
    return false;
  }

  render(context, offset) {
    // draw the player (as a black box)
    context.fillStyle = 'black';
    context.fillRect(
      this.loc.x + this.box.left + offset.x,
      context.canvas.height - (this.loc.y + this.box.top + offset.y),
      this.box.width,
      this.box.height
    );
  }

  move_mode_walking(tick_size) {
    // we'll work this whole time as if we're headed rightward
    var mirrored = this.vel.x < 0 ? -1 : 1;
    var vel = this.vel.x * mirrored;

    var goalVelX = 0;
    if (this.heldKeys.left)  { goalVelX -= this.moveRules.fullSpeed; }
    if (this.heldKeys.right) { goalVelX += this.moveRules.fullSpeed; }
    goalVelX *= mirrored;

    // if we're overspeed, bump up the goal velocity
    if (0 < goalVelX && goalVelX < vel) {
      goalVelX = jf.clamp(this.moveRules.fullSpeed, vel, this.moveRules.overSpeed);
    }

    var acc = 0;
    if (goalVelX < 0) {
      acc = - this.moveRules.fullBrake;
    } else if (goalVelX === 0) {
      // braking toward zero
      acc = - Math.min(vel / (tick_size/1000), this.moveRules.fullAccel);
    } else if (goalVelX > vel) {
      // speeding up
      acc = Math.min((goalVelX - vel) / (tick_size/1000), this.moveRules.fullAccel);
    } else {
      // slowing down or reversing direction
      acc = -this.moveRules.fullAccel;
    }

    this.acc.x = acc * mirrored;
    this.vel.x += this.acc.x * tick_size/1000;
    this.loc.x += this.vel.x * tick_size/1000;


    this.moveContext.sinceStanding = 0;   // this is temporary, in lieu of collision-detection code

    if (this.heldKeys.space && this.moveContext.sinceStanding < this.moveRules.takeoffDuration) {
      this.acc.y = this.moveRules.jumpAccel;
    } else {
      this.acc.y = -this.moveRules.jumpAccel;
    }

    this.vel.y += this.acc.y * tick_size/1000;
    this.loc.y += this.vel.y * tick_size/1000;
    if (this.loc.y < 100) {
      this.vel.y = 0;
      this.loc.y = 100;
    }


  }


  physics_tick(tick_size) {
    this.move_mode_walking(tick_size);
    this.clog_status();
  }

  clog_status() {
    return;
    var padding = n => n ? padding(n-1) + ' ' : '';
    var leftpad = (s="", n) => padding((n||10)-s.length) + s;
    console.log(
      "m", leftpad(this.mirrored, 3),
      "ACC",
      "x:", leftpad(this.acc.x.toFixed(2)),
    );
  }
}


export default Avatar;

