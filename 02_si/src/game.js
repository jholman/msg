require('./styles/main.scss');
var _ = require('lodash');

var lastPhysicsTick;
var physicsTickSize_ms = 10;
var graphics;
var gameState = {
  dirty: true,
};
var inputState = {};

var moveVectors = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

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

window.get2d = get2dContext;

function handleKey(event) {
  console.log("keyDown", event.key, event.code, event.keyCode);
  var gonnaPrevent = true;
  var keyMapping = {
  };
  var noop = ()=>{ gonnaPrevent = false; }
  (keyMapping[event.code] || noop)();
  if (gonnaPrevent) { event.preventDefault(); }
}

function physics() {
  if (!lastPhysicsTick) {
    lastPhysicsTick = Date.now();
    setTimeout(physics, physicsTickSize_ms);
    return;
  }

  var now = Date.now();
  var ms_to_process = now - lastPhysicsTick;

  while (now - lastPhysicsTick < physicsTickSize_ms) {

    // DO STUFF


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


function drawShip(ship) {
  var [x, y] = ship.pos;

  graphics.fillStyle = 'rgb(0, 255, 0)';
  graphics.beginPath();
  graphics.moveTo(...fixCoords(x + ship.shape_path[0][0], y + ship.shape_path[0][1]));
  for (var coord of ship.shape_path.slice(1)) {
    graphics.lineTo(...fixCoords(x + coord[0], y + coord[1]));
  }
  graphics.fill();
}

function calcCenterForCreep(i, j, swarm) {
  var spacing = [
    swarm.area[0] / swarm.number[0],
    swarm.area[1] / swarm.number[1],
  ]
  var first_spot = [        /// augh, this is wrong, but oh well
    swarm.pos[0] - swarm.area[0]/2.0 + spacing[0]/2.0,
    swarm.pos[1] + swarm.area[1]/2.0 - spacing[1]/2.0,
  ]
  var centerpoint = [
    first_spot[0] + i * spacing[0],
    first_spot[1] - j * spacing[1],
  ];
  return centerpoint;
}

function fillCenteredRect(centerpoint, dimensions) {
  var topLeft = fixCoords(centerpoint[0] - dimensions[0]/2, centerpoint[1] + dimensions[1]/2);
  var fixDim = fixCoords(...dimensions, false);
  graphics.fillRect(...topLeft, ...fixDim);
}

function drawSwarm(swarm) {

  // // this is dummy code to visualize the entire swarm region in white
  // graphics.fillStyle = 'rgb(222, 222, 222)';
  // fillCenteredRect(swarm.pos, swarm.area);

  graphics.fillStyle = 'rgb(255, 0, 0)';
  for (var i in _.range(swarm.number[0])) {
    for (var j in _.range(swarm.number[1])) {
      if (swarm.dead.has(i + ';' + j)) {
        continue;
      }
      var centerpoint = calcCenterForCreep(i, j, swarm);
      fillCenteredRect(centerpoint, swarm.creep_dim);
    }
  }
}

function render() {
  if (!gameState.dirty) {
    requestAnimationFrame(render);
    return;
  }

  graphics.fillStyle = 'rgb(0, 0, 0)';
  graphics.fillRect(0, 0, graphics.canvas.width, graphics.canvas.height);

  drawSwarm(gameState.swarm);
  drawShip(gameState.ship);

  gameState.dirty = false;
  requestAnimationFrame(render);
}

function startGame(config) {
  graphics = get2dContext(config.canvasElementId);
  gameState = {
    ship: {
      pos: [0.5, 0.05],
      shape_path: [[-0.02, -0.01], [0, 0.01], [0.02, -0.01]],
      shots: [],
    },
    swarm: {
      pos: [0.5, 0.75],
      number: [7, 4],
      area: [0.99, 0.49],
      dead: new Set(),
      shots: [],
      creep_dim: [0.04, 0.02],
    },
    dirty: true,
  };
  gameState.swarm.dead.add('1;1');

  document.addEventListener("keydown", handleKey);
  physics();
  render();
}


var config = {
  canvasElementId: 'game-canvas',
  dimensions: [100, 75],
  start_length: 55,
};




$(startGame.bind(undefined, config));
