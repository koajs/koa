
'use strict';

const request = require('../helpers/request');
const Koa = require('../..');

describe('app.context', () => {
  const app1 = new Koa();
  app1.context.msg = 'hello';
  const app2 = new Koa();

  it('should merge properties', async () => {
    app1.use((ctx, next) => {
      expect(ctx.msg).toBe('hello');
      ctx.status = 204;
    });

    return request(app1, '/').then(res => expect(res.status).toBe(204));
  });

  it('should not affect the original prototype', async () => {
    app2.use((ctx, next) => {
      expect(ctx.msg).toBe(undefined);
      ctx.status = 204;
    });

    return request(app2, '/').then(res => expect(res.status).toBe(204));
  });
});
