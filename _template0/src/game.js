require('./styles/main.scss');

var lastPhysicsTick;
var physicsTickSize_ms = 10;
var graphics;
var gameState;

function get2dContext(canvas_id){
  var canvas = document.getElementById(canvas_id);
  if (!canvas){
    console.error("could not get canvas by id " + canvas_id);
  } else {
    var ctx = canvas.getContext("2d");
    if (!ctx){
      console.error("could not initalize 2d context for canvas");
    } else {
      return ctx;
    }
  }
}

function handleKeyDown(event) {
  //console.log("keyown", event.key, event.code, event.keyCode);
  var gonnaPrevent = true;
  var keyMapping = {
  };
  var noop = ()=>{ gonnaPrevent = false; }
  (keyMapping[event.code] || noop)();
  if (gonnaPrevent) { event.preventDefault(); }
}

function handleMouseDown(event) {
}

function handleMouseMove(event) {
  // console.log("mousemove", event.clientX, event.clientY);
}


function physics() {
  if (!lastPhysicsTick) {
    lastPhysicsTick = Date.now();
    setTimeout(physics, physicsTickSize_ms);
    return;
  }

  var now = Date.now();


  while ((now - lastPhysicsTick) > physicsTickSize_ms) {

    gameState.dirty = true;
    lastPhysicsTick += physicsTickSize_ms;
  }

  setTimeout(physics, physicsTickSize_ms - lastPhysicsTick);      // infinite recurse
}


function getColor(i, n) {
  if (n < 2) {
    return 'rgb(255, 0, 0)';
  }
  var rearness = i/(n - 1);
  var redness = Math.floor(255 * (1 - rearness));
  var blueness = Math.floor(255 * rearness);
  return `rgb(${redness}, 0, ${blueness})`;
}

function fixCoords(x, y, invertY = true) {
  var y = invertY ? 1-y : y;
  return [
    x * graphics.canvas.width,
    y * graphics.canvas.height
  ];
}


function render() {
  if (!gameState.dirty) {
    requestAnimationFrame(render);
    return;
  }

  graphics.fillStyle = 'rgb(0, 0, 0)';
  graphics.fillRect(0, 0, graphics.canvas.width, graphics.canvas.height);

  // DO STUFF

  gameState.dirty = false;
  requestAnimationFrame(render);
}

function startGame(config) {
  graphics = get2dContext(config.canvasElementId);
  window.gameState = gameState = {
    },
    dirty: true,
  };

  document.addEventListener("keydown", handleKeyDown);
  graphics.canvas.addEventListener('mousemove', handleMouseMove);
  graphics.canvas.addEventListener('mousedown', handleMouseDown);
  physics();
  render();
}


var config = {
  canvasElementId: 'game-canvas',
};




$(startGame.bind(undefined, config));
