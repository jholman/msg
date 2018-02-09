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
  },
  S: {
    elements: [
      [[ 0,  0], [ 0, -1], [ 1, -1], [-1,  0] ],
      [[ 0,  0], [ 0, -1], [ 1,  0], [ 1,  1] ],
    ]
  },
  Z: {
    elements: [
      [[ 0,  0], [ 0, -1], [-1, -1], [ 1,  0] ],
      [[ 0,  0], [ 0, -1], [-1,  0], [-1,  1] ],
    ]
  },

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
  }

  getExtremeCoords(rotQty = 0) {
    var elements = this.getElementsRotted(rotQty);
    var xs = elements.map(e => e[0]);
    var ys = elements.map(e => e[1]);
    return {
      xmin: Math.min(...xs),
      xmax: Math.max(...xs),
      ymin: Math.min(...ys),
      ymax: Math.max(...ys),
    };

  }

  getElementsRotted(rotQty = 0) {
    var inc = Math.round(rotQty);
    var angle = this.angle + inc + 100;
    var elementsArray = pieceData[this.name].elements;
    return elementsArray[angle % elementsArray.length].map(([x, y]) => [x + this.loc[0], y + this.loc[1]]);
  }

  rot(rotQty) {
    var inc = Math.round(rotQty);
    this.angle = (this.angle + inc + 4) % 4;
  }

  render(context, xoff, yoff, scale, ymin = -Infinity) {
    context.fillStyle = this.color;
    for (var cell of this.getElements()) {
      //console.log("painting", cell);
      var [x, y] = cell;
      if (y < ymin) continue;    // off the top of the playarea
      context.fillRect(xoff + x*scale + 1, yoff + y*scale + 1, scale - 2, scale - 2);
    }
  }
}



export default Piece;
