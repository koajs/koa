
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('ctx.wrappers', () => {
  it('should provide a ctx.wrappers array', done => {
    const app = new Koa();

    app.use(ctx => {
      assert(ctx.wrappers instanceof Array);
    });

    const server = app.listen();

    request(server)
      .get('/')
      .expect(404)
      .end(done);
  });
});
