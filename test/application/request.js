'use strict';

const request = require('../helpers/request');
const Koa = require('../..');

describe('app.request', () => {
  const app1 = new Koa();
  app1.request.message = 'hello';
  const app2 = new Koa();

  it('should merge properties', async () => {
    app1.use((ctx, next) => {
      expect(ctx.request.message).toBe('hello');
      ctx.status = 204;
    });

    return request(app1, '/').then(res => expect(res.status).toBe(204));
  });

  it('should not affect the original prototype', async () => {
    app2.use((ctx, next) => {
      expect(ctx.request.message).toBe(undefined);
      ctx.status = 204;
    });

    return request(app2, '/').then(res => expect(res.status).toBe(204));
  });
});
