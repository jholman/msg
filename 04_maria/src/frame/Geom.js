import autobind from 'autobind-decorator';

import {Vec} from '../la/la.js';


// Everything in this file will assume a right-hand coordinate system, with 0,0 at the bottom-left of the screen. This
// will mean that y-coordinates (but not heights) will need inverting to draw to canvas.  It will also mean that, if
// extended to 3d, the positive Z-axis will point out of the screen.
//
// Functions should be named according to the following convention: verbArgumentArgument.  All functions are 2d so far.
//
// Supported verbs so far:
//  * collide: after the two arguments, takes two optional vectors.  Each defaults to the zero vector.  The first
//        applies to the first argument, the second to the second.  Returns the smallest (closest to zero) scalar
//        such that adding the scaled first vector to the first argument, and the scaled second vector to the second
//        argument, would result in an overlap.
//  * intersect: takes two arguments, both of which should define an enclosed region.  Returns a representation of the
//        region enclosed by the intersection of these sets (i.e. those points that are within both of the arguments).
//        Some individual functions return a single region, or undefined if no region exists.  Other functions return
//        an array of regions (empty if no regions exist).



@autobind
class Aabb {
  constructor(params) {
    if (params.left !== undefined && params.right !== undefined && params.width !== undefined) {
      throw new TypeError('x-dimension over-constrained');
    } else if (params.left !== undefined && params.right !== undefined) {
      this.left = params.left;
      this.right = params.right;
      this.width = params.right - params.left;
    } else if (params.left !== undefined && params.width !== undefined) {
      this.left = params.left;
      this.width = params.width;
      this.right = params.left + params.width;
    } else if (params.right !== undefined && params.width !== undefined) {
      this.right = params.right;
      this.width = params.width;
      this.left = params.right - params.width;
    } else {
      throw new TypeError('x-dimension under-constrained');
    }
    if (params.bottom !== undefined && params.top !== undefined && params.height !== undefined) {
      throw new TypeError('y-dimension over-constrained');
    } else if (params.bottom !== undefined && params.top !== undefined) {
      this.bottom = params.bottom;
      this.top = params.top;
      this.height = params.top - params.bottom;
    } else if (params.bottom !== undefined && params.height !== undefined) {
      this.bottom = params.bottom;
      this.height = params.height;
      this.top = params.bottom + params.height;
    } else if (params.top !== undefined && params.height !== undefined) {
      this.top = params.top;
      this.height = params.height;
      this.bottom = params.top - params.height;
    } else {
      throw new TypeError('y-dimension under-constrained');
    }
  }
  
  // TODO: maybe getters and setters or something?

}

function collidePointLine(pty, line, vector0 = {x:0, y:0}) {
  return undefined;
}

function collideAabbAabb(first, second, first_vec, second_vec) {
  first_vec = first_vec || Vec(0, 0);
  second_vec = second_vec || Vec(0, 0);


}

function intersectAabbAabb(alpha, beta) {
  var left = Math.max(alpha.left, beta.left);
  var right = Math.min(alpha.right, beta.right);
  var bottom = Math.max(alpha.bottom, beta.bottom);
  var top = Math.min(alpha.top, beta.top);
  var result = new Aabb({left, right, bottom, top});
  if (result.width <= 0 || result.height <= 0) return undefined;
  else return result;
}

export default {
  Aabb,
  collidePointLine,
  intersectAabbAabb,
}
