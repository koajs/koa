
'use strict';

const prototype = require('../../lib/context');
const assert = require('assert');
const util = require('util');
const context = require('../helpers/context');

describe('ctx.inspect()', () => {
  it('should return a json representation', () => {
    const ctx = context();
    const toJSON = ctx.toJSON(ctx);

    assert.deepEqual(toJSON, ctx.inspect());
    assert.deepEqual(util.inspect(toJSON), util.inspect(ctx));
  });

  // console.log(require.cache) will call prototype.inspect()
  it('should not crash when called on the prototype', () => {
    assert.deepEqual(prototype, prototype.inspect());
    assert.deepEqual(util.inspect(prototype.inspect()), util.inspect(prototype));
  });
});
