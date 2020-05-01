
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('app.currentContext', () => {
  it('should get currentContext work', async() => {
    if (!require('async_hooks').AsyncLocalStorage) return;

    const app = new Koa({ asyncLocalStorage: true });

    app.use(async ctx => {
      assert(ctx === app.currentContext);
      await new Promise(resolve => {
        setTimeout(() => {
          assert(ctx === app.currentContext);
          resolve();
        }, 1);
      });
      await new Promise(resolve => {
        assert(ctx === app.currentContext);
        setImmediate(() => {
          assert(ctx === app.currentContext);
          resolve();
        });
      });
      assert(ctx === app.currentContext);
      app.currentContext.body = 'ok';
    });

    const requestServer = () => {
      return request(app.callback()).get('/').expect('ok');
    };

    await Promise.all([
      requestServer(),
      requestServer(),
      requestServer(),
      requestServer(),
      requestServer()
    ]);
  });
});
