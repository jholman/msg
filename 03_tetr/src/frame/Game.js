import autobind from 'autobind-decorator';

function onReady(callback){
  // stolen from some StackOverflow bullshit

  // in case the document is already rendered
  if (document.readyState!='loading') callback();
  // modern browsers
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
  // IE <= 8
  else document.attachEvent('onreadystatechange', function(){
      if (document.readyState=='complete') callback();
  });
}

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
  //assert(typeof target === 'object' && target !== null);
  if (typeof target !== 'object' || target === null) {
    throw new ArgumentError();
  }
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

  }


  fixCoords(x, y) {
    //var y = invertY ? 1-y : y;
    return [
      x * this.context.canvas.width,
      y * this.context.canvas.height
    ];
  }

  _render() {
    this._physics();
    this.render(this.context);

    // how does rendering work in general?  just enumerate renderEntities in z-order or something?

    requestAnimationFrame(this._render);
  }

  _physics() {
    var now = Date.now();
    if (!this.bookkeeping.previousTick_ms) {
      this.bookkeeping.previousTick_ms = now - this.config.physics.tickSize_ms;
    }
    while ((now - this.bookkeeping.previousTick_ms) > this.config.physics.tickSize_ms) {
      this.physics_tick(this.config.physics.tickSize_ms);
      this.bookkeeping.previousTick_ms += this.config.physics.tickSize_ms;
    }
  }

  render() {}                       /* abstract method for child-classes to override */
  physics_tick(tick_size) {}        /* abstract method for child-classes to override */
  handleKeydown(event) {}           /* abstract method for child-classes to override */


  start() {
    this.bookkeeping = {
      previousTick_ms: Date.now()
    }
    // TODO: maybe fullscreen?  Maybe a button to fullscreen?  element.requestFullscreen and friends.

    //this.context.canvas.setAttribute("tabindex", 1);  // to enable focus and thus keydown listening
    //this.context.canvas.addEventListener('keydown', this.handleKeydown);
    //this.context.canvas.addEventListener('focus', ()=>{console.log("sure");});
    document.addEventListener('keydown', this.handleKeydown);
    requestAnimationFrame(this._render);
  }
}



export default Game;
