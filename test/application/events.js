
'use strict';

const assert = require('assert');
const Koa = require('../..');
const request = require('supertest');

describe('app emits events', () => {
  it('should emit request, respond and responded once and in correct order', async() => {
    const app = new Koa();
    const emitted = [];
    ['request', 'respond', 'responded', 'error'].forEach(event => app.on(event, () => emitted.push(event)));

    app.use((ctx, next) => {
      emitted.push('fistMiddleWare');
      ctx.body = 'hello!';
      return next();
    });

    app.use(ctx => {
      emitted.push('lastMiddleware');
    });

    const server = app.listen();

    await request(server)
      .get('/')
      .expect(200);

    assert.deepStrictEqual(emitted, ['request', 'fistMiddleWare', 'lastMiddleware', 'respond', 'responded']);
  });
});
