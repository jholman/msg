import autobind from 'autobind-decorator';
import Piece from './Piece';


function selectRandomFromArray(array) {
  var i = Math.floor(Math.random() * array.length);
  return array[i];
}

@autobind
class Piecemaker {
  constructor(strategy) {
    this.options = Piece.allOptions();
  }

  next() {
    return new Piece(
      selectRandomFromArray(this.options),
      selectRandomFromArray([0, 1, 2, 3]),
    );
  }
}

export default Piecemaker;
