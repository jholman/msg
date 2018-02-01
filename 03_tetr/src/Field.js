import autobind from 'autobind-decorator';
import Piece from './Piece';
import Piecemaker from './Piecemaker';

const cell_scale = 20;
const WIDTH = 10;
const HEIGHT = 20;

function key(x, y) {
  return x + ';' + y;
}

@autobind
class Field {
  constructor() {
    this.piecemaker = new Piecemaker();
    this.currPiece = this.piecemaker.next();
    this.currPiece.loc = [5, -1];
    this.nextPiece = this.piecemaker.next();
    this.deadField = {};
    this.score = {
      level: 1,
      points: 0,
      lines: 0,
    }
    this.untilGravity = 1000;
  }

  calcGravityInterval() {
    return 1000 / (this.score.level || 1);
  }

  physics_tick(tick_size) {
    this.untilGravity -= tick_size;
    if (this.untilGravity < 0) {
      this.fall();
      this.untilGravity = this.calcGravityInterval();
    }
  }

  render(context, xoff, yoff) {
    context.fillStyle = 'black';
    context.fillRect(xoff, yoff, cell_scale * WIDTH, cell_scale * HEIGHT);

    for (var cell in this.deadField) {
      if (this.deadField[cell]) {
        //console.log("deadcell", cell);
        context.fillStyle = this.deadField[cell];
        var [x, y] = cell.split(';');
        context.fillRect(xoff + x * cell_scale, yoff + y * cell_scale, cell_scale, cell_scale);
      }
    }

    this.currPiece.render(context, xoff, yoff, cell_scale);
  }

  renderPreview(context, xoff, yoff) {
    context.fillStyle = 'black';
    context.fillRect(xoff, yoff, cell_scale * 6, cell_scale * 6);
    this.nextPiece.render(context, xoff + 3 * cell_scale, yoff + 3 * cell_scale, cell_scale);     // TODO: auto-center every piece
  }

  compactFromLine(y) {
    //console.log("compacting from line", y);
    //console.log("deadField:", JSON.stringify(this.deadField));
    for (var y of _.range(y, 0, -1)) {
      //console.log("overwrite line", y, "with line", y-1);
      for (var x in _.range(10)) {
        if (this.deadField[key(x, y-1)]) {
          this.deadField[key(x, y)] = this.deadField[key(x, y-1)]
        } else {
          delete this.deadField[key(x, y)];
        }
      }
    }
    for (var x in _.range(10)) {
      delete this.deadField[key(x, 0)];
    }
    //console.log("deadField:", JSON.stringify(this.deadField));
  }

  scoreLines(n) {
    console.log("cleared", n, "lines!");
  }

  // TODO: this should animate somehow
  clearCompleteRows() {
    var removeCount = 0;
    for (var y in _.range(20)) {
      var gap = false;
      for (var x in _.range(10)) {
        if (!this.deadField[key(x, y)]) {
          gap = true;
          break;
        }
      }
      if (!gap) {
        for (var x in _.range(10)) {
          delete this.deadField[key(x, y)];
        }
        this.compactFromLine(y);
        removeCount++;
      }
    }
    if (removeCount) {
      this.scoreLines(removeCount);
    }
  }

  fall() {
    var didFall = this.oneDrop();
    if (!didFall) {
      for (var element of this.currPiece.getElements()) {
        this.deadField[key(element[0], element[1])] = this.currPiece.color;
      }
      this.clearCompleteRows();
      this.currPiece = this.nextPiece;
      this.currPiece.loc = [5, -1];
      this.nextPiece = this.piecemaker.next();
    }
    return didFall;
  }

  oneDrop() {
    return this.tryMove([0, 1]);
  }

  softDrop() {
    while (this.oneDrop()) ;
  }

  hardDrop() {
    this.softDrop();
    this.fall();
  }

  tryNewPosition(elements, vec) {
    if (!vec) {
      vec = [0, 0];
    }
    for (var elt of elements) {
      var newX = elt[0] + vec[0];
      var newY = elt[1] + vec[1];
      //console.log(newX, newY);
      if ( newX < 0 || newX >= WIDTH || newY >= HEIGHT || this.deadField[`${newX};${newY}`]) {
        return false;
      }
    }
    return true;
  }

  tryMove(vec) {
    var elements = this.currPiece.getElements();
    if (this.tryNewPosition(elements, vec)) {
      this.currPiece.loc[0] += vec[0];
      this.currPiece.loc[1] += vec[1];
      return true;
    } else {
      return false;
    }
  }

  tryRot(dir) {
    var elements = this.currPiece.getElementsRotted(dir);
    if (this.tryNewPosition(elements)) {
      this.currPiece.rot(dir);
      return true;
    } else {
      return false;
    }
  }

}

export default Field;
