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

function handleKeyDown(event) {
  var gonnaPrevent = true;
  var keyMapping = {
  };
  var noop = ()=>{ gonnaPrevent = false; }
  (keyMapping[event.code] || noop)();
  if (gonnaPrevent) { event.preventDefault(); }
}

function handleMouseDown(event) {
  gameState.input.clicked += 1;
}

function handleMouseMove(event) {
  var x = event.clientX / graphics.canvas.width;
  var y = 1 - (event.clientY / graphics.canvas.height);
  gameState.input.mouseLoc = [x, y];
}

function findMinMaxICreeps(swarm) {
  var min = Infinity;
  var max = -Infinity;
  for (var [i, j] of getCreepIds(swarm)) {
    // TODO: now there's an easier way to do this
    min = Math.min(min, i);
    max = Math.max(max, i);
  }
  return [min, max];
}

function physics() {
  if (!lastPhysicsTick) {
    lastPhysicsTick = Date.now();
    setTimeout(physics, physicsTickSize_ms);
    return;
  }

  var ship = gameState.ship;
  var swarm = gameState.swarm;


  var now = Date.now();


  while ((now - lastPhysicsTick) > physicsTickSize_ms) {
    // Animate existing shots
    for (var shot of ship.shots) {
      shot[1] += ship.shot_vel * physicsTickSize_ms / 1000;
    }
    ship.shots = ship.shots.filter(shot => shot[1] < 1.0);

    // Now add new shot, if pending
    ship.pos[0] = gameState.input.mouseLoc[0];  // TODO; replace this with velocity/acceleration stuff, blah blah
    if (gameState.input.clicked > 0) {
      gameState.input.clicked -= 1;
      ship.shots.push(ship.pos.slice());
      // console.log(JSON.stringify(ship.shots));
    }

    var deadShots = new Set();
    for (var shot of ship.shots) {
      for (var [i, j] of getCreepIds(swarm)) {
        var center = calcCenterForCreep(i, j, swarm);
        var left = center[0] - swarm.creep_dim[0]/2.0;
        var right = center[0] + swarm.creep_dim[0]/2.0;
        var top = center[1] + swarm.creep_dim[1]/2.0;
        var bottom = center[1] - swarm.creep_dim[1]/2.0;
        if (shot[0] < right && shot[0] > left && (shot[1] + ship.shot_len) > bottom && shot[1] < top) {
          if (!deadShots.has(shot.toString()) && !swarm.dead.has(i+';'+j)) {
            deadShots.add(shot.toString());
            swarm.dead.add(i+';'+j);
          }
        }
      }
    }
    ship.shots = ship.shots.filter(shot => !deadShots.has(shot.toString()));

    if (swarm.dead.size === swarm.number[0]*swarm.number[1]) {
      swarm.dead = new Set();
      swarm.pos = gameState.reset.swarm_pos.slice();
      swarm.x_vel *= 1.1;     // ahahah speedup
      gameState.score += 1;
    }


    // Animate Swarm
    if (swarm.to_drop > 0) {
      var dropPerFrame = swarm.drop_vel * physicsTickSize_ms / 1000;
      var dropThisFrame = Math.min(swarm.to_drop, dropPerFrame);
      swarm.pos[1] -= dropThisFrame;
      swarm.to_drop -= (dropThisFrame + 0.00001);
    } else {
      swarm.pos[0] += swarm.x_vel * physicsTickSize_ms / 1000;
      var [min_i, max_i] = findMinMaxICreeps(swarm);
      var leftCreepCenter = calcCenterForCreep(min_i, 0, swarm);
      var rightCreepCenter = calcCenterForCreep(max_i, 0, swarm);
      if (leftCreepCenter[0] < swarm.creep_dim[0] || rightCreepCenter[0] > (1-swarm.creep_dim[0])) {
        swarm.x_vel *= -1;
        swarm.to_drop = swarm.drop_dist;
      }
    }

    gameState.dirty = true;
    lastPhysicsTick += physicsTickSize_ms;
  }

  setTimeout(physics, physicsTickSize_ms - (now - lastPhysicsTick));      // infinite recurse
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

  graphics.strokeStyle = 'rgb(0, 255, 0)';
  graphics.lineWidth = 2;
  for (var shot of ship.shots) {
    graphics.beginPath();
    graphics.moveTo(...fixCoords(...shot));
    graphics.lineTo(...fixCoords(shot[0], shot[1] + ship.shot_len));
    graphics.stroke();

  }
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

function getCreepIds(swarm) {
  var ans = [];     // TODO: make this into a generator?
  for (var i in _.range(swarm.number[0])) {
    for (var j in _.range(swarm.number[1])) {
      if (!swarm.dead.has(i + ';' + j)) {
        ans.push([i, j]);
      }
    }
  }
  return ans;
}

function drawSwarm(swarm) {
  // // this is dummy code to visualize the entire swarm region in white
  // graphics.fillStyle = 'rgb(222, 222, 222)';
  // fillCenteredRect(swarm.pos, swarm.area);

  graphics.fillStyle = 'rgb(255, 0, 0)';
  for (var [i, j] of getCreepIds(swarm)) {
    var centerpoint = calcCenterForCreep(i, j, swarm);
    fillCenteredRect(centerpoint, swarm.creep_dim);
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
  window.gameState = gameState = {
    input: {
      mouseLoc: [0.5, 0.5],
      clicked: 0,
    },
    ship: {
      pos: [0.5, 0.05],
      vel: [0, 0],
      shape_path: [[-0.02, -0.01], [0, 0.01], [0.02, -0.01]],
      shot_vel: 1.0,
      shot_len: 0.05,
      shots: [],
    },
    reset: {
      swarm_pos: [0.5, 0.85],
    },
    swarm: {
      pos: [0.5, 0.85],
      number: [11, 6],
      area: [0.7, 0.3],
      x_vel: 0.2,
      drop_dist: 0.07,
      drop_vel: 0.3,
      to_drop: 0,
      dead: new Set(),
      shots: [],
      creep_dim: [0.04, 0.02],
    },
    score: 0,
    dirty: true,
  };
  gameState.swarm.dead.add('1;1');

  document.addEventListener("keydown", handleKeyDown);
  graphics.canvas.addEventListener('mousemove', handleMouseMove);
  graphics.canvas.addEventListener('mousedown', handleMouseDown);
  physics();
  render();
}


var config = {
  canvasElementId: 'game-canvas',
  dimensions: [100, 75],
  start_length: 55,
};




$(startGame.bind(undefined, config));
