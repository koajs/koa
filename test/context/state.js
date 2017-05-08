
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('ctx.state', () => {
  it('should provide a ctx.state namespace', () => {
    const app = new Koa();

    app.use(ctx => {
      assert.deepEqual(ctx.state, {});
    });

    const server = app.listen();

    return request(server)
      .get('/')
      .expect(404);
  });
});
