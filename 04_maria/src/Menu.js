import autobind from 'autobind-decorator';

@autobind
class Menu {
  constructor(config) {
    this.bgcolor = 'rgba(0, 0, 0, 0.5)';
    this.options = {
      main: { 
        options: [
          {text: 'Resume', color: 'orange', newState: undefined, action: () => this.popMenuState()},
          {text: 'Full Screen', color: 'orange', action: () => this.tryToggleFullScreen()},
          {text: 'Change Level', color: 'orange', newState: 'levelSelect'},
        ]
      },
      levelSelect: {
        options: [
          {text: 'Back',    color: 'green', newState: undefined, action: () => this.popMenuState()},
          {text: 'Level 1', color: 'green', newState: undefined, action: () => this.levelChange(1)},
          {text: 'Level 2', color: 'green', newState: undefined, action: () => this.levelChange(2)},
          {text: 'Level 3', color: 'green', newState: undefined, action: () => this.levelChange(3)},
          {text: 'Level 4', color: 'green', newState: undefined, action: () => this.levelChange(4)},
        ]
      },
      
    };
    this.onLevelChange = config.onLevelChange;
    this.stateStack = [];
    this.stateIndexStack = [];
  }

  handleKeydown(event) {
    var keyMapping = {
      Escape: () => { this.popMenuState(); },
      Enter: () => {
        var menuEntry = this.options[this.state].options[this.stateIndex];
        if (menuEntry.newState) { this.pushMenuState(menuEntry.newState); }
        if (menuEntry.action) { menuEntry.action(); }
      },
      ArrowDown: () => { this.incStateIndex(); },
      ArrowUp: () => { this.incStateIndex(-1); },
    };
    if (!this.state) {
      if (event.code === 'Escape') {
        this.pushMenuState('main');
        return true;
      }
    } else if (keyMapping[event.code]) {
      keyMapping[event.code]();
      return true;
    }
    return false;
  }

  levelChange(newLevelId) {
    // TODO: do something, probably involving a callback from the Maria that owns this Overlay/Menu
  }

  tryToggleFullScreen() {
    // TODO: do something, probably involving a callback from the Maria that owns this Overlay/Menu
  }

  pushMenuState(newState, newIndex = 0) {
    if (newState === undefined) {
      console.log("uh wat");
    } else {
      this.stateStack.unshift(newState);
      this.stateIndexStack.unshift(newIndex);
    }
  }

  popMenuState() {
    return {
      state: this.stateStack.shift(),
      index: this.stateIndexStack.shift(),
    };
  }

  incStateIndex(increment = 1) {
    if (this.stateIndexStack.length) {
      this.stateIndexStack[0] = (
          (this.stateIndexStack[0] + increment + this.options[this.state].options.length) % 
          this.options[this.state].options.length
      );
    }
  }

  get state() {
    return this.stateStack[0];
  }

  get stateIndex() {
    return this.stateIndexStack[0];
  }

  peekMenuState() {
    return {
      state: this.stateStack[0],
      index: this.stateIndexStack[0],
    };
  }

  render(context) {
    var menu = this.options[this.state];
    if (menu === undefined) return;
    var midpoint = [context.canvas.width / 2, context.canvas.height / 2];
    var lineHeight = 40;
    var lineLength = lineHeight * 10;
    var menuDim = [ lineLength + 2 * lineHeight, lineHeight * 1.5 * (menu.options.length+1) ];
    var mainLeft = midpoint[0] - menuDim[0] / 2;
    var mainTop = midpoint[1] - menuDim[1] / 2;

    context.fillStyle = menu.bgcolor || this.bgcolor;
    context.fillRect(mainLeft, mainTop, menuDim[0], menuDim[1]);
    context.font = lineHeight + 'px sans-serif';

    for (var optIndex in menu.options) {
      var option = menu.options[optIndex];
      var itemTop = mainTop + lineHeight + (optIndex * lineHeight * 1.5);
      var itemLeft = mainLeft + lineHeight;
      if (optIndex === this.stateIndex.toString()) {
        context.fillStyle = 'white';
      } else {
        context.fillStyle = 'black';
      }
      context.fillText(option.text, itemLeft, itemTop + lineHeight, lineLength);
    }
  }
}


export default Menu;
