import autobind from 'autobind-decorator';

// maybe move to a graphics lib?
function get2dContext(canvas_id){
  var canvas = document.getElementById(canvas_id);
  if (!canvas){
    console.error("could not get canvas by id '" + canvas_id + "'");
  } else {
    var ctx = canvas.getContext("2d");
    if (!ctx){
      console.error("could not initalize 2d context for canvas");
    } else {
      return ctx;
    }
  }
}

function deepObjectAssign(target, varArgs) {
  // This function adapted from the shim at
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  assert(typeof target === 'object' && target !== null);
  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments[i];
    if (nextSource != null) { // Skip over if undefined or null
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          if (typeof nextSource[nextKey] === 'object' && nextSource[nextKey] !== null) {
            // Hilarious constructor-invokation to get prototype and properties all fixed up.
            // I dunno what this does on things other than Arrays, but maybe it works?
            if (typeof target[nextKey] == 'object' && 
                target[nextKey] !== null && 
                Object.getPrototypeOf(target[nextKey]) === Object.getPrototypeOf(nextSource[nextKey])   ) {
              var subtarget = target[nextKey];
            } else {
              var subtarget = new (Object.getPrototypeOf(nextSource[nextKey]).constructor)();
            }
            target[nextKey] = deepObjectAssign(subtarget, nextSource[nextKey]);
          } else {
            target[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
  }
  return target;
}


const defaultGameConfig = {
  physics: {
    tickSize_ms: 10
  }
};


@autobind
class Game {
  constructor(config) {
    this.config = deepObjectAssign({}, defaultGameConfig, config);

    this.context = get2dContext(config.targetDiv);
    if (!this.context) throw "giving up on being a Game";

    this.bookkeeping = {
      previousTick_ms: Date.now()
    }
  }


  _render() {
    this.physics();

    // how does rendering work in general?  just enumerate renderEntities in z-order or something?

    //requestAnimationFrame(this.render);
  }

  _physics() {
    var now = Date.now();
    if (!this.bookkeeping.previousTick_ms) {
      this.bookkeeping.previousTick_ms = now - this.config.physics.tickSize_ms;
    }
    while ((now - this.bookkeeping.previousTick_ms) > this.config.physics.tickSize_ms) {
      this.physics_tick(this.config.physics.tickSize_ms);

      gameState.dirty = true;
      this.bookkeeping.previousTick_ms += this.config.physics.tickSize_ms;
    }
  }

  physics_tick(tick_size) {
    // does nothing; override in child class
  }

  start() {
    requestAnimationFrame(this._render);
  }
}



export default Game;
