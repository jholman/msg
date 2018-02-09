import autobind from 'autobind-decorator';
import Piece from './Piece';
import Piecemaker from './Piecemaker';

const cell_scale = 20;
const WIDTH = 10;
const HEIGHT = 20;
const clearTime_ms = 600;

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
    this.physicsMode = 'gravity';
    this.untilGravity = 1000;
    this.clearingData = {
    };
  }

  calcGravityInterval() {
    return 1000 / (this.score.level || 1);
  }

  gravityHappened() {
    this.untilGravity = this.calcGravityInterval();
  }

  physics_tick(tick_size) {
    switch (this.physicsMode) {
      case 'gravity':
        this.untilGravity -= tick_size;
        if (this.untilGravity < 0) {
          this.fall();
          this.gravityHappened();
        }
        break;
      case 'lineclear':
        this.clearingData.timeleft -= tick_size;
        if (this.clearingData.timeleft < 0) {
          for (var y of this.clearingData.lines) {
            for (var x in _.range(10)) {
              delete this.deadField[key(x, y)];
            }
            this.compactFromLine(y);
          }
          this.physicsMode = 'gravity';
          this.gravityHappened();
        }
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
    // console.log(JSON.stringify(extrema), x_adjust, y_adjust);
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

  applyScore(lines, dropDistance, subdivided = false) {
    var scoreToAdd = dropDistance;
    lines = lines || 0;
    if (lines) {
      var sqLines = lines * lines;
      scoreToAdd += sqLines * (100 + dropDistance);
    }
    //console.log(`added <<${scoreToAdd}>> points (l: ${lines}, dd: ${dropDistance})`);
    this.score.points += scoreToAdd;
    this.score.lines += lines;
    this.score.level = Math.ceil(this.score.lines/10);
  }

  clearCompleteRows(skipLinesForScoring) {
    var linesToClear = [];
    for (var y in _.range(20)) {
      var gap = false;
      for (var x in _.range(10)) {
        if (!this.deadField[key(x, y)]) {
          gap = true;
          break;
        }
      }
      if (!gap) {
        linesToClear.push(y);
      }
    }
    if (linesToClear.length) {
      this.physicsMode = 'lineclear';
      for (var y of linesToClear) {
        for (var x in _.range(10)) {
          this.deadField[key(x, y)] = 'white';
        }
      }
      this.clearingData = {
        timeleft: clearTime_ms,
        lines: linesToClear,
      };
    }
    this.applyScore(linesToClear.length, skipLinesForScoring, true);
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

  fall(dropDistanceForScoring = 0) {      // called by gravity, or by hardDrop, or by oneDrop
    var didFall = this.tryMove([0, 1]);
    if (!didFall) {
      this.advanceNextPiece(dropDistanceForScoring);
      this.gravityHappened();
    }
    return didFall;
  }

  oneDrop() {             // pressable key
    return this.fall(0);
  }

  multiDrop() {             // pressable key
    var dropped = 0;
    while (true) {
      if (this.tryMove([0, 1])) {
        dropped++;
      } else {
        break;
      }
    }
    return dropped;
  }

  softDrop() {              // pressable key
    // If the player soft-drops, restart the gravity countdown, but ONLY if they
    //  piece actually fell some distance, because otherwise they could pause
    //  at the bottom by spamming the softdrop key
    var dropped = this.multiDrop();
    if (dropped) {
      this.gravityHappened();
      this.applyScore(0, dropped);
    }
    return dropped;
  }

  hardDrop() {
    var dropped = this.multiDrop();
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
