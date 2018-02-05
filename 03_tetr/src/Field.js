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
    this.animationPreempt = undefined;
    this.untilGravity = 1000;
  }

  calcGravityInterval() {
    return 1000 / (this.score.level || 1);
  }

  gravityHappened() {
    this.untilGravity = this.calcGravityInterval();
  }

  physics_tick(tick_size) {
    this.untilGravity -= tick_size;
    //console.log(this.untilGravity);
    if (this.untilGravity < 0) {
      this.fall();
      this.gravityHappened();
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

    this.currPiece.render(context, xoff, yoff, cell_scale, 0);
  }

  renderPreview(context, xoff, yoff) {
    context.fillStyle = 'black';
    context.fillRect(xoff, yoff, cell_scale * 6, cell_scale * 6);
    var extrema = this.nextPiece.getExtremeCoords();
    var x_adjust = (extrema.xmin + extrema.xmax) / 2;
    var y_adjust = (extrema.ymin + extrema.ymax) / 2;
    console.log(JSON.stringify(extrema), x_adjust, y_adjust);
    this.nextPiece.render(context, xoff + (2.5 - x_adjust) * cell_scale, yoff + (2.5 - y_adjust) * cell_scale, cell_scale);
  }

  renderScore(context, xoff, yoff) {
    context.fillStyle = 'black';
    context.fillRect(xoff, yoff, 120, 80);
    var scoreDiv = document.getElementById("score");
    scoreDiv.innerHTML = JSON.stringify(this.score);
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

  applyScore(lines, dropDistance) {
    lines = lines || 0;
    this.score.points += lines * (100 + dropDistance);      // also got dropDistance*1 from the softDrop, I guess
    console.log("added some points:", lines * 100 + (lines + 1) * dropDistance, "(dd:", dropDistance, ")");
    if (lines) {
      this.score.lines += lines;
      this.score.level = Math.ceil(this.score.lines/10);
      console.log("cleared", lines, "lines!", JSON.stringify(this.score));
    }
  }

  // TODO: this should animate somehow
  clearCompleteRows(skipLinesForScoring) {
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
      this.applyScore(removeCount, skipLinesForScoring);
    }
  }

  advanceNextPiece(skipLinesForScoring) {
    for (var element of this.currPiece.getElements()) {
      this.deadField[key(element[0], element[1])] = this.currPiece.color;
    }
    this.clearCompleteRows(skipLinesForScoring);
    this.currPiece = this.nextPiece;
    this.currPiece.loc = [5, -1];
    this.nextPiece = this.piecemaker.next();
  }

  fall(skipLinesForScoring) {
    var didFall = this.oneDrop();
    if (!didFall) {
      this.advanceNextPiece(skipLinesForScoring || 0);
      this.gravityHappened();
    }
    return didFall;
  }

  oneDrop() {
    return this.tryMove([0, 1]);
  }

  softDrop() {
    var dropped = 0;
    while (true) {
      if (this.oneDrop()) {
        dropped++;
      } else {
        break;
      }
    }
    // If the player soft-drops, restart the gravity countdown, but ONLY if they
    //  piece actually fell some distance, because otherwise they could pause
    //  at the bottom by spamming the softdrop key
    if (dropped) {
      this.gravityHappened();
      this.applyScore(0, dropped);
    }
    return dropped;
  }

  hardDrop() {
    var dropped = this.softDrop();
    var completed = this.fall(dropped);
    return dropped;
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
