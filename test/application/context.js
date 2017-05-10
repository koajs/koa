
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('app.context', () => {
  const app1 = new Koa();
  app1.context.msg = 'hello';
  const app2 = new Koa();

  it('should merge properties', () => {
    app1.use((ctx, next) => {
      assert.equal(ctx.msg, 'hello');
      ctx.status = 204;
    });

    return request(app1.listen())
      .get('/')
      .expect(204);
  });

  it('should not affect the original prototype', () => {
    app2.use((ctx, next) => {
      assert.equal(ctx.msg, undefined);
      ctx.status = 204;
    });

    return request(app2.listen())
      .get('/')
      .expect(204);
  });
});
