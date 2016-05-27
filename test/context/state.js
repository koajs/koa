
'use strict';

const AssertRequest = require('assert-request');
const assert = require('assert');
const Koa = require('../..');

describe('ctx.state', () => {
  it('should provide a ctx.state namespace', () => {
    const app = new Koa();

    app.use(ctx => {
      assert.deepEqual(ctx.state, {});
    });

    const request = AssertRequest(app);

    return request('/')
      .status(404);
  });
});
