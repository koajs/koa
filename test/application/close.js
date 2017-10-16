'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('app.context', () => {
  const app1 = new Koa();

  assert.equal(app1.server, null);

  it('server it should be close after apply .close()', () => {
    app1.use((ctx, next) => {
      ctx.status = 200;
    });
    const server = app1.listen();
    assert.ok(typeof app1.server.listen === 'function');
    assert.ok(app1.server.listening);
    request(server)
      .get('/')
      .expect(200);
    // close server
    app1.close(() => {
      assert.equal(app1.server, null);
    });
  });
});
