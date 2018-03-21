import autobind from 'autobind-decorator';

function fixclass(Class) {
  var bound = autobind(Class);
  var denuded = (...args) => new bound(...args);
  return denuded;
}


/*
 * Okay, this approach is all wrong.
 * 
 * The minor problem is that autobind-decorator is side-effect-ful; it mutates the class in-place.  Which is nice, but
 * isn't how a decorator is supposed to work.
 *
 * The major problem is that denuded has the wrong prototype, or some crazy thing along these lines, so that subclasses
 * actually do nothing.  I don't yet understand why.
 *
 * I feel like I need to approach this problem afresh, cribbing from the sourcecode of autobind.
 *
 */

export default fixclass;
