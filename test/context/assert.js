
'use strict';

const context = require('../context');
const assert = require('assert');

describe('ctx.assert(value, status)', function(){
  it('should throw an error', function(){
    const ctx = context();

    try {
      ctx.assert(false, 404);
      throw new Error('asdf');
    } catch (err) {
      assert(404 == err.status);
      assert(err.expose);
    }
  })
})
