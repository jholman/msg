import autobind from 'autobind-decorator';

import Menu from './Menu.js';

@autobind
class Overlay {
  constructor(config) {
    this.menu = new Menu({onLevelChange: config.onLevelChange});
  }

  handleKey(event) {
    var gotConsumed = this.menu.handleKey(event);
    return gotConsumed;
  }

  render(context) {
    // this is where score shit will go later
    this.menu.render(context);
  }
}


export default Overlay;
