
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('req.stale', () => {
  it('should be the inverse of req.fresh', () => {
    const ctx = context();
    ctx.status = 200;
    ctx.method = 'GET';
    ctx.req.headers['if-none-match'] = '"123"';
    ctx.set('ETag', '"123"');
    assert.equal(ctx.fresh, true);
    assert.equal(ctx.stale, false);
  });
});
