
'use strict';

let context = require('../context');
let assert = require('assert');

describe('ctx.assert(value, status)', function(){
  it('should throw an error', function(){
    let ctx = context();

    try {
      ctx.assert(false, 404);
      throw new Error('asdf');
    } catch (err) {
      assert(404 == err.status);
      assert(err.expose);
    }
  })
})
