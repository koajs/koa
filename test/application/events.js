
'use strict';

const assert = require('assert');
const Koa = require('../..');
const request = require('supertest');

describe('app emits events', () => {
  it('should emit request, respond and responded once and in correct order', async() => {
    const app = new Koa();
    const emitted = [];
    ['request', 'respond', 'responded', 'error', 'customEvent'].forEach(event => app.on(event, () => emitted.push(event)));

    app.use((ctx, next) => {
      emitted.push('fistMiddleWare');
      ctx.body = 'hello!';
      return next();
    });

    app.use((ctx, next) => {
      ctx.app.emit('customEvent');
      return next();
    });

    app.use(ctx => {
      emitted.push('lastMiddleware');
    });

    const server = app.listen();

    let onceEvents = 0;
    ['request', 'respond', 'responded'].forEach(event =>
      app.once(event, ctx => {
        assert.strictEqual(ctx.app, app);
        onceEvents++;
      })
    );

    await request(server)
      .get('/')
      .expect(200);

    assert.deepStrictEqual(emitted, ['request', 'fistMiddleWare', 'customEvent', 'lastMiddleware', 'respond', 'responded']);
    assert.strictEqual(onceEvents, 3);
  });

  it('should emit error event on middleware throw', async() => {
    const app = new Koa();
    const emitted = [];
    ['request', 'respond', 'responded', 'error'].forEach(event => app.on(event, () => emitted.push(event)));

    app.use((ctx, next) => {
      throw new TypeError('Hello Koa!');
    });

    const server = app.listen();

    let onceEvents = 0;
    app.once('error', (err, ctx) => {
      assert.ok(err instanceof TypeError);
      assert.strictEqual(ctx.app, app);
      onceEvents++;
    });

    await request(server)
      .get('/')
      .expect(500);

    assert.deepStrictEqual(emitted, ['request', 'error', 'respond', 'responded']);
    assert.strictEqual(onceEvents, 1);
  });
});
