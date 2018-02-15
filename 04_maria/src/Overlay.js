import autobind from 'autobind-decorator';

import Menu from './Menu.js';

@autobind
class Overlay {
  constructor(config) {
    this.menu = new Menu({onLevelChange: config.onLevelChange});
  }

  handleKeydown(event) {
    var gotConsumed = this.menu.handleKeydown(event);
    if (gotConsumed) {
      return true;
    } else {
      return false;;
    }
  }

  render(context) {
    // this is where score shit will go later
    this.menu.render(context);
  }
}


export default Overlay;
