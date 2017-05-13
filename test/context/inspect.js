
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.inspect()', () => {
  it('should return a json representation', () => {
    const ctx = context();
    const toJSON = ctx.toJSON(ctx);

    assert.deepEqual(toJSON, ctx.inspect());
  });
});
