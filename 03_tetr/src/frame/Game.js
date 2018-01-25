import autobind from 'autobind-decorator';


// maybe move to graphics lib
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

@autobind
class Game {
  constructor(config) {
    this.config = config;
    this.context = get2dContext(config.targetDiv);
    this.lastPhysicsTick = Date.now()
    if (!this.context) throw "giving up on being a Game";
  }


  render() {
    console.log(this.lastPhysicsTick);

    //requestAnimationFrame(this.render);
  }

  physics() {
    if (!this.lastPhysicsTick) {
      lastPhysicsTick = Date.now() - physicsTickSize_ms;
    }

    var now = Date.now();


    while ((now - lastPhysicsTick) > physicsTickSize_ms) {

      gameState.dirty = true;
      lastPhysicsTick += physicsTickSize_ms;
    }
  }

  start() {
    requestAnimationFrame(this.render);
  }
}



export default Game;
