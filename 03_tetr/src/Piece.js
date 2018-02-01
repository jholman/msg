import autobind from 'autobind-decorator';


const pieceShapeDataRaw = {
  I: [
    ['*', '*', 'X', '*'],
    ['**X*'],
  ],
  L: [
    ['*.', 'X.', '**'],
    ['*X*', '*..'],
    ['**', '.X', '.*'],
    ['..*', '*X*'],
  ],
  T: [
    ['*X*', '.*.'],
    ['.*', '*X', '.*'],
    ['.*.', '*X*'],
    ['*.', 'X*', '*.'],
  ],
  O: [
    ['*X', '**']
  ],
  S: [
    ['.**', '*X.'],
    ['*.', 'X*', '.*'],
  ]
};
// TODO: generate or auto-generate J (from L) and Z (from S)

const pieceColors = {
  I: 'cyan',
  O: 'yellow',
  L: 'orange',
  J: 'blue',
  S: 'green',
  Z: 'red',
  T: 'purple',
}

function pieceDataCleanup(raw) {
}

//const pieceData = pieceDataCleanup(raw);

const pieceData = {
  O: { 
    elements: [
      [[-1, 0], [0, -1], [-1, -1], [0, 0]],
    ],
  },
  I: {
    elements: [
      [[0, 0], [-1, 0], [-2, 0], [1, 0]],
      [[0, 0], [0, -1], [0, -2], [0, 1]],
    ],
  },
  L: {
    elements: [
      [[ 0,  0], [ 0, -1], [ 0,  1], [ 1,  1] ],
      [[ 0,  0], [ 1,  0], [-1,  0], [-1,  1] ],
      [[ 0,  0], [ 0,  1], [ 0, -1], [-1, -1] ],
      [[ 0,  0], [-1,  0], [ 1,  0], [ 1, -1] ],
    ],
  },
  J: {
    elements: [
      [[ 0,  0], [ 0, -1], [ 0,  1], [-1,  1] ],
      [[ 0,  0], [-1,  0], [ 1,  0], [ 1,  1] ],
      [[ 0,  0], [ 0,  1], [ 0, -1], [ 1, -1] ],
      [[ 0,  0], [ 1,  0], [-1,  0], [-1, -1] ],
    ],
  },
  T: {
    elements: [
      [[ 0,  0], [ 0, -1], [ 0,  1], [-1,  0] ],
      [[ 0,  0], [ 0, -1], [-1,  0], [ 1,  0] ],
      [[ 0,  0], [ 0, -1], [ 0,  1], [ 1,  0] ],
      [[ 0,  0], [ 0,  1], [-1,  0], [ 1,  0] ],
    ],
  }

}



@autobind
class Piece {
  constructor(pieceName, angle) {
    this.name = pieceName;
    this.angle = angle;
    this.loc = [0, 0];
    this.color = pieceColors[this.name];
  }

  static allOptions() {
    return Object.keys(pieceData);
  }

//  static color(name) {
//    return pieceColors[name];
//  }

  getElements() {
    return this.getElementsRotted(0);
    //return pieceData[this.name].elements[this.angle];
  }

  getElementsRotted(dir) {
    var inc = Math.round(dir);
    var angle = this.angle + inc + 100;
    var elementsArray = pieceData[this.name].elements;
    return elementsArray[angle % elementsArray.length].map(([x, y]) => [x + this.loc[0], y + this.loc[1]]);
  }

  rot(dir) {
    var inc = dir > 0 ? 1 : -1;
    this.angle = (this.angle + inc + 4) % 4;
  }

  render(context, xoff, yoff, scale) {
    context.fillStyle = this.color;
    for (var cell of this.getElements()) {
      //console.log("painting", cell);
      context.fillRect(xoff + cell[0]*scale + 1, yoff + cell[1]*scale + 1, scale - 2, scale - 2);
    }
  }
}



export default Piece;
