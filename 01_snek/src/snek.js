require('./styles/main.scss');

var lastPhysicsTick;
var physicsTickSize_ms = 10;
var graphics;
var gameState = {
  snake: {
    pos: undefined,
    movePeriod_ms: undefined,
    lastMoved: undefined,
    heading: undefined,
    targetLength: undefined,
  },
  score: undefined,
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

function handleKey(event) {
  //console.log(event.key, event.code, event.keyCode);
  var gonnaPrevent = true;
  var keyMapping = {
    KeyW: () => { if (gameState.snake.heading !== 2) gameState.snake.heading = 0; },
    KeyD: () => { if (gameState.snake.heading !== 3) gameState.snake.heading = 1; },
    KeyS: () => { if (gameState.snake.heading !== 0) gameState.snake.heading = 2; },
    KeyA: () => { if (gameState.snake.heading !== 1) gameState.snake.heading = 3; },
  };
  var noop = ()=>{ gonnaPrevent = false; }
  (keyMapping[event.code] || noop)();
  if (gonnaPrevent) { event.preventDefault(); }
}

function physics() {
  if (!gameState.snake.lastMoved) {
    gameState.snake.lastMoved = Date.now();
    setTimeout(physics, gameState.snake.movePeriod_ms);
    return;
  }

  var snake = gameState.snake;
  var now = Date.now();
  var ms_to_process = now - snake.lastMoved;
  while (ms_to_process > snake.movePeriod_ms) {
    var newHeadPos = [
      snake.pos[0][0] + moveVectors[snake.heading][0],
      snake.pos[0][1] + moveVectors[snake.heading][1]
    ];


    var collide = snake.pos
      .map(segment => segment.x === newHeadPos.x && segment.y === newHeadPos.y)
      .reduce((acc, next) => acc || next, false);

    if (collide) {
      gameState.collided = true;
      // TODO: working here
    } else {
      snake.pos.unshift(newHeadPos);
      if (snake.pos.length > snake.targetLength) {
        snake.pos.pop();
      }
    }

    gameState.dirty = true;
    ms_to_process -= snake.movePeriod_ms;
  }
  snake.lastMoved = now - ms_to_process;

  setTimeout(physics, snake.movePeriod_ms - ms_to_process);      // infinite recurse
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

function render() {
  if (!gameState.dirty) {
    requestAnimationFrame(render);
    return;
  }

  graphics.fillStyle = 'rgb(0, 0, 0)';
  graphics.fillRect(0, 0, graphics.canvas.width, graphics.canvas.height);

  var cell_width = graphics.canvas.width / config.dimensions[0];
  var cell_height = graphics.canvas.height / config.dimensions[1];
  var padding = 0;

  for (var i in gameState.snake.pos) {
    var j = gameState.snake.pos.length - i - 1;  // draw back-to-front
    var segment = gameState.snake.pos[j];
    var x = segment[0] * cell_width;
    var y = segment[1] * cell_height;
    graphics.fillStyle = getColor(j, gameState.snake.targetLength);
    graphics.fillRect(
        x + padding, 
        y + padding, 
        cell_width - 2*padding,
        cell_height - 2*padding
    );     // left, top, width, height
  }

  gameState.dirty = false;
  requestAnimationFrame(render);
}

function startSnake(config) {
  graphics = get2dContext(config.canvasElementId);
  gameState.snake = {
    pos: [config.start_pos.slice()],
    movePeriod_ms: 100,        // TODO: maybe should be Infinity until a key is pressed?
    heading: 0,                 // would be irrelevant if doing the Infinity-until-key-pressed
    lastMoved: Date.now(),
    targetLength: config.start_length,
  };
  gameState.score = 0;

  document.addEventListener("keydown", handleKey);
  physics();
  render();
}


var config = {
  canvasElementId: 'snek-canvas',
  dimensions: [100, 75],
  start_length: 55,
};
config.start_pos = [Math.floor(config.dimensions[0]/2), Math.floor(config.dimensions[1]/2)];




$(startSnake.bind(undefined, config));
