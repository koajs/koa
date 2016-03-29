
'use strict';

const AssertRequest = require('assert-request');
const assert = require('assert');
const Koa = require('../..');

describe('app.response', () => {
  const app1 = new Koa();
  app1.response.msg = 'hello';
  const app2 = new Koa();

  it('should merge properties', () => {
    app1.use((ctx, next) => {
      assert.equal(ctx.response.msg, 'hello');
      ctx.status = 204;
    });

    const request = AssertRequest(app1);

    return request('/')
      .status(204);
  });

  it('should not affect the original prototype', () => {
    app2.use((ctx, next) => {
      assert.equal(ctx.response.msg, undefined);
      ctx.status = 204;
    });

    const request = AssertRequest(app1);

    return request('/')
      .status(204);
  });
});
