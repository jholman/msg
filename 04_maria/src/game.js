require('./styles/main.scss');

import Maria from './Maria';

var maria = new Maria({
  targetDiv: 'game-canvas'
});
maria.start();

document.title = 'Super Maria Sisters';




/*
 *
//import fixclass from './frame/fixclass';

//import autobind from 'autobind-decorator';
function fixclass(Class) {
  var bound = autobind(Class);
  //var bound = Class;
  var denuded = bound;
  return (...args) => new denuded(...args);
}

class Q {
  constructor(i) {
    this.i = i;
  }

  get foo() {
    return this.i;
  }

  set bar(b) {
    this.i = b;
  }

  baz(b) {
    console.log("baz ONE", this);
    this.i = b;
  }
}

//var QF = fixclass(Q);
var QF = Q;

class P extends Q {
  baz(b) {
    console.log("baz NUMBER TWO", this);
    this.i = b;
  }

}

class P2 extends QF {
  baz(b) {
    console.log("baz THE THIRD COMING", this);
    this.i = b;
  }

}

//var PF = fixclass(P);
//var P2F = fixclass(P2);

var x = new P(5);
//console.log(Object.getPrototypeOf(q) == Object.getPrototypeOf();



// console.log(q.foo);
// q.bar = 999;
// console.log(q.foo);
// q.baz(69);
// console.log(q.foo);
var glurp = x.baz;
glurp(777);
console.log(x.foo);

*/



/*
function observed({kind, key, placement, descriptor, initializer}, get, set) {
  console.log(descriptor);
  // Create a new anonymous private name as a key for a class element
  let storage = 'asdfsdfsdfsdfsdf';
  let underlyingDescriptor = { enumerable: false, configurable: false, writable: true };
  let underlying = { kind, key: storage, placement, descriptor: underlyingDescriptor, initializer };
  return {
    kind: "method",
    key,
    placement,
    descriptor: {
      get() { get(this, storage); },
      set(value) {
        set(this, storage, value);
        console.log("SAW YOU:", value);
      },
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
    },
    extras: [underlying]
  };
};

class C {
  @observed x = 66;

  bar(v) {
    this.x = v;
  }
}

var c = new C();
console.log(c.x);
c.bar(999);
console.log(c.x);

*/
